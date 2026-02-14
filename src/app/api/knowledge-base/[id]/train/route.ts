import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { chunkText, extractTextFromMarkdown, extractTextFromHTML } from '@/lib/knowledge-base/chunker';
import { generateEmbeddings } from '@/lib/knowledge-base/embeddings';
import { upsertVectors, deleteVectorsByKB, VectorRecord } from '@/lib/pinecone';

// POST /api/knowledge-base/[id]/train - Train (embed) a knowledge base
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
    
    // Get the knowledge base
    const kbRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(kbId);
    
    const kbDoc = await kbRef.get();
    if (!kbDoc.exists) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }
    
    const kbData = kbDoc.data()!;
    
    // Update status to processing
    await kbRef.update({ status: 'processing', updatedAt: new Date() });
    
    // Get all documents
    const docsSnapshot = await kbRef.collection('documents').get();
    
    if (docsSnapshot.empty) {
      // No documents, mark as ready
      await kbRef.update({ 
        status: 'ready', 
        chunkCount: 0,
        lastTrainedAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({ 
        success: true, 
        message: 'No documents to train',
        chunkCount: 0,
      });
    }
    
    // Delete existing vectors for this KB
    try {
      await deleteVectorsByKB(tenantId, kbId);
    } catch (error) {
      console.error('Error clearing existing vectors:', error);
    }
    
    // Process each document
    const allChunks: Array<{ docId: string; content: string; index: number }> = [];
    
    for (const docSnap of docsSnapshot.docs) {
      const docData = docSnap.data();
      const docId = docSnap.id;
      
      // Update document status
      await docSnap.ref.update({ status: 'processing' });
      
      try {
        // Fetch document content from storage URL
        // For MVP, we'll assume the content is stored in Firestore or passed in the request
        // In production, you'd fetch from Firebase Storage
        let content = docData.content || '';
        
        // If no content stored, skip
        if (!content) {
          await docSnap.ref.update({ status: 'error', chunkCount: 0 });
          continue;
        }
        
        // Extract text based on file type
        switch (docData.fileType) {
          case 'md':
            content = extractTextFromMarkdown(content);
            break;
          case 'html':
            content = extractTextFromHTML(content);
            break;
          // txt and csv are used as-is
        }
        
        // Chunk the document
        const chunks = chunkText(content, {
          maxTokens: 500,
          minTokens: 100,
          overlapTokens: 50,
        });
        
        // Add chunks with document reference
        for (const chunk of chunks) {
          allChunks.push({
            docId,
            content: chunk.content,
            index: chunk.index,
          });
        }
        
        // Update document with chunk count
        await docSnap.ref.update({ 
          status: 'embedded', 
          chunkCount: chunks.length,
        });
      } catch (error) {
        console.error(`Error processing document ${docId}:`, error);
        await docSnap.ref.update({ status: 'error', chunkCount: 0 });
      }
    }
    
    if (allChunks.length === 0) {
      await kbRef.update({ 
        status: 'ready', 
        chunkCount: 0,
        lastTrainedAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({ 
        success: true, 
        message: 'No content to embed',
        chunkCount: 0,
      });
    }
    
    // Generate embeddings for all chunks
    const texts = allChunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);
    
    // Prepare vectors for Pinecone
    const vectors: VectorRecord[] = embeddings.map((emb, i) => ({
      id: `${kbId}-${allChunks[i].docId}-${allChunks[i].index}`,
      values: emb.embedding,
      metadata: {
        tenantId,
        kbId,
        docId: allChunks[i].docId,
        product: kbData.product,
        chunkIndex: allChunks[i].index,
        content: allChunks[i].content,
        language: 'en', // Could be detected
      },
    }));
    
    // Upsert to Pinecone
    await upsertVectors(tenantId, vectors);
    
    // Update KB with total chunk count
    await kbRef.update({ 
      status: 'ready', 
      chunkCount: vectors.length,
      lastTrainedAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Training complete',
      chunkCount: vectors.length,
      documentCount: docsSnapshot.size,
    });
  } catch (error) {
    console.error('Error training knowledge base:', error);
    
    // Try to mark as error
    try {
      const { id: kbId } = await params;
      const tenantId = request.headers.get('x-tenant-id');
      if (tenantId) {
        const db = adminDb();
        if (db) {
          await db
            .collection('tenants')
            .doc(tenantId)
            .collection('knowledgeBases')
            .doc(kbId)
            .update({ status: 'error', updatedAt: new Date() });
        }
      }
    } catch (e) {
      console.error('Error updating KB status:', e);
    }
    
    return NextResponse.json({ error: 'Failed to train knowledge base' }, { status: 500 });
  }
}
