import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export interface L3Agent {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  activeCase?: string;
  skills: string[]; // e.g., ['networking', 'hardware', 'software']
  maxConcurrentCases: number;
  currentCaseCount: number;
  lastActive: Date;
}

export interface L3QueueItem {
  id: string;
  caseId: string;
  caseNumber: string;
  tenantId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  customerName: string;
  summary: string;
  escalationReason: string;
  aiRecommendation?: string;
  requiredSkills?: string[];
  assignedAgentId?: string;
  assignedAgentName?: string;
  queuedAt: Date;
  assignedAt?: Date;
  status: 'queued' | 'assigned' | 'in_progress' | 'resolved';
  estimatedWaitMinutes?: number;
}

const COLLECTION = 'l3_queue';
const AGENTS_COLLECTION = 'l3_agents';

/**
 * Add a case to the L3 queue
 */
export async function addToL3Queue(
  data: Omit<L3QueueItem, 'id' | 'queuedAt' | 'status'>
): Promise<L3QueueItem> {
  const db = adminDb();
  const docRef = db.collection(COLLECTION).doc();
  
  const queueItem: Omit<L3QueueItem, 'id'> = {
    ...data,
    queuedAt: new Date(),
    status: 'queued',
  };

  await docRef.set({
    ...queueItem,
    queuedAt: FieldValue.serverTimestamp(),
  });

  return { id: docRef.id, ...queueItem };
}

/**
 * Get L3 queue for a tenant
 */
export async function getL3Queue(
  tenantId: string,
  options: {
    status?: L3QueueItem['status'] | L3QueueItem['status'][];
    assignedAgentId?: string;
    limit?: number;
  } = {}
): Promise<L3QueueItem[]> {
  const db = adminDb();
  let query = db.collection(COLLECTION)
    .where('tenantId', '==', tenantId)
    .orderBy('queuedAt', 'desc');

  if (options.status) {
    if (Array.isArray(options.status)) {
      query = query.where('status', 'in', options.status);
    } else {
      query = query.where('status', '==', options.status);
    }
  }

  if (options.assignedAgentId) {
    query = query.where('assignedAgentId', '==', options.assignedAgentId);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      queuedAt: (data.queuedAt as Timestamp)?.toDate() || new Date(),
      assignedAt: (data.assignedAt as Timestamp)?.toDate(),
    } as L3QueueItem;
  });
}

/**
 * Assign a queue item to an agent
 */
export async function assignToAgent(
  queueItemId: string,
  agentId: string,
  agentName: string
): Promise<void> {
  const db = adminDb();
  const batch = db.batch();

  // Update queue item
  const queueRef = db.collection(COLLECTION).doc(queueItemId);
  batch.update(queueRef, {
    assignedAgentId: agentId,
    assignedAgentName: agentName,
    assignedAt: FieldValue.serverTimestamp(),
    status: 'assigned',
  });

  // Update agent's case count
  const agentRef = db.collection(AGENTS_COLLECTION).doc(agentId);
  batch.update(agentRef, {
    currentCaseCount: FieldValue.increment(1),
    status: 'busy',
    lastActive: FieldValue.serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Update queue item status
 */
export async function updateQueueItemStatus(
  queueItemId: string,
  status: L3QueueItem['status']
): Promise<void> {
  const db = adminDb();
  await db.collection(COLLECTION).doc(queueItemId).update({ status });
}

/**
 * Get queue stats for a tenant
 */
export async function getQueueStats(tenantId: string): Promise<{
  queued: number;
  assigned: number;
  inProgress: number;
  avgWaitMinutes: number;
}> {
  const db = adminDb();
  const snapshot = await db.collection(COLLECTION)
    .where('tenantId', '==', tenantId)
    .where('status', 'in', ['queued', 'assigned', 'in_progress'])
    .get();

  let queued = 0;
  let assigned = 0;
  let inProgress = 0;
  let totalWaitTime = 0;
  let waitCount = 0;

  const now = new Date();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    switch (data.status) {
      case 'queued':
        queued++;
        const queuedAt = (data.queuedAt as Timestamp)?.toDate();
        if (queuedAt) {
          totalWaitTime += (now.getTime() - queuedAt.getTime()) / 60000;
          waitCount++;
        }
        break;
      case 'assigned':
        assigned++;
        break;
      case 'in_progress':
        inProgress++;
        break;
    }
  });

  return {
    queued,
    assigned,
    inProgress,
    avgWaitMinutes: waitCount > 0 ? Math.round(totalWaitTime / waitCount) : 0,
  };
}

/**
 * Get available L3 agents for a tenant
 */
export async function getAvailableAgents(tenantId: string): Promise<L3Agent[]> {
  const db = adminDb();
  const snapshot = await db.collection(AGENTS_COLLECTION)
    .where('tenantId', '==', tenantId)
    .where('status', '==', 'available')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      lastActive: (data.lastActive as Timestamp)?.toDate() || new Date(),
    } as L3Agent;
  });
}

/**
 * Mark case as resolved and free up agent
 */
export async function resolveL3Case(
  queueItemId: string,
  agentId: string
): Promise<void> {
  const db = adminDb();
  const batch = db.batch();

  // Update queue item
  const queueRef = db.collection(COLLECTION).doc(queueItemId);
  batch.update(queueRef, { status: 'resolved' });

  // Update agent's case count
  const agentRef = db.collection(AGENTS_COLLECTION).doc(agentId);
  const agentDoc = await agentRef.get();
  const agentData = agentDoc.data();
  
  const newCount = Math.max(0, (agentData?.currentCaseCount || 1) - 1);
  batch.update(agentRef, {
    currentCaseCount: newCount,
    status: newCount === 0 ? 'available' : 'busy',
    lastActive: FieldValue.serverTimestamp(),
  });

  await batch.commit();
}
