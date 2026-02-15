import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMetrics, getCaseTrends, getSLAMetrics, getLevelPerformance } from '@/lib/analytics';

/**
 * GET /api/analytics/dashboard - Get comprehensive dashboard analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch all metrics in parallel
    const [metrics, trends, sla, levelPerformance] = await Promise.all([
      getDashboardMetrics(tenantId, { start: startDate, end: endDate }),
      getCaseTrends(tenantId, Math.min(days, 14)), // Max 14 days for trends
      getSLAMetrics(tenantId),
      getLevelPerformance(tenantId),
    ]);

    return NextResponse.json({
      metrics,
      trends,
      sla,
      levelPerformance,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
