'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime, getStatusColor, getSeverityColor, getLevelColor } from '@/lib/utils';
import type { Case, CaseStatus, CaseSeverity, SupportLevel } from '@/types';

interface CaseListProps {
  cases: Case[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onFilterChange?: (filters: CaseFilters) => void;
}

export interface CaseFilters {
  status?: CaseStatus | '';
  severity?: CaseSeverity | '';
  level?: SupportLevel | '';
  search?: string;
}

const statusOptions: { value: CaseStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'escalated_L2', label: 'Escalated L2' },
  { value: 'escalated_human', label: 'Escalated Human' },
  { value: 'resolved', label: 'Resolved' },
];

const severityOptions: { value: CaseSeverity | ''; label: string }[] = [
  { value: '', label: 'All Severity' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const levelOptions: { value: SupportLevel | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
];

export function CaseList({
  cases,
  isLoading,
  hasMore,
  onLoadMore,
  onFilterChange,
}: CaseListProps) {
  const params = useParams();
  const locale = params.locale as string;
  const [filters, setFilters] = useState<CaseFilters>({});

  const handleFilterChange = (key: keyof CaseFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (isLoading && cases.length === 0) {
    return <CaseListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
        <Input
          placeholder="Search tickets, products..."
          className="w-64"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          className="px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.severity || ''}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
        >
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.level || ''}
          onChange={(e) => handleFilterChange('level', e.target.value)}
        >
          {levelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cases table */}
      {cases.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl">📋</span>
          <p className="mt-2">No cases found</p>
          {Object.values(filters).some(Boolean) && (
            <p className="text-sm mt-1">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-3 font-medium">Ticket</th>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Level</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4">
                    <Link
                      href={`/${locale}/dashboard/cases/${caseItem.id}`}
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {caseItem.ticketNumber}
                    </Link>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="font-medium">{caseItem.product}</p>
                      {caseItem.category && (
                        <p className="text-xs text-gray-500">{caseItem.category}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-sm">
                        {caseItem.customerContact?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {caseItem.customerContact?.phone || caseItem.customerContact?.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge className={getStatusColor(caseItem.status)}>
                      {formatStatus(caseItem.status)}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <Badge className={getSeverityColor(caseItem.severity)}>
                      {caseItem.severity}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <Badge className={getLevelColor(caseItem.currentLevel)}>
                      {caseItem.currentLevel}
                    </Badge>
                  </td>
                  <td className="py-4 text-sm text-gray-500">
                    {formatDateTime(caseItem.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

function CaseListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-28 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatStatus(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    open: 'Open',
    pending: 'Pending',
    escalated_L2: 'L2',
    escalated_human: 'Human',
    resolved: 'Resolved',
  };
  return labels[status] || status;
}
