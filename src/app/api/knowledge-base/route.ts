import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET /api/knowledge-base - List knowledge bases for a tenant
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const kbSnapshot = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .orderBy('createdAt', 'desc')
      .get();
    
    const knowledgeBases = kbSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
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
      };
    });
    
    return NextResponse.json({ knowledgeBases });
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge bases' }, { status: 500 });
  }
}

// POST /api/knowledge-base - Create a new knowledge base
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const body = await request.json();
    const { name, description, product } = body;
    
    if (!name || !product) {
      return NextResponse.json(
        { error: 'Missing required fields: name, product' },
        { status: 400 }
      );
    }
    
    const now = new Date();
    const newKB = {
      tenantId,
      name,
      description: description || '',
      product,
      status: 'processing',
      documentCount: 0,
      chunkCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    const kbRef = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('knowledgeBases')
      .add(newKB);
    
    // Update status to ready since no documents yet
    await kbRef.update({ status: 'ready' });
    
    return NextResponse.json(
      { id: kbRef.id, ...newKB, status: 'ready' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    return NextResponse.json({ error: 'Failed to create knowledge base' }, { status: 500 });
  }
}
