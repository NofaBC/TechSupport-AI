'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardMetrics {
  totalCases: number;
  openCases: number;
  resolvedToday: number;
  avgResolutionTime: number;
  firstContactResolutionRate: number;
  escalationRate: number;
  casesByLevel: { L1: number; L2: number; L3: number };
  casesBySeverity: { low: number; medium: number; high: number; critical: number };
}

interface CaseTrend {
  date: string;
  created: number;
  resolved: number;
}

interface SLAMetrics {
  responseTimeSLA: { target: number; met: number; breached: number; percentage: number };
  resolutionTimeSLA: { target: number; met: number; breached: number; percentage: number };
  currentBreaches: Array<{
    caseId: string;
    ticketNumber: string;
    type: 'response' | 'resolution';
    severity: string;
  }>;
}

interface LevelPerformance {
  L1: { resolved: number; avgTime: number; automationRate: number };
  L2: { resolved: number; avgTime: number };
  L3: { resolved: number; avgTime: number };
}

// Mock tenant ID
const MOCK_TENANT_ID = 'demo-tenant';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<CaseTrend[]>([]);
  const [sla, setSla] = useState<SLAMetrics | null>(null);
  const [levelPerformance, setLevelPerformance] = useState<LevelPerformance | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/dashboard?tenantId=${MOCK_TENANT_ID}&days=${days}`
      );
      const data = await response.json();
      setMetrics(data.metrics);
      setTrends(data.trends || []);
      setSla(data.sla);
      setLevelPerformance(data.levelPerformance);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Support performance and metrics</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d} days
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{metrics.totalCases}</div>
              <p className="text-sm text-gray-500">Total Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-orange-600">{metrics.openCases}</div>
              <p className="text-sm text-gray-500">Open Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-green-600">{metrics.resolvedToday}</div>
              <p className="text-sm text-gray-500">Resolved Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-600">
                {formatTime(metrics.avgResolutionTime)}
              </div>
              <p className="text-sm text-gray-500">Avg Resolution Time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  First Contact Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.firstContactResolutionRate}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${metrics.firstContactResolutionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Escalation Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.escalationRate}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${metrics.escalationRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {levelPerformance && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    L1 Automation Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {levelPerformance.L1.automationRate}%
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${levelPerformance.L1.automationRate}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* SLA Metrics */}
      {sla && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Time SLA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Target: {sla.responseTimeSLA.target} min</span>
                <Badge
                  className={
                    sla.responseTimeSLA.percentage >= 90
                      ? 'bg-green-100 text-green-800'
                      : sla.responseTimeSLA.percentage >= 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {sla.responseTimeSLA.percentage}% Met
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-green-700">{sla.responseTimeSLA.met}</div>
                  <p className="text-sm text-green-600">Met</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-red-700">{sla.responseTimeSLA.breached}</div>
                  <p className="text-sm text-red-600">Breached</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resolution Time SLA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Target: {sla.resolutionTimeSLA.target} hours</span>
                <Badge
                  className={
                    sla.resolutionTimeSLA.percentage >= 90
                      ? 'bg-green-100 text-green-800'
                      : sla.resolutionTimeSLA.percentage >= 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {sla.resolutionTimeSLA.percentage}% Met
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-green-700">{sla.resolutionTimeSLA.met}</div>
                  <p className="text-sm text-green-600">Met</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-red-700">{sla.resolutionTimeSLA.breached}</div>
                  <p className="text-sm text-red-600">Breached</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cases by Level & Severity */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cases by Support Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(['L1', 'L2', 'L3'] as const).map((level) => {
                  const count = metrics.casesByLevel[level];
                  const percentage = metrics.totalCases > 0 
                    ? Math.round((count / metrics.totalCases) * 100) 
                    : 0;
                  const colors = { L1: 'bg-blue-500', L2: 'bg-purple-500', L3: 'bg-red-500' };
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{level}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[level]} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cases by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
                  const count = metrics.casesBySeverity[severity];
                  const percentage = metrics.totalCases > 0 
                    ? Math.round((count / metrics.totalCases) * 100) 
                    : 0;
                  const colors = {
                    critical: 'bg-red-500',
                    high: 'bg-orange-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-green-500',
                  };
                  return (
                    <div key={severity}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{severity}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[severity]} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Level Performance */}
      {levelPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Support Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {(['L1', 'L2', 'L3'] as const).map((level) => {
                const perf = levelPerformance[level];
                return (
                  <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{level}</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xl font-bold">{perf.resolved}</div>
                        <p className="text-xs text-gray-500">Resolved</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{formatTime(perf.avgTime)}</div>
                        <p className="text-xs text-gray-500">Avg Time</p>
                      </div>
                      {level === 'L1' && 'automationRate' in perf && (
                        <div>
                          <div className="text-xl font-bold text-purple-600">
                            {perf.automationRate}%
                          </div>
                          <p className="text-xs text-gray-500">Automated</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Case Trends (Simple visualization) */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Trends (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {trends.map((day, i) => {
                const maxVal = Math.max(...trends.map((t) => Math.max(t.created, t.resolved)), 1);
                const createdHeight = (day.created / maxVal) * 100;
                const resolvedHeight = (day.resolved / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex gap-0.5" title={day.date}>
                    <div
                      className="flex-1 bg-blue-400 rounded-t"
                      style={{ height: `${createdHeight}%` }}
                    />
                    <div
                      className="flex-1 bg-green-400 rounded-t"
                      style={{ height: `${resolvedHeight}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded" />
                <span>Created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded" />
                <span>Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLA Breaches Alert */}
      {sla && sla.currentBreaches.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg text-red-800">⚠️ Active SLA Breaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sla.currentBreaches.map((breach, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{breach.ticketNumber}</span>
                    <Badge className="ml-2" variant="outline">
                      {breach.type}
                    </Badge>
                  </div>
                  <Badge
                    className={
                      breach.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : breach.severity === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {breach.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
