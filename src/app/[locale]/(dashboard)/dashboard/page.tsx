import { setRequestLocale } from 'next-intl/server';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  
  return <DashboardContent />;
}
