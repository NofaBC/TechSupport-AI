'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, BookOpen, FileText } from 'lucide-react';
import { KnowledgeBaseList } from './KnowledgeBaseList';
import { CreateKnowledgeBaseDialog } from './CreateKnowledgeBaseDialog';
import type { KnowledgeBase } from '@/types';

export function KnowledgeBasePageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Initialize Firebase Auth
  useEffect(() => {
    import('@/lib/firebase/client').then((module) => {
      const auth = module.auth;
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          if (!currentUser) {
            setLoading(false);
          }
        });
        return () => unsubscribe();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchKnowledgeBases = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/knowledge-base', {
        headers: {
          'x-tenant-id': user.uid,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }
      
      const data = await response.json();
      setKnowledgeBases(data.knowledgeBases || []);
    } catch (err) {
      console.error('Error fetching knowledge bases:', err);
      setError('Failed to load knowledge bases');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchKnowledgeBases();
    }
  }, [user, fetchKnowledgeBases]);

  const handleCreated = (newKb: KnowledgeBase) => {
    setKnowledgeBases((prev) => [newKb, ...prev]);
    setCreateDialogOpen(false);
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchKnowledgeBases}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Train your AI support agent with product documentation
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Knowledge Base
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <BookOpen className="h-6 w-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold">How Knowledge Base Training Works</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your documentation (PDF, Markdown, TXT, HTML, DOCX, CSV) and we&apos;ll automatically:
              </p>
              <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                <li>Parse and extract text content</li>
                <li>Split into semantic chunks for better retrieval</li>
                <li>Generate embeddings using OpenAI</li>
                <li>Index in our vector database (Pinecone)</li>
                <li>Use RAG to provide contextual AI responses</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Bases List */}
      <KnowledgeBaseList
        knowledgeBases={knowledgeBases}
        isLoading={loading}
        onCreateNew={() => setCreateDialogOpen(true)}
      />

      {/* Supported Formats */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Supported File Formats</h3>
          <div className="flex flex-wrap gap-2">
            {['PDF', 'Markdown (.md)', 'Plain Text (.txt)', 'HTML', 'Word (.docx)', 'CSV'].map((format) => (
              <div
                key={format}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm"
              >
                <FileText className="h-4 w-4" />
                {format}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateKnowledgeBaseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleCreated}
        userId={user?.uid}
      />
    </div>
  );
}
