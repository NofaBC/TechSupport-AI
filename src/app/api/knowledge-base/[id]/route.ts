import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { deleteVectorsByKB } from '@/lib/pinecone';

// GET /api/knowledge-base/[id] - Get a single knowledge base
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const kbDoc = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(id)
      .get();
    
    if (!kbDoc.exists) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }
    
    const data = kbDoc.data()!;
    return NextResponse.json({
      id: kbDoc.id,
      tenantId: tenantId,
      name: data.name,
      description: data.description,
      product: data.product,
      status: data.status,
      documentCount: data.documentCount || 0,
      chunkCount: data.chunkCount || 0,
      lastTrainedAt: data.lastTrainedAt?.toDate() || null,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge base' }, { status: 500 });
  }
}

// PATCH /api/knowledge-base/[id] - Update a knowledge base
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const body = await request.json();
    const allowedFields = ['name', 'description', 'product'];
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    const kbRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(id);
    
    const kbDoc = await kbRef.get();
    if (!kbDoc.exists) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }
    
    await kbRef.update(updates);
    
    const updatedDoc = await kbRef.get();
    const data = updatedDoc.data()!;
    
    return NextResponse.json({
      id: updatedDoc.id,
      tenantId: tenantId,
      name: data.name,
      description: data.description,
      product: data.product,
      status: data.status,
      documentCount: data.documentCount || 0,
      chunkCount: data.chunkCount || 0,
      lastTrainedAt: data.lastTrainedAt?.toDate() || null,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return NextResponse.json({ error: 'Failed to update knowledge base' }, { status: 500 });
  }
}

// DELETE /api/knowledge-base/[id] - Delete a knowledge base
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const kbRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .doc(id);
    
    const kbDoc = await kbRef.get();
    if (!kbDoc.exists) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }
    
    // Delete all documents in the KB
    const docsSnapshot = await kbRef.collection('documents').get();
    for (const docSnap of docsSnapshot.docs) {
      await docSnap.ref.delete();
    }
    
    // Delete vectors from Pinecone
    try {
      await deleteVectorsByKB(tenantId, id);
    } catch (pineconeError) {
      console.error('Error deleting vectors from Pinecone:', pineconeError);
      // Continue with deletion even if Pinecone fails
    }
    
    // Delete the KB
    await kbRef.delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    return NextResponse.json({ error: 'Failed to delete knowledge base' }, { status: 500 });
  }
}
