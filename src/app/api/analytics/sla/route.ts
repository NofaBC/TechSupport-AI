import { NextRequest, NextResponse } from 'next/server';
import { getSLAMetrics } from '@/lib/analytics';

/**
 * GET /api/analytics/sla - Get SLA metrics and breaches
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const responseTarget = parseInt(searchParams.get('responseTarget') || '15', 10);
    const resolutionTarget = parseInt(searchParams.get('resolutionTarget') || '24', 10);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const sla = await getSLAMetrics(tenantId, {
      responseTimeTarget: responseTarget,
      resolutionTimeTarget: resolutionTarget,
    });

    return NextResponse.json(sla);
  } catch (error) {
    console.error('SLA metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SLA metrics' },
      { status: 500 }
    );
  }
}
