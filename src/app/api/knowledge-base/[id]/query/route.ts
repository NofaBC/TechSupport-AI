import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { retrieveRelevantChunks, assembleContextWithSources } from '@/lib/knowledge-base/retrieval';

// POST /api/knowledge-base/[id]/query - Query a knowledge base for relevant content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kbId } = await params;
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const body = await request.json();
    const { query, topK = 5, minScore = 0.7, maxTokens = 2000 } = body;
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Verify KB exists and is ready
    const kbDoc = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(kbId)
      .get();
    
    if (!kbDoc.exists) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }
    
    const kbData = kbDoc.data()!;
    
    if (kbData.status !== 'ready') {
      return NextResponse.json(
        { error: 'Knowledge base is not ready for queries' },
        { status: 400 }
      );
    }
    
    if (kbData.chunkCount === 0) {
      return NextResponse.json({
        results: [],
        context: '',
        sources: [],
        message: 'Knowledge base has no indexed content',
      });
    }
    
    // Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(tenantId, query, {
      topK,
      minScore,
      kbId,
      product: kbData.product,
    });
    
    // Assemble context with sources
    const { context, sources } = assembleContextWithSources(chunks, maxTokens);
    
    return NextResponse.json({
      results: chunks.map((chunk) => ({
        content: chunk.content,
        score: chunk.score,
        docId: chunk.metadata.docId,
        chunkIndex: chunk.metadata.chunkIndex,
      })),
      context,
      sources,
      totalResults: chunks.length,
    });
  } catch (error) {
    console.error('Error querying knowledge base:', error);
    return NextResponse.json({ error: 'Failed to query knowledge base' }, { status: 500 });
  }
}
