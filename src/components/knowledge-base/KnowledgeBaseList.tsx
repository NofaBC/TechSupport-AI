'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import type { KnowledgeBase } from '@/types';

interface KnowledgeBaseListProps {
  knowledgeBases: KnowledgeBase[];
  isLoading?: boolean;
  onCreateNew?: () => void;
}

const statusConfig = {
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  error: { label: 'Error', color: 'bg-red-100 text-red-800' },
};

export function KnowledgeBaseList({
  knowledgeBases,
  isLoading,
  onCreateNew,
}: KnowledgeBaseListProps) {
  const params = useParams();
  const locale = params.locale as string;

  if (isLoading) {
    return <KnowledgeBaseListSkeleton />;
  }

  if (knowledgeBases.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">📚</span>
        <h3 className="mt-4 text-lg font-semibold">No Knowledge Bases</h3>
        <p className="mt-2 text-gray-500">
          Create your first knowledge base to train AI on your documentation.
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="mt-4">
            Create Knowledge Base
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {knowledgeBases.map((kb) => {
        const status = statusConfig[kb.status] || statusConfig.processing;
        const lastTrained = kb.lastTrainedAt 
          ? formatDateTime('toDate' in kb.lastTrainedAt ? kb.lastTrainedAt.toDate() : kb.lastTrainedAt as unknown as Date)
          : 'Never';

        return (
          <Link
            key={kb.id}
            href={`/${locale}/dashboard/knowledge-base/${kb.id}`}
          >
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{kb.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {kb.product}
                    </CardDescription>
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {kb.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {kb.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Documents</p>
                    <p className="font-semibold">{kb.documentCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Chunks</p>
                    <p className="font-semibold">{kb.chunkCount}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                  Last trained: {lastTrained}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function KnowledgeBaseListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="h-48 animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
