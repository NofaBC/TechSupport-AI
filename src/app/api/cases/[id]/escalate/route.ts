import { NextRequest, NextResponse } from 'next/server';
import { getCase, updateCase, addTimelineEvent, getTimelineEvents } from '@/lib/firebase/cases';
import { generateL2EscalationSummary } from '@/lib/ai/l2-agent';

interface RouteParams {
  params: { id: string };
}

/**
 * Escalate a case to the next support level
 * POST /api/cases/[id]/escalate
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: caseId } = params;
    const body = await request.json();
    
    const {
      tenantId,
      targetLevel, // 'L2' or 'L3'
      reason,
      notes,
      initiatedBy = 'ai', // 'ai' | 'user' | 'system'
    } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    if (!targetLevel || !['L2', 'L3'].includes(targetLevel)) {
      return NextResponse.json(
        { error: 'targetLevel must be L2 or L3' },
        { status: 400 }
      );
    }

    // Get current case
    const caseData = await getCase(tenantId, caseId);
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Validate escalation path
    const currentLevel = caseData.currentLevel;
    if (targetLevel === 'L2' && currentLevel !== 'L1') {
      return NextResponse.json(
        { error: 'Can only escalate to L2 from L1' },
        { status: 400 }
      );
    }
    if (targetLevel === 'L3' && !['L1', 'L2'].includes(currentLevel)) {
      return NextResponse.json(
        { error: 'Can only escalate to L3 from L1 or L2' },
        { status: 400 }
      );
    }

    // Get timeline for summary generation
    const timeline = await getTimelineEvents(tenantId, caseId);

    // Generate escalation summary for L2
    let escalationSummary: string | undefined;
    if (targetLevel === 'L2') {
      escalationSummary = generateL2EscalationSummary(timeline, caseData);
    }

    // Update case status
    const newStatus = targetLevel === 'L3' ? 'escalated_human' : 'escalated_L2';
    await updateCase(tenantId, caseId, {
      status: newStatus,
      currentLevel: targetLevel,
    });

    // Add escalation timeline event
    await addTimelineEvent(tenantId, caseId, {
      type: 'escalation',
      level: targetLevel,
      content: `Case escalated from ${currentLevel} to ${targetLevel}${reason ? `: ${reason}` : ''}`,
      metadata: {
        fromLevel: currentLevel,
        toLevel: targetLevel,
        reason,
        notes,
        summary: escalationSummary,
      },
      createdBy: initiatedBy,
    });

    // If escalating to L3, we might want to notify human agents
    // This would integrate with email/SMS notifications in production
    if (targetLevel === 'L3') {
      // TODO: Send notification to human support queue
      console.log(`Case ${caseId} escalated to L3 - notification would be sent`);
    }

    return NextResponse.json({
      success: true,
      caseId,
      previousLevel: currentLevel,
      newLevel: targetLevel,
      status: newStatus,
      escalationSummary,
    });
  } catch (error) {
    console.error('Escalation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to escalate case',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
