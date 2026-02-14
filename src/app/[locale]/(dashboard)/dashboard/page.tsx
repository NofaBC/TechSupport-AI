import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ticket,
  Phone,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations();

  // Mock stats - will be replaced with real data
  const stats = [
    {
      title: 'Open Cases',
      value: '12',
      change: '+3 today',
      icon: <Ticket className="h-5 w-5" />,
      color: 'text-blue-500',
    },
    {
      title: 'Resolved Today',
      value: '28',
      change: '85% AI resolved',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-500',
    },
    {
      title: 'Avg Resolution Time',
      value: '4.2m',
      change: '-12% from last week',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-amber-500',
    },
    {
      title: 'Escalation Rate',
      value: '15%',
      change: 'L2: 12% • L3: 3%',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-500',
    },
  ];

  // Mock recent cases
  const recentCases = [
    { id: 'TS-A1B2C3', status: 'open', level: 'L1', severity: 'medium', product: 'AI Factory', created: '5 min ago' },
    { id: 'TS-D4E5F6', status: 'pending', level: 'L2', severity: 'high', product: 'VisionWing™', created: '12 min ago' },
    { id: 'TS-G7H8I9', status: 'resolved', level: 'L1', severity: 'low', product: 'RecallIQ™', created: '25 min ago' },
    { id: 'TS-J0K1L2', status: 'escalated_human', level: 'L3', severity: 'critical', product: 'SmartRank AI', created: '1 hour ago' },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.dashboard')}</h1>
          <p className="text-muted-foreground">
            Welcome to {t('common.appName')} — Support Command Center
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cases">
            <Phone className="mr-2 h-4 w-4" />
            {t('cases.newCase')}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Support Levels Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="l1">{t('levels.L1')}</Badge>
              <CardTitle className="text-base">TechSupport AI™</CardTitle>
            </div>
            <CardDescription>{t('levels.L1Description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-semibold">8</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="l2">{t('levels.L2')}</Badge>
              <CardTitle className="text-base">VisionScreen™</CardTitle>
            </div>
            <CardDescription>{t('levels.L2Description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-semibold">3</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="l3">{t('levels.L3')}</Badge>
              <CardTitle className="text-base">Human Escalation</CardTitle>
            </div>
            <CardDescription>{t('levels.L3Description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-semibold">1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('cases.title')}</CardTitle>
              <CardDescription>Recent support tickets and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/cases">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm font-medium">{caseItem.id}</div>
                  <Badge variant={getStatusVariant(caseItem.status)}>
                    {t(`status.${caseItem.status}`)}
                  </Badge>
                  <Badge variant={getLevelVariant(caseItem.level)}>
                    {caseItem.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{caseItem.product}</span>
                  <span>{caseItem.created}</span>
                </div>
              </div>
            ))}
          </div>
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
              <Link href="/dashboard/knowledge-base">
                <Users className="mr-2 h-4 w-4" />
                Train Knowledge Base
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/team">
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/settings">
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
              <Badge variant="warning">2 docs pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
