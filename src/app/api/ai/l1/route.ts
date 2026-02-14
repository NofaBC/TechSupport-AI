import { NextRequest, NextResponse } from 'next/server';
import { processL1Request, generateGreeting, type L1AgentContext } from '@/lib/ai/l1-agent';

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
      playbookState,
      failedAttempts = 0,
      isNewCase = false,
    } = body;

    // Validate required fields
    if (!tenantId || !caseId || !product) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, caseId, product' },
        { status: 400 }
      );
    }

    // For new cases, return greeting
    if (isNewCase) {
      const greeting = generateGreeting(language, customerName);
      return NextResponse.json({
        message: greeting,
        shouldEscalate: false,
        metadata: {
          model: 'greeting',
          tokensUsed: 0,
          ragChunksUsed: 0,
          processingTimeMs: 0,
        },
      });
    }

    // Validate message for existing conversation
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required for non-new cases' },
        { status: 400 }
      );
    }

    // Build context
    const context: L1AgentContext = {
      tenantId,
      caseId,
      product,
      category: category || 'general',
      language,
      severity,
      customerName,
      conversationHistory,
      playbookState,
      failedAttempts,
    };

    // Process the request
    const response = await processL1Request(context, message);

    return NextResponse.json(response);
  } catch (error) {
    console.error('L1 AI error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
