import { NextRequest, NextResponse } from 'next/server';
import { getL3Queue, getQueueStats, assignToAgent, updateQueueItemStatus } from '@/lib/l3';

/**
 * GET /api/l3/queue - Get L3 queue for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    const includeStats = searchParams.get('includeStats') === 'true';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const statusFilter = status?.split(',') as ('queued' | 'assigned' | 'in_progress' | 'resolved')[] | undefined;

    const [queue, stats] = await Promise.all([
      getL3Queue(tenantId, {
        status: statusFilter,
        assignedAgentId: agentId || undefined,
      }),
      includeStats ? getQueueStats(tenantId) : null,
    ]);

    return NextResponse.json({
      queue,
      stats,
    });
  } catch (error) {
    console.error('L3 queue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch L3 queue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/l3/queue - Assign or update queue item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, queueItemId, agentId, agentName, status } = body;

    if (!queueItemId) {
      return NextResponse.json(
        { error: 'queueItemId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'assign':
        if (!agentId || !agentName) {
          return NextResponse.json(
            { error: 'agentId and agentName are required for assignment' },
            { status: 400 }
          );
        }
        await assignToAgent(queueItemId, agentId, agentName);
        return NextResponse.json({ success: true, action: 'assigned' });

      case 'updateStatus':
        if (!status) {
          return NextResponse.json(
            { error: 'status is required' },
            { status: 400 }
          );
        }
        await updateQueueItemStatus(queueItemId, status);
        return NextResponse.json({ success: true, action: 'status_updated', status });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "assign" or "updateStatus"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('L3 queue action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform queue action' },
      { status: 500 }
    );
  }
}
