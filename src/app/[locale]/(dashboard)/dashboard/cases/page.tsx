import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { CasesPageContent } from '@/components/cases/CasesPageContent';

export default function CasesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations();

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
      </div>

      {/* Cases List with real data */}
      <Card>
        <CardContent className="p-4">
          <CasesPageContent />
        </CardContent>
      </Card>
    </div>
  );
}
