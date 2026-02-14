import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import type { TimelineEvent } from '@/types';

// GET /api/cases/[id]/timeline - Get timeline events for a case
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
    
    // Verify case exists
    const caseDoc = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .doc(id)
      .get();
    
    if (!caseDoc.exists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    
    // Get timeline events
    const timelineSnapshot = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .doc(id)
      .collection('timeline')
      .orderBy('createdAt', 'asc')
      .get();
    
    const events: TimelineEvent[] = timelineSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        caseId: id,
        type: data.type,
        level: data.level,
        content: data.content,
        metadata: data.metadata || {},
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as TimelineEvent;
    });
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

// POST /api/cases/[id]/timeline - Add a timeline event
export async function POST(
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
    
    // Validate required fields
    const { type, level, content, createdBy } = body;
    if (!type || !level || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, level, content' },
        { status: 400 }
      );
    }
    
    // Verify case exists
    const caseRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .doc(id);
    
    const caseDoc = await caseRef.get();
    if (!caseDoc.exists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    
    const now = new Date();
    const eventData = {
      type,
      level,
      content,
      metadata: body.metadata || {},
      createdBy: createdBy || 'system',
      createdAt: now,
    };
    
    const eventRef = await caseRef.collection('timeline').add(eventData);
    
    // Update case updatedAt
    await caseRef.update({ updatedAt: now });
    
    return NextResponse.json(
      {
        id: eventRef.id,
        caseId: id,
        ...eventData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding timeline event:', error);
    return NextResponse.json({ error: 'Failed to add timeline event' }, { status: 500 });
  }
}
