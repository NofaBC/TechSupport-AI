import { NextRequest, NextResponse } from 'next/server';
import { resolveL3Case } from '@/lib/l3';
import { updateCase, addTimelineEvent } from '@/lib/firebase/cases';

/**
 * POST /api/l3/resolve - Resolve an L3 case
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      queueItemId,
      caseId,
      tenantId,
      agentId,
      resolution,
      rootCause,
      preventionTips,
      internalNotes,
    } = body;

    if (!queueItemId || !caseId || !tenantId || !agentId) {
      return NextResponse.json(
        { error: 'queueItemId, caseId, tenantId, and agentId are required' },
        { status: 400 }
      );
    }

    if (!resolution) {
      return NextResponse.json(
        { error: 'resolution is required' },
        { status: 400 }
      );
    }

    // Resolve in L3 queue
    await resolveL3Case(queueItemId, agentId);

    // Update case status (resolvedAt is set via serverTimestamp in updateCase)
    await updateCase(tenantId, caseId, {
      status: 'resolved',
    });

    // Add resolution timeline event
    await addTimelineEvent(tenantId, caseId, {
      type: 'resolved',
      level: 'L3',
      content: resolution,
      metadata: {
        rootCause,
        preventionTips,
        internalNotes,
        resolvedBy: agentId,
      },
      createdBy: agentId,
    });

    return NextResponse.json({
      success: true,
      caseId,
      status: 'resolved',
    });
  } catch (error) {
    console.error('L3 resolution error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve case' },
      { status: 500 }
    );
  }
}
