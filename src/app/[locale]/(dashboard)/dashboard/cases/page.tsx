import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Phone, Monitor, Users } from 'lucide-react';

export default function CasesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations();

  // Mock cases data
  const cases = [
    {
      id: 'TS-M3N4O5',
      ticketNumber: 'TS-M3N4O5',
      status: 'open',
      level: 'L1',
      severity: 'medium',
      product: 'AI Factory',
      category: 'Login & Access',
      customer: '+1 (555) 123-****',
      problem: 'Unable to reset password, email not received',
      created: '5 min ago',
    },
    {
      id: 'TS-P6Q7R8',
      ticketNumber: 'TS-P6Q7R8',
      status: 'escalated_L2',
      level: 'L2',
      severity: 'high',
      product: 'VisionWing™',
      category: 'Integrations',
      customer: '+1 (555) 456-****',
      problem: 'Twilio webhook validation failing after update',
      created: '15 min ago',
    },
    {
      id: 'TS-S9T0U1',
      ticketNumber: 'TS-S9T0U1',
      status: 'pending',
      level: 'L1',
      severity: 'low',
      product: 'RecallIQ™',
      category: 'Billing & Subscription',
      customer: '+1 (555) 789-****',
      problem: 'Question about plan upgrade pricing',
      created: '32 min ago',
    },
    {
      id: 'TS-V2W3X4',
      ticketNumber: 'TS-V2W3X4',
      status: 'escalated_human',
      level: 'L3',
      severity: 'critical',
      product: 'SmartRank AI',
      category: 'Performance & Errors',
      customer: '+1 (555) 012-****',
      problem: 'Data export failed, potential data loss concern',
      created: '1 hour ago',
    },
    {
      id: 'TS-Y5Z6A7',
      ticketNumber: 'TS-Y5Z6A7',
      status: 'resolved',
      level: 'L1',
      severity: 'medium',
      product: 'AffiliateLedger AI™',
      category: 'Affiliate Tracking',
      customer: '+1 (555) 345-****',
      problem: 'Commission not showing for last 3 referrals',
      created: '2 hours ago',
    },
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

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'L1': return <Phone className="h-4 w-4" />;
      case 'L2': return <Monitor className="h-4 w-4" />;
      case 'L3': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 dark:text-blue-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('cases.title')}</h1>
          <p className="text-muted-foreground">
            Manage and track support tickets across all levels
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('cases.newCase')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ticket #, product, or customer..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {t('common.filter')}
              </Button>
              <Button variant="outline" size="sm">
                Status: All
              </Button>
              <Button variant="outline" size="sm">
                Level: All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="space-y-3">
        {cases.map((caseItem) => (
          <Card
            key={caseItem.id}
            className="hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {getLevelIcon(caseItem.level)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold">{caseItem.ticketNumber}</span>
                      <Badge variant={getStatusVariant(caseItem.status)}>
                        {t(`status.${caseItem.status}`)}
                      </Badge>
                      <Badge variant="outline">{caseItem.level}</Badge>
                      <span className={`text-xs font-medium ${getSeverityColor(caseItem.severity)}`}>
                        {t(`severity.${caseItem.severity}`)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {caseItem.problem}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground lg:text-right">
                  <div>
                    <p className="font-medium text-foreground">{caseItem.product}</p>
                    <p>{caseItem.category}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{caseItem.customer}</p>
                    <p>{caseItem.created}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 5 of 47 cases
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
