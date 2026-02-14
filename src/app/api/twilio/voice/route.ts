import { NextRequest, NextResponse } from 'next/server';
import { createCase, addTimelineEvent } from '@/lib/firebase/cases';
import { processL1Request } from '@/lib/ai/l1-agent';
import {
  createCallGreeting,
  createAIResponse,
  createEscalationResponse,
  createErrorResponse,
  createGoodbye,
} from '@/lib/twilio/twiml';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Handle inbound voice calls
 * POST /api/twilio/voice
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    const {
      CallSid,
      From,
      To,
      CallStatus,
      SpeechResult,
      Digits,
    } = params;
    
    // Detect language from request (could be from URL param or default)
    const url = new URL(request.url);
    const language = url.searchParams.get('lang') || 'en';
    const caseId = url.searchParams.get('caseId');
    const tenantId = url.searchParams.get('tenantId') || 'demo-tenant';
    
    // If user pressed 1, escalate to human immediately
    if (Digits === '1') {
      return new NextResponse(createEscalationResponse(language), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // Initial call - create case and greet
    if (!caseId && CallStatus === 'ringing') {
      // Create a new support case
      const newCase = await createCase(tenantId, {
        tenantId,
        product: 'General',
        category: 'phone_support',
        severity: 'medium',
        language,
        status: 'open',
        currentLevel: 'L1',
        customerContact: {
          phone: From,
        },
      });
      
      // Log timeline event
      await addTimelineEvent(tenantId, newCase.id!, {
        type: 'call_started',
        level: 'L1',
        content: `Inbound call from ${From}`,
        metadata: {
          callSid: CallSid,
          from: From,
          to: To,
        },
        createdBy: 'system',
      });
      
      // Return greeting with gather
      const gatherUrl = `${APP_URL}/api/twilio/voice?lang=${language}&caseId=${newCase.id}&tenantId=${tenantId}`;
      return new NextResponse(createCallGreeting(language, gatherUrl), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // Handle speech input
    if (SpeechResult && caseId) {
      // Process with L1 AI
      const aiResponse = await processL1Request(
        {
          tenantId,
          caseId,
          product: 'General',
          category: 'phone_support',
          language,
          severity: 'medium',
          conversationHistory: [],
        },
        SpeechResult
      );
      
      // Log AI interaction
      await addTimelineEvent(tenantId, caseId, {
        type: 'ai_response',
        level: 'L1',
        content: aiResponse.message,
        metadata: {
          userInput: SpeechResult,
          tokensUsed: aiResponse.metadata.tokensUsed,
          shouldEscalate: aiResponse.shouldEscalate,
        },
        createdBy: 'ai',
      });
      
      // Check if escalation is needed
      if (aiResponse.shouldEscalate) {
        await addTimelineEvent(tenantId, caseId, {
          type: 'escalation',
          level: aiResponse.escalationLevel === 'L3' ? 'L3' : 'L2',
          content: `Escalating to ${aiResponse.escalationLevel}: ${aiResponse.escalationReason}`,
          metadata: {
            reason: aiResponse.escalationReason,
          },
          createdBy: 'ai',
        });
        
        if (aiResponse.escalationLevel === 'L3') {
          return new NextResponse(createEscalationResponse(language), {
            headers: { 'Content-Type': 'text/xml' },
          });
        }
      }
      
      // Continue conversation
      const continueUrl = `${APP_URL}/api/twilio/voice?lang=${language}&caseId=${caseId}&tenantId=${tenantId}`;
      return new NextResponse(
        createAIResponse(aiResponse.message, language, continueUrl),
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }
    
    // No input received - prompt again or end call
    if (caseId) {
      const continueUrl = `${APP_URL}/api/twilio/voice?lang=${language}&caseId=${caseId}&tenantId=${tenantId}`;
      return new NextResponse(
        createAIResponse(
          "I didn't catch that. Could you please repeat your question?",
          language,
          continueUrl
        ),
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }
    
    // Fallback - end call gracefully
    return new NextResponse(createGoodbye(language), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Voice webhook error:', error);
    return new NextResponse(createErrorResponse('en'), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
