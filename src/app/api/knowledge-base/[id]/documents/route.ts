import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET /api/knowledge-base/[id]/documents - List documents in a KB
export async function GET(
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
    
    // Verify KB exists
    const kbDoc = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(kbId)
      .get();
    
    if (!kbDoc.exists) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }
    
    // Get documents
    const docsSnapshot = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(kbId)
      .collection('documents')
      .orderBy('createdAt', 'desc')
      .get();
    
    const documents = docsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        knowledgeBaseId: kbId,
        filename: data.filename,
        fileType: data.fileType,
        fileSize: data.fileSize,
        storageUrl: data.storageUrl,
        status: data.status,
        chunkCount: data.chunkCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/knowledge-base/[id]/documents - Add a document to a KB
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
    const { filename, fileType, fileSize, content, storageUrl } = body;
    
    if (!filename || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, fileType' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validTypes = ['pdf', 'md', 'txt', 'html', 'docx', 'csv'];
    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        { error: `Invalid file type. Supported: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Verify KB exists
    const kbRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(kbId);
    
    const kbDoc = await kbRef.get();
    if (!kbDoc.exists) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }
    
    const now = new Date();
    const newDoc = {
      knowledgeBaseId: kbId,
      filename,
      fileType,
      fileSize: fileSize || 0,
      storageUrl: storageUrl || '',
      content: content || '', // Store content directly for text-based files
      status: 'uploading',
      chunkCount: 0,
      createdAt: now,
    };
    
    const docRef = await kbRef.collection('documents').add(newDoc);
    
    // Update status to processing if content was provided
    if (content) {
      await docRef.update({ status: 'processing' });
      newDoc.status = 'processing';
    }
    
    // Update KB document count
    const kbData = kbDoc.data()!;
    await kbRef.update({
      documentCount: (kbData.documentCount || 0) + 1,
      status: 'processing', // Mark KB as needing re-training
      updatedAt: now,
    });
    
    return NextResponse.json(
      { id: docRef.id, ...newDoc },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding document:', error);
    return NextResponse.json({ error: 'Failed to add document' }, { status: 500 });
  }
}
