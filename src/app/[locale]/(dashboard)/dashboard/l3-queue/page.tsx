'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface L3QueueItem {
  id: string;
  caseId: string;
  caseNumber: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  customerName: string;
  summary: string;
  escalationReason: string;
  aiRecommendation?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  queuedAt: string;
  assignedAt?: string;
  status: 'queued' | 'assigned' | 'in_progress' | 'resolved';
}

interface QueueStats {
  queued: number;
  assigned: number;
  inProgress: number;
  avgWaitMinutes: number;
}

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
};

// Mock tenant ID - in production this would come from auth context
const MOCK_TENANT_ID = 'demo-tenant';

export default function L3QueuePage() {
  const [queue, setQueue] = useState<L3QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'queued' | 'assigned' | 'in_progress'>('all');

  const fetchQueue = useCallback(async () => {
    try {
      const statusFilter = filter === 'all' ? 'queued,assigned,in_progress' : filter;
      const response = await fetch(
        `/api/l3/queue?tenantId=${MOCK_TENANT_ID}&status=${statusFilter}&includeStats=true`
      );
      const data = await response.json();
      setQueue(data.queue || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchQueue();
    // Poll every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleAssignToMe = async (queueItemId: string) => {
    try {
      await fetch('/api/l3/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          queueItemId,
          agentId: 'current-agent-id', // Would come from auth
          agentName: 'Current Agent', // Would come from auth
        }),
      });
      fetchQueue();
    } catch (error) {
      console.error('Failed to assign:', error);
    }
  };

  const handleStartWorking = async (queueItemId: string) => {
    try {
      await fetch('/api/l3/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          queueItemId,
          status: 'in_progress',
        }),
      });
      fetchQueue();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatWaitTime = (queuedAt: string) => {
    const mins = Math.round((Date.now() - new Date(queuedAt).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">L3 Support Queue</h1>
          <p className="text-gray-600">Human escalation cases requiring attention</p>
        </div>
        <Button onClick={fetchQueue} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-900">{stats.queued}</div>
              <p className="text-sm text-gray-500">Waiting</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
              <p className="text-sm text-gray-500">Assigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
              <p className="text-sm text-gray-500">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{stats.avgWaitMinutes}m</div>
              <p className="text-sm text-gray-500">Avg Wait</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'queued', 'assigned', 'in_progress'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Active' : f.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-8">Loading queue...</div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No cases in queue
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Case #{item.caseNumber}
                      <Badge className={priorityColors[item.priority]}>
                        {item.priority}
                      </Badge>
                      <Badge className={statusColors[item.status]}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.customerName} • Waiting {formatWaitTime(item.queuedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {item.status === 'queued' && (
                      <Button size="sm" onClick={() => handleAssignToMe(item.id)}>
                        Assign to Me
                      </Button>
                    )}
                    {item.status === 'assigned' && (
                      <Button size="sm" onClick={() => handleStartWorking(item.id)}>
                        Start Working
                      </Button>
                    )}
                    <Link href={`/en/dashboard/cases/${item.caseId}`}>
                      <Button size="sm" variant="outline">
                        View Case
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Summary</p>
                    <p className="text-sm text-gray-600">{item.summary}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Escalation Reason</p>
                    <p className="text-sm text-gray-600">{item.escalationReason}</p>
                  </div>
                  {item.aiRecommendation && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">AI Recommendation</p>
                      <p className="text-sm text-purple-700">{item.aiRecommendation}</p>
                    </div>
                  )}
                  {item.assignedAgentName && (
                    <p className="text-sm text-gray-500">
                      Assigned to: {item.assignedAgentName}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
