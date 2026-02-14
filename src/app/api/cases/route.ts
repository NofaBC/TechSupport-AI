import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateTicketNumber } from '@/lib/firebase/cases';
import type { Case, CaseStatus, CaseSeverity, SupportLevel } from '@/types';

// GET /api/cases - List cases for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }
    
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    // Get filters from query params
    const status = searchParams.get('status') as CaseStatus | null;
    const severity = searchParams.get('severity') as CaseSeverity | null;
    const level = searchParams.get('level') as SupportLevel | null;
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const cursor = searchParams.get('cursor');
    
    // Build query
    let query = db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    if (severity) {
      query = query.where('severity', '==', severity);
    }
    if (level) {
      query = query.where('currentLevel', '==', level);
    }
    
    // Pagination
    if (cursor) {
      const cursorDoc = await db
        .collection('tenants')
        .doc(tenantId)
        .collection('cases')
        .doc(cursor)
        .get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }
    
    query = query.limit(pageSize + 1);
    
    const snapshot = await query.get();
    const cases: Case[] = [];
    let nextCursor: string | null = null;
    
    snapshot.docs.slice(0, pageSize).forEach((doc) => {
      const data = doc.data();
      cases.push({
        id: doc.id,
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
      } as Case);
    });
    
    if (snapshot.docs.length > pageSize) {
      nextCursor = cases[cases.length - 1]?.id || null;
    }
    
    return NextResponse.json({
      cases,
      nextCursor,
      hasMore: snapshot.docs.length > pageSize,
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}

// POST /api/cases - Create a new case
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
    
    // Validate required fields
    const { product, category, severity, language, customerContact } = body;
    
    if (!product || !severity || !customerContact) {
      return NextResponse.json(
        { error: 'Missing required fields: product, severity, customerContact' },
        { status: 400 }
      );
    }
    
    const ticketNumber = generateTicketNumber();
    const now = new Date();
    
    const newCase = {
      tenantId,
      ticketNumber,
      product,
      category: category || 'general',
      severity,
      language: language || 'en',
      status: 'open' as const,
      currentLevel: 'L1' as const,
      customerContact,
      createdAt: now,
      updatedAt: now,
    };
    
    // Create case document
    const caseRef = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .add({
        ...newCase,
        createdAt: now,
        updatedAt: now,
      });
    
    // Add initial timeline event
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('cases')
      .doc(caseRef.id)
      .collection('timeline')
      .add({
        type: 'call_started',
        level: 'L1',
        content: `Case ${ticketNumber} created`,
        metadata: { source: body.source || 'api' },
        createdBy: 'system',
        createdAt: now,
      });
    
    return NextResponse.json(
      { id: caseRef.id, ...newCase },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
  }
}
