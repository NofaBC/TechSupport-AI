import { NextRequest, NextResponse } from 'next/server';
import { twiml } from 'twilio';
import { createCase, getCasesByPhone, addTimelineEvent, updateCase } from '@/lib/firebase/cases';
import { processL1Request } from '@/lib/ai/l1-agent';

/**
 * Handle inbound SMS messages
 * POST /api/twilio/sms
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    const {
      MessageSid,
      From,
      To,
      Body,
    } = params;
    
    // Default tenant (in production, map phone number to tenant)
    const tenantId = 'demo-tenant';
    const language = detectLanguage(Body);
    
    // Check for existing open case from this phone number
    let caseId: string | undefined;
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    const existingCases = await getCasesByPhone(tenantId, From);
    const openCase = existingCases.find(
      (c) => c.status === 'open' || c.status === 'pending'
    );
    
    if (openCase && openCase.id) {
      caseId = openCase.id;
      // TODO: Load conversation history from timeline
    } else {
      // Create new case
      const newCase = await createCase(tenantId, {
        tenantId,
        product: 'General',
        category: 'sms_support',
        severity: 'medium',
        language,
        status: 'open',
        currentLevel: 'L1',
        customerContact: {
          phone: From,
        },
      });
      caseId = newCase.id!;
      
      // Log case creation
      await addTimelineEvent(tenantId, caseId, {
        type: 'sms_sent',
        level: 'L1',
        content: `New SMS conversation started from ${From}`,
        metadata: {
          messageSid: MessageSid,
          from: From,
          to: To,
        },
        createdBy: 'system',
      });
    }
    
    // Log incoming message
    await addTimelineEvent(tenantId, caseId, {
      type: 'sms_sent',
      level: 'L1',
      content: Body,
      metadata: {
        messageSid: MessageSid,
        direction: 'inbound',
      },
      createdBy: 'system',
    });
    
    // Check for special commands
    if (Body.toLowerCase().trim() === 'human' || Body.toLowerCase().trim() === 'agent') {
      // Escalate to human
      await updateCase(tenantId, caseId, {
        status: 'escalated_human',
        currentLevel: 'L3',
      });
      
      await addTimelineEvent(tenantId, caseId, {
        type: 'escalation',
        level: 'L3',
        content: 'Customer requested human agent via SMS',
        metadata: {},
        createdBy: 'system',
      });
      
      const response = new twiml.MessagingResponse();
      response.message(
        "Your request has been escalated to a human support specialist. They will contact you shortly. Reply 'STATUS' to check your case status."
      );
      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    if (Body.toLowerCase().trim() === 'status') {
      const response = new twiml.MessagingResponse();
      const statusMessage = openCase
        ? `Your case #${caseId?.substring(0, 8)} is currently ${openCase.status}. Level: ${openCase.currentLevel}`
        : 'No active case found. Send a message to start a new support conversation.';
      response.message(statusMessage);
      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // Process with L1 AI
    const aiResponse = await processL1Request(
      {
        tenantId,
        caseId,
        product: 'General',
        category: 'sms_support',
        language,
        severity: 'medium',
        conversationHistory,
      },
      Body
    );
    
    // Log AI response
    await addTimelineEvent(tenantId, caseId, {
      type: 'ai_response',
      level: 'L1',
      content: aiResponse.message,
      metadata: {
        tokensUsed: aiResponse.metadata.tokensUsed,
        ragChunksUsed: aiResponse.metadata.ragChunksUsed,
        shouldEscalate: aiResponse.shouldEscalate,
      },
      createdBy: 'ai',
    });
    
    // Handle escalation
    if (aiResponse.shouldEscalate) {
      await updateCase(tenantId, caseId, {
        status: aiResponse.escalationLevel === 'L3' ? 'escalated_human' : 'escalated_L2',
        currentLevel: aiResponse.escalationLevel || 'L2',
      });
      
      await addTimelineEvent(tenantId, caseId, {
        type: 'escalation',
        level: aiResponse.escalationLevel || 'L2',
        content: `Escalation: ${aiResponse.escalationReason}`,
        metadata: {
          reason: aiResponse.escalationReason,
        },
        createdBy: 'ai',
      });
    }
    
    // Build SMS response
    const response = new twiml.MessagingResponse();
    
    // Truncate long messages for SMS (160 char limit for single SMS)
    let replyMessage = aiResponse.message;
    if (replyMessage.length > 1500) {
      replyMessage = replyMessage.substring(0, 1497) + '...';
    }
    
    // Add escalation notice if needed
    if (aiResponse.shouldEscalate && aiResponse.escalationLevel === 'L3') {
      replyMessage += "\n\n[A human support specialist will contact you shortly. Reply 'STATUS' to check your case status.]";
    }
    
    response.message(replyMessage);
    
    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('SMS webhook error:', error);
    
    const response = new twiml.MessagingResponse();
    response.message(
      "We're experiencing technical difficulties. Please try again later or call our support line."
    );
    
    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

/**
 * Simple language detection based on common patterns
 */
function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based detection
  if (/bonjour|merci|s'il vous plaît|problème/i.test(text)) return 'fr';
  if (/hallo|danke|bitte|hilfe/i.test(text)) return 'de';
  if (/ciao|grazie|prego|aiuto/i.test(text)) return 'it';
  if (/你好|谢谢|帮助|问题/i.test(text)) return 'zh';
  if (/سلام|متشکرم|کمک|مشکل/i.test(text)) return 'fa';
  
  return 'en';
}

