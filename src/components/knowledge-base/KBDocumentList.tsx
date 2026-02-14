'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { KBDocument } from '@/types';

interface KBDocumentListProps {
  documents: KBDocument[];
  isLoading?: boolean;
  onDelete?: (docId: string) => void;
}

const statusConfig = {
  uploading: { label: 'Uploading', color: 'bg-blue-100 text-blue-800', icon: '⏳' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: '⚙️' },
  embedded: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: '✅' },
  error: { label: 'Error', color: 'bg-red-100 text-red-800', icon: '❌' },
};

const fileTypeIcons: Record<string, string> = {
  pdf: '📕',
  md: '📝',
  txt: '📄',
  html: '🌐',
  docx: '📘',
  csv: '📊',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function KBDocumentList({
  documents,
  isLoading,
  onDelete,
}: KBDocumentListProps) {
  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl">📂</span>
        <p className="mt-2">No documents uploaded yet</p>
        <p className="text-sm mt-1">Upload documents to train your knowledge base</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const status = statusConfig[doc.status] || statusConfig.processing;
        const icon = fileTypeIcons[doc.fileType] || '📄';

        return (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div className="min-w-0">
                <p className="font-medium truncate">{doc.filename}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  {doc.chunkCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{doc.chunkCount} chunks</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={status.color}>
                {status.icon} {status.label}
              </Badge>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(doc.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div>
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-200 rounded w-20 mt-1" />
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
  );
}
