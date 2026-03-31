import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { processL1Request, L1AgentContext } from '@/lib/ai/l1-agent';
import { sendL3EscalationSlack } from '@/lib/notifications/slack';

interface ReplyRequest {
  message: string;
  customerEmail: string;
  customerName?: string;
}

interface ReplyResponse {
  success: boolean;
  aiResponse?: string;
  shouldEscalate?: boolean;
  escalationLevel?: string;
  error?: string;
}

/**
 * POST /api/cases/[id]/reply
 * 
 * Add a customer reply to an existing case and get AI response.
 * This is called by CommandDesk AI when a customer replies to an existing case thread.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ReplyResponse>> {
  try {
    const { id: caseId } = await params;
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID required' }, { status: 400 });
    }
    
    const body: ReplyRequest = await request.json();
    
    if (!body.message) {
      return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }
    
    // Get the existing case
    const caseRef = db.collection('tenants').doc(tenantId).collection('cases').doc(caseId);
    const caseDoc = await caseRef.get();
    
    if (!caseDoc.exists) {
      return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
    }
    
    const caseData = caseDoc.data()!;
    
    // Get conversation history from timeline
    const timelineSnapshot = await caseRef
      .collection('timeline')
      .orderBy('createdAt', 'asc')
      .get();
    
    const conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
    
    // Add initial problem as first customer message
    if (caseData.problem) {
      conversationHistory.push({ role: 'user', content: caseData.problem });
    }
    
    // Build conversation from timeline
    for (const doc of timelineSnapshot.docs) {
      const event = doc.data();
      if (event.type === 'ai_response' && event.content) {
        conversationHistory.push({ role: 'assistant', content: event.content });
      } else if (event.type === 'customer_reply' && event.content) {
        conversationHistory.push({ role: 'user', content: event.content });
      } else if (event.type === 'agent_response' && event.content) {
        conversationHistory.push({ role: 'assistant', content: event.content });
      }
    }
    
    // Add the new customer reply to timeline
    await caseRef.collection('timeline').add({
      type: 'customer_reply',
      level: caseData.currentLevel || 'L1',
      content: body.message,
      metadata: {
        customerEmail: body.customerEmail,
        customerName: body.customerName,
      },
      createdBy: 'customer',
      createdAt: new Date(),
    });
    
    // Add new message to conversation history
    conversationHistory.push({ role: 'user', content: body.message });
    
    // Update case status back to open (customer responded)
    await caseRef.update({
      status: 'open',
      updatedAt: new Date(),
    });
    
    // Process with L1 AI including conversation history
    const context: L1AgentContext = {
      tenantId,
      caseId,
      product: caseData.product || 'unknown',
      category: caseData.category || 'general',
      language: caseData.language || 'en',
      severity: caseData.severity || 'medium',
      customerName: body.customerName || caseData.customerContact?.name,
      conversationHistory,
      failedAttempts: caseData.failedAttempts || 0,
    };
    
    const l1Result = await processL1Request(context, body.message);
    
    // Add AI response to timeline
    await caseRef.collection('timeline').add({
      type: 'ai_response',
      level: 'L1',
      content: l1Result.message,
      metadata: {
        model: l1Result.metadata.model || 'gpt-4',
        tokensUsed: l1Result.metadata.tokensUsed || 0,
        ragChunksUsed: l1Result.metadata.ragChunksUsed || 0,
        processingTimeMs: l1Result.metadata.processingTimeMs || 0,
        isFollowUp: true,
      },
      createdBy: 'ai',
      createdAt: new Date(),
    });
    
    // Handle escalation or status update
    if (l1Result.shouldEscalate) {
      const newStatus = l1Result.escalationLevel === 'L3' ? 'escalated_human' : 'escalated_L2';
      await caseRef.update({
        status: newStatus,
        currentLevel: l1Result.escalationLevel,
        updatedAt: new Date(),
      });
      
      // Send Slack notification for escalation
      if (l1Result.escalationLevel === 'L3') {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tech-support-ai-one.vercel.app';
        await sendL3EscalationSlack({
          caseId,
          caseNumber: caseData.ticketNumber,
          customerName: body.customerName || caseData.customerContact?.name || 'Customer',
          priority: caseData.severity,
          summary: `Follow-up escalated: ${body.message.substring(0, 100)}`,
          escalationReason: l1Result.escalationReason || 'Escalated after follow-up',
          dashboardUrl: `${baseUrl}/en/dashboard/cases/${caseId}`,
        });
      }
    } else {
      // Check if AI is asking questions or providing a solution
      const isAskingQuestions = /\?\s*(\n|$)/.test(l1Result.message) && 
        (l1Result.message.toLowerCase().includes('could you') ||
         l1Result.message.toLowerCase().includes('can you') ||
         l1Result.message.toLowerCase().includes('please confirm') ||
         l1Result.message.toLowerCase().includes('please check') ||
         l1Result.message.toLowerCase().includes('please provide') ||
         l1Result.message.toLowerCase().includes('let me know') ||
         l1Result.message.toLowerCase().includes('i look forward'));
      
      if (isAskingQuestions) {
        await caseRef.update({
          status: 'awaiting_customer',
          updatedAt: new Date(),
        });
      } else {
        // AI provided a solution - auto-resolve
        await caseRef.update({
          status: 'resolved',
          summary: 'Resolved by L1 AI',
          resolvedAt: new Date(),
          updatedAt: new Date(),
        });
        
        await caseRef.collection('timeline').add({
          type: 'resolved',
          level: 'L1',
          content: 'Case auto-resolved after L1 AI follow-up response',
          metadata: {},
          createdBy: 'system',
          createdAt: new Date(),
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      aiResponse: l1Result.message,
      shouldEscalate: l1Result.shouldEscalate,
      escalationLevel: l1Result.escalationLevel,
    });
    
  } catch (error) {
    console.error('Error processing reply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process reply' },
      { status: 500 }
    );
  }
}
