import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './client';
import type { Case, TimelineEvent, CaseStatus, CaseSeverity, SupportLevel } from '@/types';

// Generate ticket number: TS-YYYYMMDD-XXXX
export function generateTicketNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TS-${dateStr}-${random}`;
}

// Convert Firestore doc to Case
function docToCase(docSnap: DocumentSnapshot): Case | null {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    resolvedAt: data.resolvedAt?.toDate?.() || undefined,
  } as Case;
}

// Convert Firestore doc to TimelineEvent
function docToTimelineEvent(docSnap: DocumentSnapshot): TimelineEvent | null {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  } as TimelineEvent;
}

export interface CaseFilters {
  status?: CaseStatus;
  severity?: CaseSeverity;
  currentLevel?: SupportLevel;
  search?: string;
}

export interface CaseListResult {
  cases: Case[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

// Get cases with filters and pagination
export async function getCases(
  tenantId: string,
  filters: CaseFilters = {},
  pageSize: number = 20,
  lastDocument?: DocumentSnapshot
): Promise<CaseListResult> {
  if (!db) throw new Error('Firebase not initialized');
  
  const casesRef = collection(db, 'tenants', tenantId, 'cases');
  const constraints: QueryConstraint[] = [];
  
  // Apply filters
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters.severity) {
    constraints.push(where('severity', '==', filters.severity));
  }
  if (filters.currentLevel) {
    constraints.push(where('currentLevel', '==', filters.currentLevel));
  }
  
  // Order by created date (newest first)
  constraints.push(orderBy('createdAt', 'desc'));
  
  // Pagination
  if (lastDocument) {
    constraints.push(startAfter(lastDocument));
  }
  constraints.push(limit(pageSize + 1)); // Get one extra to check if there's more
  
  const q = query(casesRef, ...constraints);
  const snapshot = await getDocs(q);
  
  const cases: Case[] = [];
  let lastDoc: DocumentSnapshot | null = null;
  
  snapshot.docs.slice(0, pageSize).forEach((docSnap) => {
    const caseData = docToCase(docSnap);
    if (caseData) {
      cases.push(caseData);
      lastDoc = docSnap;
    }
  });
  
  // Client-side search filter (Firestore doesn't support full-text search)
  let filteredCases = cases;
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredCases = cases.filter(
      (c) =>
        c.ticketNumber.toLowerCase().includes(searchLower) ||
        c.product?.toLowerCase().includes(searchLower) ||
        c.category?.toLowerCase().includes(searchLower) ||
        c.customerContact?.name?.toLowerCase().includes(searchLower)
    );
  }
  
  return {
    cases: filteredCases,
    lastDoc,
    hasMore: snapshot.docs.length > pageSize,
  };
}

// Get single case
export async function getCase(tenantId: string, caseId: string): Promise<Case | null> {
  if (!db) throw new Error('Firebase not initialized');
  
  const caseRef = doc(db, 'tenants', tenantId, 'cases', caseId);
  const docSnap = await getDoc(caseRef);
  return docToCase(docSnap);
}

// Create new case
export async function createCase(
  tenantId: string,
  caseData: Omit<Case, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>
): Promise<Case> {
  if (!db) throw new Error('Firebase not initialized');
  
  const casesRef = collection(db, 'tenants', tenantId, 'cases');
  const ticketNumber = generateTicketNumber();
  
  const newCase = {
    ...caseData,
    ticketNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(casesRef, newCase);
  
  // Add initial timeline event
  await addTimelineEvent(tenantId, docRef.id, {
    type: 'call_started',
    level: caseData.currentLevel || 'L1',
    content: `Case created via ${caseData.customerContact?.phone ? 'phone' : 'web'}`,
    metadata: {},
    createdBy: 'system',
  });
  
  return {
    id: docRef.id,
    ...caseData,
    ticketNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Case;
}

// Update case
export async function updateCase(
  tenantId: string,
  caseId: string,
  updates: Partial<Case>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  const caseRef = doc(db, 'tenants', tenantId, 'cases', caseId);
  
  // Remove fields that shouldn't be updated directly
  const { id, ticketNumber, createdAt, ...safeUpdates } = updates;
  
  await updateDoc(caseRef, {
    ...safeUpdates,
    updatedAt: serverTimestamp(),
  });
}

// Subscribe to case updates (real-time)
export function subscribeToCase(
  tenantId: string,
  caseId: string,
  callback: (caseData: Case | null) => void
): () => void {
  if (!db) {
    callback(null);
    return () => {};
  }
  
  const caseRef = doc(db, 'tenants', tenantId, 'cases', caseId);
  return onSnapshot(caseRef, (docSnap) => {
    callback(docToCase(docSnap));
  });
}

// Get timeline events for a case
export async function getTimelineEvents(
  tenantId: string,
  caseId: string
): Promise<TimelineEvent[]> {
  if (!db) throw new Error('Firebase not initialized');
  
  const timelineRef = collection(db, 'tenants', tenantId, 'cases', caseId, 'timeline');
  const q = query(timelineRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map((docSnap) => docToTimelineEvent(docSnap))
    .filter((event): event is TimelineEvent => event !== null);
}

// Add timeline event
export async function addTimelineEvent(
  tenantId: string,
  caseId: string,
  event: Omit<TimelineEvent, 'id' | 'caseId' | 'createdAt'>
): Promise<TimelineEvent> {
  if (!db) throw new Error('Firebase not initialized');
  
  const timelineRef = collection(db, 'tenants', tenantId, 'cases', caseId, 'timeline');
  
  const newEvent = {
    ...event,
    caseId,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(timelineRef, newEvent);
  
  return {
    id: docRef.id,
    caseId,
    ...event,
    createdAt: new Date(),
  } as unknown as TimelineEvent;
}

// Subscribe to timeline events (real-time)
export function subscribeToTimeline(
  tenantId: string,
  caseId: string,
  callback: (events: TimelineEvent[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }
  
  const timelineRef = collection(db, 'tenants', tenantId, 'cases', caseId, 'timeline');
  const q = query(timelineRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs
      .map((docSnap) => docToTimelineEvent(docSnap))
      .filter((event): event is TimelineEvent => event !== null);
    callback(events);
  });
}

// Status transition validation
const validTransitions: Record<CaseStatus, CaseStatus[]> = {
  open: ['pending', 'resolved', 'escalated_L2'],
  pending: ['open', 'resolved', 'escalated_L2'],
  escalated_L2: ['pending', 'resolved', 'escalated_human'],
  escalated_human: ['resolved'],
  resolved: [], // Terminal state
};

export function canTransitionStatus(from: CaseStatus, to: CaseStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

// Escalate case
export async function escalateCase(
  tenantId: string,
  caseId: string,
  toLevel: 'L2' | 'L3',
  notes?: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  const caseData = await getCase(tenantId, caseId);
  if (!caseData) throw new Error('Case not found');
  
  const newStatus: CaseStatus = toLevel === 'L2' ? 'escalated_L2' : 'escalated_human';
  const newLevel: SupportLevel = toLevel === 'L2' ? 'L2' : 'L3';
  
  if (!canTransitionStatus(caseData.status, newStatus)) {
    throw new Error(`Cannot escalate from ${caseData.status} to ${newStatus}`);
  }
  
  await updateCase(tenantId, caseId, {
    status: newStatus,
    currentLevel: newLevel,
  });
  
  await addTimelineEvent(tenantId, caseId, {
    type: 'escalation',
    level: newLevel,
    content: `Case escalated to ${toLevel}${notes ? `: ${notes}` : ''}`,
    metadata: { fromLevel: caseData.currentLevel, toLevel: newLevel, notes },
    createdBy: 'system',
  });
}

// Resolve case
export async function resolveCase(
  tenantId: string,
  caseId: string,
  summary?: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  await updateCase(tenantId, caseId, {
    status: 'resolved',
    summary,
    resolvedAt: new Date() as unknown as Case['resolvedAt'],
  });
  
  await addTimelineEvent(tenantId, caseId, {
    type: 'resolved',
    level: 'L1', // Will be overwritten by current level
    content: summary || 'Case resolved',
    metadata: {},
    createdBy: 'system',
  });
}

// Get cases by phone number
export async function getCasesByPhone(
  tenantId: string,
  phone: string
): Promise<Case[]> {
  if (!db) throw new Error('Firebase not initialized');
  
  const casesRef = collection(db, 'tenants', tenantId, 'cases');
  const q = query(
    casesRef,
    where('customerContact.phone', '==', phone),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map((docSnap) => docToCase(docSnap))
    .filter((c): c is Case => c !== null);
}
