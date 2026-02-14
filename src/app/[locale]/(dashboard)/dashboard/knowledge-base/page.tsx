import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, BookOpen, FileText, Trash2, RefreshCw } from 'lucide-react';

export default function KnowledgeBasePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations();

  // Mock knowledge bases
  const knowledgeBases = [
    {
      id: '1',
      name: 'AI Factory Documentation',
      product: 'AI Factory',
      status: 'ready',
      documentCount: 24,
      chunkCount: 1847,
      lastTrained: '2 hours ago',
    },
    {
      id: '2',
      name: 'VisionWing™ Integration Guide',
      product: 'VisionWing™',
      status: 'ready',
      documentCount: 12,
      chunkCount: 892,
      lastTrained: '1 day ago',
    },
    {
      id: '3',
      name: 'Billing & Plans FAQ',
      product: 'General',
      status: 'processing',
      documentCount: 8,
      chunkCount: 0,
      lastTrained: 'Processing...',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">{t('knowledgeBase.ready')}</Badge>;
      case 'processing':
        return <Badge variant="warning">{t('knowledgeBase.processing')}</Badge>;
      case 'error':
        return <Badge variant="destructive">{t('knowledgeBase.error')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('knowledgeBase.title')}</h1>
          <p className="text-muted-foreground">
            Train your AI support agent with product documentation
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('knowledgeBase.createKb')}
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

      {/* Knowledge Bases Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{kb.name}</CardTitle>
                  <CardDescription>{kb.product}</CardDescription>
                </div>
                {getStatusBadge(kb.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('knowledgeBase.documentCount')}</p>
                    <p className="font-semibold">{kb.documentCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('knowledgeBase.chunkCount')}</p>
                    <p className="font-semibold">{kb.chunkCount || '—'}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">{t('knowledgeBase.lastTrained')}</p>
                  <p className="font-medium">{kb.lastTrained}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('knowledgeBase.uploadDocs')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New KB Card */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[240px] text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">{t('knowledgeBase.createKb')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a new knowledge base for a product
            </p>
            <Button variant="outline">Get Started</Button>
          </CardContent>
        </Card>
      </div>

      {/* Supported Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supported File Formats</CardTitle>
        </CardHeader>
        <CardContent>
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
    </div>
  );
}
