import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import type { Case, CaseStatus } from '@/types';

// GET /api/cases/[id] - Get a single case
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
    
    const caseDoc = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .doc(id)
      .get();
    
    if (!caseDoc.exists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    
    const data = caseDoc.data()!;
    const caseData: Case = {
      id: caseDoc.id,
      tenantId: tenantId,
      ticketNumber: data.ticketNumber,
      product: data.product,
      category: data.category,
      severity: data.severity,
      language: data.language,
      status: data.status,
      currentLevel: data.currentLevel,
      customerContact: data.customerContact,
      assignedAgent: data.assignedAgent,
      summary: data.summary,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      resolvedAt: data.resolvedAt?.toDate(),
    } as Case;
    
    return NextResponse.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json({ error: 'Failed to fetch case' }, { status: 500 });
  }
}

// Valid status transitions
const validTransitions: Record<CaseStatus, CaseStatus[]> = {
  open: ['pending', 'resolved', 'escalated_L2'],
  pending: ['open', 'resolved', 'escalated_L2'],
  escalated_L2: ['pending', 'resolved', 'escalated_human'],
  escalated_human: ['resolved'],
  resolved: [],
};

// PATCH /api/cases/[id] - Update a case
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
    const caseRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .doc(id);
    
    const caseDoc = await caseRef.get();
    if (!caseDoc.exists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    
    const currentData = caseDoc.data()!;
    
    // Validate status transition if status is being changed
    if (body.status && body.status !== currentData.status) {
      const allowed = validTransitions[currentData.status as CaseStatus] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentData.status} to ${body.status}` },
          { status: 400 }
        );
      }
    }
    
    // Fields that can be updated
    const allowedFields = [
      'product',
      'category',
      'severity',
      'language',
      'status',
      'currentLevel',
      'customerContact',
      'assignedAgent',
      'summary',
    ];
    
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    // Handle resolve
    if (body.status === 'resolved' && !currentData.resolvedAt) {
      updates.resolvedAt = new Date();
    }
    
    await caseRef.update(updates);
    
    // Add timeline event for status changes
    if (body.status && body.status !== currentData.status) {
      await caseRef.collection('timeline').add({
        type: body.status === 'resolved' ? 'resolved' : 
              body.status.startsWith('escalated') ? 'escalation' : 'step_attempted',
        level: updates.currentLevel || currentData.currentLevel,
        content: `Status changed to ${body.status}`,
        metadata: { 
          fromStatus: currentData.status, 
          toStatus: body.status,
          notes: body.notes,
        },
        createdBy: body.updatedBy || 'system',
        createdAt: new Date(),
      });
    }
    
    // Return updated case
    const updatedDoc = await caseRef.get();
    const updatedData = updatedDoc.data()!;
    
    return NextResponse.json({
      id: updatedDoc.id,
      tenantId: tenantId,
      ticketNumber: updatedData.ticketNumber,
      product: updatedData.product,
      category: updatedData.category,
      severity: updatedData.severity,
      language: updatedData.language,
      status: updatedData.status,
      currentLevel: updatedData.currentLevel,
      customerContact: updatedData.customerContact,
      assignedAgent: updatedData.assignedAgent,
      summary: updatedData.summary,
      createdAt: updatedData.createdAt?.toDate() || new Date(),
      updatedAt: updatedData.updatedAt?.toDate() || new Date(),
      resolvedAt: updatedData.resolvedAt?.toDate(),
    });
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
  }
}
