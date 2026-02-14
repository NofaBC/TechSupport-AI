'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline } from '@/components/cases/Timeline';
import { ChatTranscript } from '@/components/cases/ChatTranscript';
import { formatDateTime, getStatusColor, getSeverityColor, getLevelColor } from '@/lib/utils';
import type { Case, TimelineEvent } from '@/types';

type TabType = 'chat' | 'timeline' | 'artifacts';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const caseId = params.caseId as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For demo, using mock data - replace with real Firestore subscription later
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      // Mock case data for demo
      setCaseData({
        id: caseId,
        tenantId: 'demo-tenant',
        ticketNumber: 'TS-20260214-A1B2',
        product: 'Demo Product',
        category: 'Technical Support',
        severity: 'medium',
        language: 'en',
        status: 'open',
        currentLevel: 'L1',
        customerContact: {
          phone: '+1-555-0123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: new Date() as unknown as Case['createdAt'],
        updatedAt: new Date() as unknown as Case['updatedAt'],
      });
      
      // Mock timeline events
      setEvents([
        {
          id: '1',
          caseId: caseId,
          type: 'call_started',
          level: 'L1',
          content: 'Customer initiated support call',
          metadata: { source: 'phone' },
          createdBy: 'system',
          createdAt: new Date(Date.now() - 300000) as unknown as TimelineEvent['createdAt'],
        },
        {
          id: '2',
          caseId: caseId,
          type: 'ai_response',
          level: 'L1',
          content: 'Hello! I\'m your AI support assistant. How can I help you today?',
          metadata: {},
          createdBy: 'ai',
          createdAt: new Date(Date.now() - 240000) as unknown as TimelineEvent['createdAt'],
        },
        {
          id: '3',
          caseId: caseId,
          type: 'step_attempted',
          level: 'L1',
          content: 'Running initial diagnostics...',
          metadata: { step: 'diagnostics', outcome: 'pending' },
          createdBy: 'ai',
          createdAt: new Date(Date.now() - 180000) as unknown as TimelineEvent['createdAt'],
        },
      ]);
      
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [caseId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p>{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading || !caseData) {
    return <CaseDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link 
              href={`/${locale}/dashboard/cases`}
              className="hover:text-blue-600"
            >
              Cases
            </Link>
            <span>/</span>
            <span className="font-mono">{caseData.ticketNumber}</span>
          </div>
          <h1 className="text-2xl font-bold">{caseData.product}</h1>
          {caseData.category && (
            <p className="text-gray-500">{caseData.category}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(caseData.status)}>
            {caseData.status.replace('_', ' ')}
          </Badge>
          <Badge className={getSeverityColor(caseData.severity)}>
            {caseData.severity}
          </Badge>
          <Badge className={getLevelColor(caseData.currentLevel)}>
            {caseData.currentLevel}
          </Badge>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{caseData.customerContact?.name || 'Unknown'}</p>
            {caseData.customerContact?.phone && (
              <p className="text-sm text-gray-500">{caseData.customerContact.phone}</p>
            )}
            {caseData.customerContact?.email && (
              <p className="text-sm text-gray-500">{caseData.customerContact.email}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDateTime(caseData.createdAt)}</p>
            {caseData.assignedAgent && (
              <p className="text-sm text-gray-500">Assigned to: {caseData.assignedAgent}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {caseData.status !== 'resolved' && (
              <>
                {caseData.currentLevel === 'L1' && (
                  <Button size="sm" variant="outline">
                    Escalate to L2
                  </Button>
                )}
                {caseData.currentLevel === 'L2' && (
                  <Button size="sm" variant="outline">
                    Escalate to Human
                  </Button>
                )}
                <Button size="sm">
                  Resolve
                </Button>
              </>
            )}
            {caseData.status === 'resolved' && (
              <p className="text-sm text-green-600">✓ Resolved</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {(['chat', 'timeline', 'artifacts'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'chat' && '💬 Chat'}
              {tab === 'timeline' && '📋 Timeline'}
              {tab === 'artifacts' && '📎 Artifacts'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <Card>
        <CardContent className="p-0">
          {activeTab === 'chat' && (
            <div className="h-[500px]">
              <ChatTranscript events={events} isLoading={isLoading} />
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className="p-6">
              <Timeline events={events} isLoading={isLoading} />
            </div>
          )}
          {activeTab === 'artifacts' && (
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl">📎</span>
                <p className="mt-2">No artifacts yet</p>
                <p className="text-sm">Transcripts, summaries, and exports will appear here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CaseDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-64 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
      
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="h-96 bg-gray-200 rounded-lg" />
    </div>
  );
}
