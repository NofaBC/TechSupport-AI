/**
 * L2 AI Support Agent
 * Advanced troubleshooting with expanded capabilities, VisionScreen integration
 */

import OpenAI from 'openai';
import { retrieveRelevantChunks, assembleContext } from '../knowledge-base/retrieval';
import { redactSecrets, checkEscalationTriggers, validateAIResponse } from './guardrails';
import type { TimelineEvent, Case } from '@/types';

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

export interface L2AgentContext {
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
  // L2 gets full case context
  caseHistory: {
    timeline: TimelineEvent[];
    l1Summary?: string;
    stepsAttempted: string[];
    failedSteps: string[];
  };
  visionScreenActive?: boolean;
  failedAttempts?: number;
}

export interface L2AgentResponse {
  message: string;
  action?: {
    type: string;
    params?: Record<string, unknown>;
  };
  shouldEscalate: boolean;
  escalationReason?: string;
  suggestVisionScreen: boolean;
  diagnosticSteps?: Array<{
    step: string;
    instruction: string;
    expectedOutcome: string;
  }>;
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

// L2 has more powerful function capabilities
const L2_AGENT_FUNCTIONS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'lookup_documentation',
      description: 'Search the knowledge base for detailed technical documentation',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query for documentation',
          },
          depth: {
            type: 'string',
            enum: ['basic', 'detailed', 'expert'],
            description: 'Level of detail needed',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_error',
      description: 'Analyze error messages or logs provided by the customer',
      parameters: {
        type: 'object',
        properties: {
          errorText: {
            type: 'string',
            description: 'The error message or log content',
          },
          context: {
            type: 'string',
            description: 'Additional context about when the error occurred',
          },
        },
        required: ['errorText'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_diagnostic_steps',
      description: 'Generate a list of diagnostic steps for the customer to follow',
      parameters: {
        type: 'object',
        properties: {
          issue: {
            type: 'string',
            description: 'Description of the issue to diagnose',
          },
          complexity: {
            type: 'string',
            enum: ['simple', 'moderate', 'complex'],
            description: 'Complexity level of diagnostics',
          },
        },
        required: ['issue'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'initiate_visionscreen',
      description: 'Start a VisionScreen session for visual troubleshooting',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Why visual assistance is needed',
          },
          focusArea: {
            type: 'string',
            description: 'What the customer should show on their screen',
          },
        },
        required: ['reason', 'focusArea'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_human',
      description: 'Escalate to human support specialist for complex issues',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Detailed reason for escalation',
          },
          summary: {
            type: 'string',
            description: 'Summary of troubleshooting attempted',
          },
          recommendedAction: {
            type: 'string',
            description: 'Suggested next steps for the human agent',
          },
        },
        required: ['reason', 'summary'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_resolved',
      description: 'Mark the case as resolved with detailed resolution notes',
      parameters: {
        type: 'object',
        properties: {
          resolution: {
            type: 'string',
            description: 'Detailed description of how the issue was resolved',
          },
          rootCause: {
            type: 'string',
            description: 'The root cause of the issue',
          },
          preventionTips: {
            type: 'string',
            description: 'Tips to prevent the issue in the future',
          },
        },
        required: ['resolution'],
      },
    },
  },
];

/**
 * Build the system prompt for L2 agent
 */
function buildL2SystemPrompt(
  context: L2AgentContext,
  ragContext: string
): string {
  // Build L1 history summary
  const l1History = context.caseHistory.stepsAttempted.length > 0
    ? `\n## Previous Troubleshooting (L1)\nSteps attempted:\n${context.caseHistory.stepsAttempted.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nFailed steps:\n${context.caseHistory.failedSteps.map((s) => `- ${s}`).join('\n') || 'None'}`
    : '';

  let prompt = `You are TechSupport AI Level 2 (L2), an advanced support agent with expanded troubleshooting capabilities. This case has been escalated from L1 due to complexity.

## Your Enhanced Capabilities
- Deep technical documentation search
- Error log and message analysis
- Complex diagnostic step generation
- VisionScreen™ for visual troubleshooting (screen sharing)
- Detailed root cause analysis
- Escalation to human specialists when needed

## Constraints
- NEVER perform destructive actions
- NEVER share sensitive information
- Always explain technical concepts clearly
- If you need to see the customer's screen, use VisionScreen
- Escalate to human if issue persists after 3+ attempts

## Current Case Context
- Product: ${context.product}
- Category: ${context.category}
- Severity: ${context.severity}
- Language: ${context.language}
- Support Level: L2 (Advanced)
${context.customerName ? `- Customer: ${context.customerName}` : ''}
${context.visionScreenActive ? '- VisionScreen: ACTIVE (you can see their screen)' : ''}
${l1History}
${context.caseHistory.l1Summary ? `\n## L1 Summary\n${context.caseHistory.l1Summary}` : ''}

`;

  if (ragContext) {
    prompt += `## Technical Documentation\n${ragContext}\n\n`;
  }

  prompt += `## L2 Response Guidelines
1. Review what L1 has already tried
2. Ask targeted diagnostic questions
3. Analyze any error messages thoroughly
4. Consider using VisionScreen for visual issues
5. Provide step-by-step technical guidance
6. Document root cause when found
7. Escalate to human only if necessary

When suggesting VisionScreen, explain:
- Why you need to see their screen
- What they should have ready to show
- That the session is secure and temporary

Respond in ${context.language}. Be thorough but clear.`;

  return prompt;
}

