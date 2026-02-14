/**
 * L1 AI Support Agent
 * Uses OpenAI GPT-4 with function calling, RAG retrieval, and playbook constraints
 */

import OpenAI from 'openai';
import { retrieveRelevantChunks, assembleContext } from '../knowledge-base/retrieval';
import { findPlaybooks, getCurrentStep, formatInstruction } from '../playbooks/engine';
import { redactSecrets, checkEscalationTriggers, validateAIResponse } from './guardrails';
import type { Playbook, PlaybookExecutionState } from '../playbooks/types';

// Lazy-initialized OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface L1AgentContext {
  tenantId: string;
  caseId: string;
  product: string;
  category: string;
  language: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  customerName?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  playbookState?: PlaybookExecutionState;
  failedAttempts?: number;
}

export interface L1AgentResponse {
  message: string;
  action?: {
    type: string;
    params?: Record<string, unknown>;
  };
  shouldEscalate: boolean;
  escalationReason?: string;
  escalationLevel?: 'L2' | 'L3';
  playbookStep?: {
    id: string;
    title: string;
    instruction: string;
  };
  sources?: Array<{
    docId: string;
    content: string;
    score: number;
  }>;
  metadata: {
    model: string;
    tokensUsed: number;
    ragChunksUsed: number;
    processingTimeMs: number;
  };
}

// Function definitions for OpenAI function calling
const AGENT_FUNCTIONS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'lookup_documentation',
      description: 'Search the knowledge base for relevant documentation',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query for documentation',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'execute_playbook_step',
      description: 'Execute the current step in the support playbook',
      parameters: {
        type: 'object',
        properties: {
          stepId: {
            type: 'string',
            description: 'The ID of the step to execute',
          },
          outcome: {
            type: 'string',
            enum: ['success', 'failure'],
            description: 'The outcome of the step',
          },
          notes: {
            type: 'string',
            description: 'Optional notes about the step execution',
          },
        },
        required: ['stepId', 'outcome'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_l2',
      description: 'Escalate the case to L2 support for advanced troubleshooting',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for escalation',
          },
          summary: {
            type: 'string',
            description: 'Summary of what has been tried',
          },
        },
        required: ['reason', 'summary'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_human',
      description: 'Escalate the case to a human support agent',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for human escalation',
          },
          urgency: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Urgency level',
          },
        },
        required: ['reason', 'urgency'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_resolved',
      description: 'Mark the case as resolved',
      parameters: {
        type: 'object',
        properties: {
          resolution: {
            type: 'string',
            description: 'Description of how the issue was resolved',
          },
        },
        required: ['resolution'],
      },
    },
  },
];

/**
 * Build the system prompt for L1 agent
 */
function buildSystemPrompt(
  context: L1AgentContext,
  ragContext: string,
  playbook?: Playbook
): string {
  let prompt = `You are TechSupport AI, a Level 1 (L1) support agent. You help customers with technical issues using a structured approach.

## Your Capabilities
- Search knowledge base documentation
- Guide customers through troubleshooting steps
- Execute playbook steps for common issues
- Escalate to L2 (advanced AI) when needed
- Escalate to human agents for complex cases

## Constraints
- NEVER perform destructive actions (delete accounts, modify billing, etc.)
- NEVER share sensitive information (passwords, API keys, etc.)
- Always be polite and professional
- Keep responses concise but helpful
- If unsure, escalate rather than guess

## Current Case Context
- Product: ${context.product}
- Category: ${context.category}
- Severity: ${context.severity}
- Language: ${context.language}
${context.customerName ? `- Customer: ${context.customerName}` : ''}

`;

  // Add RAG context if available
  if (ragContext) {
    prompt += `## Relevant Documentation
${ragContext}

`;
  }

  // Add playbook context if available
  if (playbook && context.playbookState) {
    const currentStep = getCurrentStep(playbook, context.playbookState);
    if (currentStep) {
      const instruction = formatInstruction(
        currentStep.instruction,
        context.playbookState.variables
      );
      prompt += `## Current Playbook: ${playbook.metadata.name}
**Current Step (${currentStep.id})**: ${currentStep.title}
**Instructions**: ${instruction}
${currentStep.expectedOutcome ? `**Expected Outcome**: ${currentStep.expectedOutcome}` : ''}

Follow this playbook step. If the customer confirms success, mark the step as successful. If they report failure, follow the failure path or escalate if needed.

`;
    }
  }

  prompt += `## Response Guidelines
1. First, try to understand the customer's issue
2. Search documentation if you need more information
3. Guide the customer through troubleshooting steps
4. If following a playbook, stick to the current step
5. Escalate if:
   - The issue is beyond L1 scope
   - Multiple attempts have failed
   - Customer requests human assistance
   - Security/compliance concerns arise

Respond in ${context.language}.`;

  return prompt;
}

