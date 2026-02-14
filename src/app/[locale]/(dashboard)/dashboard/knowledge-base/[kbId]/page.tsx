'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KBDocumentUploader, FileUploadData } from '@/components/knowledge-base/KBDocumentUploader';
import { KBDocumentList } from '@/components/knowledge-base/KBDocumentList';
import { formatDateTime } from '@/lib/utils';
import type { KnowledgeBase, KBDocument } from '@/types';

const statusConfig = {
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  error: { label: 'Error', color: 'bg-red-100 text-red-800' },
};

export default function KnowledgeBaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const kbId = params.kbId as string;
  
  const [kb, setKB] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load KB data (mock for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock KB data
      setKB({
        id: kbId,
        tenantId: 'demo-tenant',
        name: 'Product Documentation',
        description: 'Technical documentation and user guides for our products.',
        product: 'Demo Product',
        status: 'ready',
        documentCount: 3,
        chunkCount: 45,
        lastTrainedAt: new Date() as unknown as KnowledgeBase['lastTrainedAt'],
        createdAt: new Date() as unknown as KnowledgeBase['createdAt'],
        updatedAt: new Date() as unknown as KnowledgeBase['updatedAt'],
      });
      
      // Mock documents
      setDocuments([
        {
          id: '1',
          knowledgeBaseId: kbId,
          filename: 'getting-started.md',
          fileType: 'md',
          fileSize: 15420,
          storageUrl: '',
          status: 'embedded',
          chunkCount: 12,
          createdAt: new Date() as unknown as KBDocument['createdAt'],
        },
        {
          id: '2',
          knowledgeBaseId: kbId,
          filename: 'api-reference.md',
          fileType: 'md',
          fileSize: 45230,
          storageUrl: '',
          status: 'embedded',
          chunkCount: 28,
          createdAt: new Date() as unknown as KBDocument['createdAt'],
        },
        {
          id: '3',
          knowledgeBaseId: kbId,
          filename: 'troubleshooting.txt',
          fileType: 'txt',
          fileSize: 8120,
          storageUrl: '',
          status: 'embedded',
          chunkCount: 5,
          createdAt: new Date() as unknown as KBDocument['createdAt'],
        },
      ]);
      
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [kbId]);

  const handleUpload = async (files: FileUploadData[]) => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Add new documents to list
      const newDocs: KBDocument[] = files.map((file, i) => ({
        id: `new-${Date.now()}-${i}`,
        knowledgeBaseId: kbId,
        filename: file.filename,
        fileType: file.fileType as KBDocument['fileType'],
        fileSize: file.fileSize,
        storageUrl: '',
        status: 'processing' as const,
        chunkCount: 0,
        createdAt: new Date() as unknown as KBDocument['createdAt'],
      }));
      
      setDocuments((prev) => [...newDocs, ...prev]);
      
      if (kb) {
        setKB({
          ...kb,
          documentCount: kb.documentCount + files.length,
          status: 'processing',
        });
      }
    } catch (err) {
      setError('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    
    if (kb) {
      setKB({
        ...kb,
        documentCount: Math.max(0, kb.documentCount - 1),
      });
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setError(null);
    
    try {
      // Simulate training
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Update documents to embedded status
      setDocuments((prev) =>
        prev.map((d) => ({
          ...d,
          status: 'embedded' as const,
          chunkCount: Math.floor(Math.random() * 20) + 5,
        }))
      );
      
      if (kb) {
        setKB({
          ...kb,
          status: 'ready',
          chunkCount: documents.reduce((sum, d) => sum + d.chunkCount, 0) + 30,
          lastTrainedAt: new Date() as unknown as KnowledgeBase['lastTrainedAt'],
        });
      }
    } catch (err) {
      setError('Failed to train knowledge base');
    } finally {
      setIsTraining(false);
    }
  };

  if (isLoading || !kb) {
    return <KBDetailSkeleton />;
  }

  const status = statusConfig[kb.status] || statusConfig.processing;
  const lastTrained = kb.lastTrainedAt
    ? formatDateTime('toDate' in kb.lastTrainedAt ? kb.lastTrainedAt.toDate() : kb.lastTrainedAt as unknown as Date)
    : 'Never';
  const needsTraining = kb.status === 'processing' || documents.some((d) => d.status !== 'embedded');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link
              href={`/${locale}/dashboard/knowledge-base`}
              className="hover:text-blue-600"
            >
              Knowledge Base
            </Link>
            <span>/</span>
            <span>{kb.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{kb.name}</h1>
          <p className="text-gray-500">{kb.product}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={status.color}>{status.label}</Badge>
          <Button
            onClick={handleTrain}
            disabled={isTraining || documents.length === 0}
          >
            {isTraining ? 'Training...' : needsTraining ? 'Train Now' : 'Retrain'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kb.documentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Chunks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kb.chunkCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={status.color}>{status.label}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Last Trained</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{lastTrained}</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {kb.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{kb.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <KBDocumentUploader
            onUpload={handleUpload}
            isUploading={isUploading}
            acceptedTypes={['.md', '.txt', '.html', '.csv']}
          />
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <KBDocumentList
            documents={documents}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function KBDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-64 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-48 bg-gray-200 rounded-lg" />
      <div className="h-64 bg-gray-200 rounded-lg" />
    </div>
  );
}
