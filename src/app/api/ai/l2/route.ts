import { NextRequest, NextResponse } from 'next/server';
import { processL2Request, type L2AgentContext } from '@/lib/ai/l2-agent';
import { getTimelineEvents } from '@/lib/firebase/cases';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      tenantId,
      caseId,
      product,
      category,
      language = 'en',
      severity = 'medium',
      customerName,
      message,
      conversationHistory = [],
      l1Summary,
      stepsAttempted = [],
      failedSteps = [],
      visionScreenActive = false,
      failedAttempts = 0,
    } = body;

    if (!tenantId || !caseId || !product) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, caseId, product' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get timeline for context
    let timeline: Awaited<ReturnType<typeof getTimelineEvents>> = [];
    try {
      timeline = await getTimelineEvents(tenantId, caseId);
    } catch (e) {
      console.warn('Could not fetch timeline:', e);
    }

    // Build L2 context
    const context: L2AgentContext = {
      tenantId,
      caseId,
      product,
      category: category || 'general',
      language,
      severity,
      customerName,
      conversationHistory,
      caseHistory: {
        timeline,
        l1Summary,
        stepsAttempted,
        failedSteps,
      },
      visionScreenActive,
      failedAttempts,
    };

    // Process with L2 agent
    const response = await processL2Request(context, message);

    return NextResponse.json(response);
  } catch (error) {
    console.error('L2 AI error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process L2 request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