/**
 * Process the L2 agent response
 */
export async function processL2Request(
  context: L2AgentContext,
  userMessage: string
): Promise<L2AgentResponse> {
  const startTime = Date.now();
  
  // Redact secrets from user message
  const redactedInput = redactSecrets(userMessage);
  const safeUserMessage = redactedInput.text;
  
  // Check for escalation triggers
  const escalationCheck = checkEscalationTriggers(safeUserMessage, {
    failedAttempts: context.failedAttempts,
    severity: context.severity,
    customerRequested: safeUserMessage.toLowerCase().includes('speak to human'),
  });
  
  // Critical issues go straight to human at L2
  if (escalationCheck.shouldEscalate && escalationCheck.severity === 'critical') {
    return {
      message: "I understand this is a critical issue that requires immediate human attention. I'm connecting you with a senior support specialist right now.",
      shouldEscalate: true,
      escalationReason: escalationCheck.reasons.join('; '),
      suggestVisionScreen: false,
      metadata: {
        model: 'gpt-4',
        tokensUsed: 0,
        ragChunksUsed: 0,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }
  
  // Retrieve RAG context with more depth for L2
  let ragContext = '';
  let ragSources: L2AgentResponse['sources'] = [];
  
  try {
    const chunks = await retrieveRelevantChunks(
      context.tenantId,
      safeUserMessage,
      {
        product: context.product,
        topK: 8, // More context for L2
      }
    );
    
    if (chunks.length > 0) {
      ragContext = assembleContext(chunks, 3000); // Larger context window
      ragSources = chunks.map((c) => ({
        docId: c.metadata.docId,
        content: c.content.substring(0, 300) + '...',
        score: c.score,
      }));
    }
  } catch (error) {
    console.error('RAG retrieval error:', error);
  }
  
  // Build system prompt
  const systemPrompt = buildL2SystemPrompt(context, ragContext);
  
  // Build messages array
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
    { role: 'user', content: safeUserMessage },
  ];
  
  // Call OpenAI with GPT-4 for L2
  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4',
    messages,
    tools: L2_AGENT_FUNCTIONS,
    tool_choice: 'auto',
    temperature: 0.5, // More focused for L2
    max_tokens: 1500, // Longer responses for L2
  });
  
  const choice = completion.choices[0];
  const responseMessage = choice.message;
  
  // Process function calls
  let action: L2AgentResponse['action'];
  let shouldEscalate = false;
  let escalationReason: string | undefined;
  let suggestVisionScreen = false;
  let diagnosticSteps: L2AgentResponse['diagnosticSteps'];
  
  if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    const toolCall = responseMessage.tool_calls[0];
    const funcCall = 'function' in toolCall ? toolCall.function : null;
    
    if (funcCall) {
      const functionName = funcCall.name;
      const functionArgs = JSON.parse(funcCall.arguments);
      
      action = {
        type: functionName,
        params: functionArgs,
      };
      
      // Handle specific functions
      if (functionName === 'escalate_to_human') {
        shouldEscalate = true;
        escalationReason = functionArgs.reason;
      } else if (functionName === 'initiate_visionscreen') {
        suggestVisionScreen = true;
      } else if (functionName === 'suggest_diagnostic_steps') {
        // Generate diagnostic steps based on the issue
        diagnosticSteps = generateDiagnosticSteps(functionArgs.issue, functionArgs.complexity);
      }
    }
  }
  
  // Get response content
  let responseContent = responseMessage.content || '';
  
  // Validate response
  const validation = validateAIResponse(responseContent);
  if (!validation.valid) {
    responseContent = validation.sanitizedResponse;
  }
  
  return {
    message: responseContent,
    action,
    shouldEscalate,
    escalationReason,
    suggestVisionScreen,
    diagnosticSteps,
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
 * Generate diagnostic steps based on issue
 */
function generateDiagnosticSteps(
  issue: string,
  complexity: string = 'moderate'
): L2AgentResponse['diagnosticSteps'] {
  // This would be more sophisticated in production
  // For now, return template steps based on common patterns
  const steps: L2AgentResponse['diagnosticSteps'] = [];
  
  const issueLower = issue.toLowerCase();
  
  if (issueLower.includes('connection') || issueLower.includes('network')) {
    steps.push(
      {
        step: 'Check Network Status',
        instruction: 'Run a network diagnostic: ping google.com and note any packet loss',
        expectedOutcome: '0% packet loss indicates healthy connection',
      },
      {
        step: 'Verify DNS Resolution',
        instruction: 'Try nslookup for our service domain and check the resolved IP',
        expectedOutcome: 'Should resolve to valid IP addresses',
      },
      {
        step: 'Check Firewall/Proxy',
        instruction: 'Verify that ports 443 and 80 are not blocked by firewall or proxy',
        expectedOutcome: 'Connections should not be blocked',
      }
    );
  } else if (issueLower.includes('error') || issueLower.includes('crash')) {
    steps.push(
      {
        step: 'Capture Error Details',
        instruction: 'Screenshot the exact error message including any error codes',
        expectedOutcome: 'Full error message captured for analysis',
      },
      {
        step: 'Check Application Logs',
        instruction: 'Navigate to Settings > Logs and export the last hour of activity',
        expectedOutcome: 'Log file ready for review',
      },
      {
        step: 'Clear Cache and Retry',
        instruction: 'Clear application cache, restart, and attempt the action again',
        expectedOutcome: 'Issue may resolve after cache clear',
      }
    );
  } else if (issueLower.includes('slow') || issueLower.includes('performance')) {
    steps.push(
      {
        step: 'Check System Resources',
        instruction: 'Open Task Manager/Activity Monitor and note CPU/Memory usage',
        expectedOutcome: 'Identify if system resources are constrained',
      },
      {
        step: 'Test Network Speed',
        instruction: 'Run a speed test at speedtest.net and note download/upload speeds',
        expectedOutcome: 'Minimum 10Mbps recommended for optimal performance',
      },
      {
        step: 'Disable Extensions',
        instruction: 'Temporarily disable browser extensions and retry',
        expectedOutcome: 'Determine if extensions are causing slowdown',
      }
    );
  } else {
    // Generic diagnostic steps
    steps.push(
      {
        step: 'Document Current State',
        instruction: 'Note exactly what you see on screen and what you expected to see',
        expectedOutcome: 'Clear understanding of the discrepancy',
      },
      {
        step: 'Reproduce the Issue',
        instruction: 'Try to repeat the exact steps that led to the problem',
        expectedOutcome: 'Confirm if issue is reproducible',
      },
      {
        step: 'Try Alternative Method',
        instruction: 'Attempt to achieve the same goal using a different approach',
        expectedOutcome: 'Determine if issue is specific to one method',
      }
    );
  }
  
  return steps;
}

/**
 * Generate L2 escalation summary from L1 history
 */
export function generateL2EscalationSummary(
  timeline: TimelineEvent[],
  caseData: Partial<Case>
): string {
  const aiResponses = timeline.filter((e) => e.type === 'ai_response' && e.level === 'L1');
  const stepsAttempted = timeline.filter((e) => e.type === 'step_attempted');
  
  let summary = `## Case Summary for L2 Review\n\n`;
  summary += `**Product**: ${caseData.product || 'Unknown'}\n`;
  summary += `**Category**: ${caseData.category || 'General'}\n`;
  summary += `**Severity**: ${caseData.severity || 'medium'}\n\n`;
  
  if (stepsAttempted.length > 0) {
    summary += `### Steps Attempted by L1\n`;
    stepsAttempted.forEach((step, i) => {
      const outcome = step.metadata?.outcome || 'unknown';
      summary += `${i + 1}. ${step.content} — ${outcome}\n`;
    });
    summary += '\n';
  }
  
  if (aiResponses.length > 0) {
    summary += `### L1 Interaction Summary\n`;
    summary += `- Total L1 responses: ${aiResponses.length}\n`;
    const lastResponse = aiResponses[aiResponses.length - 1];
    summary += `- Last L1 response: "${lastResponse.content.substring(0, 200)}..."\n`;
  }
  
  return summary;
}
