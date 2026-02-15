/**
 * VisionScreen™ Session Management
 * Secure token generation, session storage, and lifecycle management
 */

import { randomBytes } from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface VisionScreenSession {
  id: string;
  token: string;
  tenantId: string;
  caseId: string;
  agentId?: string;
  customerPhone?: string;
  status: 'pending' | 'active' | 'ended' | 'expired';
  mode: 'screen_share' | 'camera';
  createdAt: Date;
  expiresAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  metadata?: {
    focusArea?: string;
    reason?: string;
    annotations?: Array<{
      type: string;
      data: unknown;
      timestamp: Date;
    }>;
  };
}

// Session expiry time (15 minutes)
const SESSION_EXPIRY_MINUTES = 15;

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  // Generate 32 random bytes and encode as URL-safe base64
  const bytes = randomBytes(32);
  return bytes.toString('base64url');
}

/**
 * Create a new VisionScreen session
 */
export async function createVisionScreenSession(
  tenantId: string,
  caseId: string,
  options: {
    agentId?: string;
    customerPhone?: string;
    mode?: 'screen_share' | 'camera';
    focusArea?: string;
    reason?: string;
  } = {}
): Promise<VisionScreenSession> {
  const db = adminDb();
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60 * 1000);
  
  const session: Omit<VisionScreenSession, 'id'> = {
    token,
    tenantId,
    caseId,
    agentId: options.agentId,
    customerPhone: options.customerPhone,
    status: 'pending',
    mode: options.mode || 'screen_share',
    createdAt: now,
    expiresAt,
    metadata: {
      focusArea: options.focusArea,
      reason: options.reason,
      annotations: [],
    },
  };
  
  // Store in Firestore
  const sessionsRef = db.collection('tenants').doc(tenantId).collection('visionscreen_sessions');
  const docRef = await sessionsRef.add({
    ...session,
    createdAt: FieldValue.serverTimestamp(),
  });
  
  return {
    id: docRef.id,
    ...session,
  };
}

/**
 * Get session by token
 */
export async function getSessionByToken(token: string): Promise<VisionScreenSession | null> {
  const db = adminDb();
  
  // Query all tenants for the session (tokens are globally unique)
  const tenantsRef = db.collection('tenants');
  const tenantsSnapshot = await tenantsRef.get();
  
  for (const tenantDoc of tenantsSnapshot.docs) {
    const sessionsRef = tenantDoc.ref.collection('visionscreen_sessions');
    const sessionQuery = await sessionsRef.where('token', '==', token).limit(1).get();
    
    if (!sessionQuery.empty) {
      const sessionDoc = sessionQuery.docs[0];
      const data = sessionDoc.data();
      
      return {
        id: sessionDoc.id,
        token: data.token,
        tenantId: tenantDoc.id,
        caseId: data.caseId,
        agentId: data.agentId,
        customerPhone: data.customerPhone,
        status: data.status,
        mode: data.mode,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        expiresAt: data.expiresAt?.toDate?.() || new Date(),
        startedAt: data.startedAt?.toDate?.(),
        endedAt: data.endedAt?.toDate?.(),
        metadata: data.metadata,
      };
    }
  }
  
  return null;
}

/**
 * Get session by ID
 */
export async function getSession(
  tenantId: string,
  sessionId: string
): Promise<VisionScreenSession | null> {
  const db = adminDb();
  const sessionRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('visionscreen_sessions')
    .doc(sessionId);
  
  const doc = await sessionRef.get();
  if (!doc.exists) return null;
  
  const data = doc.data()!;
  return {
    id: doc.id,
    token: data.token,
    tenantId,
    caseId: data.caseId,
    agentId: data.agentId,
    customerPhone: data.customerPhone,
    status: data.status,
    mode: data.mode,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    expiresAt: data.expiresAt?.toDate?.() || new Date(),
    startedAt: data.startedAt?.toDate?.(),
    endedAt: data.endedAt?.toDate?.(),
    metadata: data.metadata,
  };
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  tenantId: string,
  sessionId: string,
  status: VisionScreenSession['status'],
  additionalData?: Partial<VisionScreenSession>
): Promise<void> {
  const db = adminDb();
  const sessionRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('visionscreen_sessions')
    .doc(sessionId);
  
  const updateData: Record<string, unknown> = { status };
  
  if (status === 'active') {
    updateData.startedAt = FieldValue.serverTimestamp();
  } else if (status === 'ended' || status === 'expired') {
    updateData.endedAt = FieldValue.serverTimestamp();
  }
  
  if (additionalData) {
    Object.assign(updateData, additionalData);
  }
  
  await sessionRef.update(updateData);
}

/**
 * Add annotation to session
 */
export async function addSessionAnnotation(
  tenantId: string,
  sessionId: string,
  annotation: {
    type: 'highlight' | 'arrow' | 'text' | 'circle';
    data: unknown;
  }
): Promise<void> {
  const db = adminDb();
  const sessionRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('visionscreen_sessions')
    .doc(sessionId);
  
  await sessionRef.update({
    'metadata.annotations': FieldValue.arrayUnion({
      ...annotation,
      timestamp: new Date(),
    }),
  });
}

/**
 * Check if session is valid (not expired)
 */
export function isSessionValid(session: VisionScreenSession): boolean {
  if (session.status === 'ended' || session.status === 'expired') {
    return false;
  }
  
  const now = new Date();
  return now < session.expiresAt;
}

/**
 * Get active sessions for a case
 */
export async function getActiveSessionsForCase(
  tenantId: string,
  caseId: string
): Promise<VisionScreenSession[]> {
  const db = adminDb();
  const sessionsRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('visionscreen_sessions');
  
  const query = await sessionsRef
    .where('caseId', '==', caseId)
    .where('status', 'in', ['pending', 'active'])
    .get();
  
  return query.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      token: data.token,
      tenantId,
      caseId: data.caseId,
      agentId: data.agentId,
      customerPhone: data.customerPhone,
      status: data.status,
      mode: data.mode,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      expiresAt: data.expiresAt?.toDate?.() || new Date(),
      startedAt: data.startedAt?.toDate?.(),
      endedAt: data.endedAt?.toDate?.(),
      metadata: data.metadata,
    };
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(tenantId: string): Promise<number> {
  const db = adminDb();
  const sessionsRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('visionscreen_sessions');
  
  const now = new Date();
  const query = await sessionsRef
    .where('status', 'in', ['pending', 'active'])
    .where('expiresAt', '<', now)
    .get();
  
  const batch = db.batch();
  query.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: 'expired',
      endedAt: FieldValue.serverTimestamp(),
    });
  });
  
  await batch.commit();
  return query.docs.length;
}

/**
 * Generate the customer-facing URL for joining a session
 */
export function getSessionJoinUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/visionscreen/${token}`;
}
