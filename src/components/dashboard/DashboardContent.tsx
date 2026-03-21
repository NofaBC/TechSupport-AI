'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ticket,
  Phone,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { getCases } from '@/lib/firebase/cases';
import type { Case } from '@/types';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function DashboardContent() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  
  const [user, setUser] = useState<User | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [stats, setStats] = useState({
    openCases: 0,
    resolvedToday: 0,
    l1Cases: 0,
    l2Cases: 0,
    l3Cases: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Firebase Auth
  useEffect(() => {
    import('@/lib/firebase/client').then((module) => {
      const auth = module.auth;
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          if (!currentUser) {
            setIsLoading(false);
          }
        });
        return () => unsubscribe();
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  // Fetch cases when user is available
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      
      try {
        const result = await getCases(user.uid, {}, 10);
        setRecentCases(result.cases);
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let openCount = 0;
        let resolvedTodayCount = 0;
        let l1Count = 0;
        let l2Count = 0;
        let l3Count = 0;
        
        result.cases.forEach((c) => {
          if (c.status === 'open' || c.status === 'pending') openCount++;
          // Handle both Date and Firestore Timestamp
          const updatedDate = c.updatedAt instanceof Date 
            ? c.updatedAt 
            : (c.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(c.updatedAt as unknown as string);
          if (c.status === 'resolved' && updatedDate >= today) resolvedTodayCount++;
          if (c.currentLevel === 'L1') l1Count++;
          if (c.currentLevel === 'L2') l2Count++;
          if (c.currentLevel === 'L3') l3Count++;
        });
        
        setStats({
          openCases: openCount,
          resolvedToday: resolvedTodayCount,
          l1Cases: l1Count,
          l2Cases: l2Count,
          l3Cases: l3Count,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user?.uid) {
      fetchData();
    }
  }, [user?.uid]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'open';
      case 'pending': return 'pending';
      case 'resolved': return 'resolved';
      case 'escalated_L2':
      case 'escalated_human': return 'escalated';
      default: return 'secondary';
    }
  };

  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'L1': return 'l1';
      case 'L2': return 'l2';
      case 'L3': return 'l3';
      default: return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'pending': return 'Pending';
      case 'resolved': return 'Resolved';
      case 'escalated_L2': return 'Escalated L2';
      case 'escalated_human': return 'Escalated (Human)';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to TechSupport AI™ — Support Command Center
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/dashboard/cases`}>
            <Phone className="mr-2 h-4 w-4" />
            View All Cases
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Cases
            </CardTitle>
            <Ticket className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.openCases}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cases
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : recentCases.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved Today
            </CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.resolvedToday}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escalated
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.l2Cases + stats.l3Cases}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              L2: {stats.l2Cases} • L3: {stats.l3Cases}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Support Levels Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="l1">Level 1</Badge>
              <CardTitle className="text-base">TechSupport AI™</CardTitle>
            </div>
            <CardDescription>Fast triage + common fixes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-semibold">{stats.l1Cases}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="l2">Level 2</Badge>
              <CardTitle className="text-base">VisionScreen™</CardTitle>
            </div>
            <CardDescription>VisionScreen™ guided support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-semibold">{stats.l2Cases}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="l3">Level 3</Badge>
              <CardTitle className="text-base">Human Escalation</CardTitle>
            </div>
            <CardDescription>Human agent escalation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-semibold">{stats.l3Cases}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Cases</CardTitle>
              <CardDescription>Recent support tickets and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/dashboard/cases`}>View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentCases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No cases yet</p>
              <p className="text-sm">Cases will appear here when created</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCases.slice(0, 5).map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/${locale}/dashboard/cases/${caseItem.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer block"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm font-medium text-blue-600">
                      {caseItem.ticketNumber}
                    </div>
                    <Badge variant={getStatusVariant(caseItem.status)}>
                      {formatStatus(caseItem.status)}
                    </Badge>
                    <Badge variant={getLevelVariant(caseItem.currentLevel)}>
                      {caseItem.currentLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{caseItem.product}</span>
                    <span>{formatTimeAgo(
                      caseItem.createdAt instanceof Date 
                        ? caseItem.createdAt 
                        : (caseItem.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(caseItem.createdAt as unknown as string)
                    )}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/dashboard/knowledge-base`}>
                <Users className="mr-2 h-4 w-4" />
                Train Knowledge Base
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/dashboard/team`}>
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/dashboard/settings`}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Configure Escalation Rules
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Twilio Integration</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Firebase</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Engine</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Knowledge Base</span>
              <Badge variant="success">Ready</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