/**
 * Process the L1 agent response
 */
export async function processL1Request(
  context: L1AgentContext,
  userMessage: string
): Promise<L1AgentResponse> {
  const startTime = Date.now();
  
  // Redact secrets from user message
  const redactedInput = redactSecrets(userMessage);
  const safeUserMessage = redactedInput.text;
  
  // Check for escalation triggers
  const escalationCheck = checkEscalationTriggers(safeUserMessage, {
    failedAttempts: context.failedAttempts,
    severity: context.severity,
    customerRequested: safeUserMessage.toLowerCase().includes('speak to human') ||
      safeUserMessage.toLowerCase().includes('talk to person'),
  });
  
  // If escalation is triggered, return early
  if (escalationCheck.shouldEscalate && escalationCheck.severity === 'critical') {
    return {
      message: "I understand this is a critical matter. I'm connecting you with a human support specialist right away who can assist you better.",
      shouldEscalate: true,
      escalationReason: escalationCheck.reasons.join('; '),
      escalationLevel: 'L3',
      metadata: {
        model: 'gpt-4',
        tokensUsed: 0,
        ragChunksUsed: 0,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }
  
  // Retrieve RAG context
  let ragContext = '';
  let ragSources: L1AgentResponse['sources'] = [];
  
  try {
    const chunks = await retrieveRelevantChunks(
      context.tenantId,
      safeUserMessage,
      {
        product: context.product,
        topK: 5,
      }
    );
    
    if (chunks.length > 0) {
      ragContext = assembleContext(chunks);
      ragSources = chunks.map((c) => ({
        docId: c.metadata.docId,
        content: c.content.substring(0, 200) + '...',
        score: c.score,
      }));
    }
  } catch (error) {
    console.error('RAG retrieval error:', error);
    // Continue without RAG context
  }
  
  // Find relevant playbook
  let playbook: Playbook | undefined;
  try {
    const playbooks = findPlaybooks({
      product: context.product,
      category: context.category,
      keywords: safeUserMessage.split(' ').filter((w) => w.length > 3),
    });
    playbook = playbooks[0]; // Use first matching playbook
  } catch (error) {
    console.error('Playbook lookup error:', error);
  }
  
  // Build system prompt
  const systemPrompt = buildSystemPrompt(context, ragContext, playbook);
  
  // Build messages array
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
    { role: 'user', content: safeUserMessage },
  ];
  
  // Call OpenAI
  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4',
    messages,
    tools: AGENT_FUNCTIONS,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 1000,
  });
  
  const choice = completion.choices[0];
  const responseMessage = choice.message;
  
  // Process function calls if any
  let action: L1AgentResponse['action'];
  let shouldEscalate = escalationCheck.shouldEscalate;
  let escalationReason = escalationCheck.reasons.join('; ');
  let escalationLevel: L1AgentResponse['escalationLevel'];
  
  if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    const toolCall = responseMessage.tool_calls[0];
    // Handle both function and custom tool call types
    const funcCall = 'function' in toolCall ? toolCall.function : null;
    
    if (funcCall) {
      const functionName = funcCall.name;
      const functionArgs = JSON.parse(funcCall.arguments);
      
      action = {
        type: functionName,
        params: functionArgs,
      };
      
      // Handle escalation functions
      if (functionName === 'escalate_to_l2') {
        shouldEscalate = true;
        escalationReason = functionArgs.reason;
        escalationLevel = 'L2';
      } else if (functionName === 'escalate_to_human') {
        shouldEscalate = true;
        escalationReason = functionArgs.reason;
        escalationLevel = 'L3';
      }
    }
  }
  
  // Get response content
  let responseContent = responseMessage.content || '';
  
  // Validate and sanitize response
  const validation = validateAIResponse(responseContent);
  if (!validation.valid) {
    responseContent = validation.sanitizedResponse;
    console.warn('AI response validation issues:', validation.issues);
  }
  
  // Build playbook step info
  let playbookStep: L1AgentResponse['playbookStep'];
  if (playbook && context.playbookState) {
    const currentStep = getCurrentStep(playbook, context.playbookState);
    if (currentStep) {
      playbookStep = {
        id: currentStep.id,
        title: currentStep.title,
        instruction: formatInstruction(
          currentStep.instruction,
          context.playbookState.variables
        ),
      };
    }
  }
  
  return {
    message: responseContent,
    action,
    shouldEscalate,
    escalationReason: shouldEscalate ? escalationReason : undefined,
    escalationLevel,
    playbookStep,
    sources: ragSources.length > 0 ? ragSources : undefined,
    metadata: {
      model: completion.model,
      tokensUsed: completion.usage?.total_tokens || 0,
      ragChunksUsed: ragSources.length,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

/**
 * Generate a greeting message for new cases
 */
export function generateGreeting(
  language: string,
  customerName?: string
): string {
  const greetings: Record<string, string> = {
    en: `Hello${customerName ? ` ${customerName}` : ''}! I'm your AI support assistant. I'm here to help you with your technical issue. Could you please describe what problem you're experiencing?`,
    fr: `Bonjour${customerName ? ` ${customerName}` : ''} ! Je suis votre assistant de support IA. Je suis là pour vous aider avec votre problème technique. Pourriez-vous décrire le problème que vous rencontrez ?`,
    de: `Hallo${customerName ? ` ${customerName}` : ''}! Ich bin Ihr KI-Support-Assistent. Ich bin hier, um Ihnen bei Ihrem technischen Problem zu helfen. Könnten Sie bitte beschreiben, welches Problem Sie haben?`,
    it: `Ciao${customerName ? ` ${customerName}` : ''}! Sono il tuo assistente di supporto AI. Sono qui per aiutarti con il tuo problema tecnico. Potresti descrivere quale problema stai riscontrando?`,
    zh: `您好${customerName ? ` ${customerName}` : ''}！我是您的AI支持助手。我在这里帮助您解决技术问题。请问您遇到了什么问题？`,
    fa: `سلام${customerName ? ` ${customerName}` : ''}! من دستیار پشتیبانی هوش مصنوعی شما هستم. من اینجا هستم تا در مورد مشکل فنی شما کمک کنم. لطفاً مشکلی که با آن مواجه هستید را توضیح دهید؟`,
  };
  
  return greetings[language] || greetings.en;
}

/**
 * Generate a handoff message when escalating
 */
export function generateEscalationMessage(
  level: 'L2' | 'L3',
  language: string,
  reason?: string
): string {
  const messages: Record<string, Record<string, string>> = {
    en: {
      L2: "I'm transferring you to our advanced support system for more specialized assistance. Please hold on while I prepare the handoff.",
      L3: "I'm connecting you with a human support specialist who can better assist you with this matter. They will be with you shortly.",
    },
    fr: {
      L2: "Je vous transfère vers notre système de support avancé pour une assistance plus spécialisée. Veuillez patienter pendant que je prépare le transfert.",
      L3: "Je vous mets en contact avec un spécialiste du support humain qui pourra mieux vous aider. Il sera avec vous sous peu.",
    },
    de: {
      L2: "Ich verbinde Sie mit unserem erweiterten Support-System für speziellere Hilfe. Bitte warten Sie, während ich die Übergabe vorbereite.",
      L3: "Ich verbinde Sie mit einem menschlichen Support-Spezialisten, der Ihnen bei dieser Angelegenheit besser helfen kann. Er wird in Kürze bei Ihnen sein.",
    },
    it: {
      L2: "Ti sto trasferendo al nostro sistema di supporto avanzato per un'assistenza più specializzata. Attendi mentre preparo il passaggio.",
      L3: "Ti sto collegando con uno specialista del supporto umano che può assisterti meglio in questa questione. Sarà con te a breve.",
    },
    zh: {
      L2: "我正在将您转接到我们的高级支持系统，以获得更专业的帮助。请稍等，我正在准备转接。",
      L3: "我正在为您联系人工支持专家，他们可以更好地帮助您处理这个问题。他们很快就会与您联系。",
    },
    fa: {
      L2: "من شما را به سیستم پشتیبانی پیشرفته ما منتقل می‌کنم برای کمک تخصصی‌تر. لطفاً صبر کنید تا انتقال را آماده کنم.",
      L3: "من شما را به یک متخصص پشتیبانی انسانی متصل می‌کنم که می‌تواند بهتر به شما در این مورد کمک کند. آنها به زودی با شما خواهند بود.",
    },
  };
  
  const langMessages = messages[language] || messages.en;
  return langMessages[level];
}
