import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './client';
import type { KnowledgeBase, KBDocument, KBStatus, KBDocStatus } from '@/types';

// Convert Firestore doc to KnowledgeBase
function docToKB(docSnap: DocumentSnapshot): KnowledgeBase | null {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    tenantId: data.tenantId,
    name: data.name,
    description: data.description,
    product: data.product,
    status: data.status,
    documentCount: data.documentCount || 0,
    chunkCount: data.chunkCount || 0,
    lastTrainedAt: data.lastTrainedAt?.toDate?.() || undefined,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as unknown as KnowledgeBase;
}

// Convert Firestore doc to KBDocument
function docToKBDocument(docSnap: DocumentSnapshot): KBDocument | null {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    knowledgeBaseId: data.knowledgeBaseId,
    filename: data.filename,
    fileType: data.fileType,
    fileSize: data.fileSize,
    storageUrl: data.storageUrl,
    status: data.status,
    chunkCount: data.chunkCount || 0,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  } as unknown as KBDocument;
}

// Get all knowledge bases for a tenant
export async function getKnowledgeBases(tenantId: string): Promise<KnowledgeBase[]> {
  if (!db) throw new Error('Firebase not initialized');
  
  const kbRef = collection(db, 'tenants', tenantId, 'knowledgeBases');
  const q = query(kbRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map((docSnap) => docToKB(docSnap))
    .filter((kb): kb is KnowledgeBase => kb !== null);
}

// Get a single knowledge base
export async function getKnowledgeBase(
  tenantId: string,
  kbId: string
): Promise<KnowledgeBase | null> {
  if (!db) throw new Error('Firebase not initialized');
  
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  const docSnap = await getDoc(kbRef);
  return docToKB(docSnap);
}

// Create a new knowledge base
export async function createKnowledgeBase(
  tenantId: string,
  data: { name: string; description: string; product: string }
): Promise<KnowledgeBase> {
  if (!db) throw new Error('Firebase not initialized');
  
  const kbRef = collection(db, 'tenants', tenantId, 'knowledgeBases');
  
  const newKB = {
    tenantId,
    name: data.name,
    description: data.description,
    product: data.product,
    status: 'processing' as KBStatus,
    documentCount: 0,
    chunkCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(kbRef, newKB);
  
  return {
    id: docRef.id,
    ...newKB,
    status: 'processing',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as KnowledgeBase;
}

// Update a knowledge base
export async function updateKnowledgeBase(
  tenantId: string,
  kbId: string,
  updates: Partial<Pick<KnowledgeBase, 'name' | 'description' | 'product' | 'status' | 'documentCount' | 'chunkCount'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  await updateDoc(kbRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Delete a knowledge base
export async function deleteKnowledgeBase(
  tenantId: string,
  kbId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  // Delete all documents first
  const docsRef = collection(db, 'tenants', tenantId, 'knowledgeBases', kbId, 'documents');
  const docsSnapshot = await getDocs(docsRef);
  
  for (const docSnap of docsSnapshot.docs) {
    await deleteDoc(docSnap.ref);
  }
  
  // Delete the KB itself
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  await deleteDoc(kbRef);
}

// Subscribe to KB updates
export function subscribeToKnowledgeBase(
  tenantId: string,
  kbId: string,
  callback: (kb: KnowledgeBase | null) => void
): () => void {
  if (!db) {
    callback(null);
    return () => {};
  }
  
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  return onSnapshot(kbRef, (docSnap) => {
    callback(docToKB(docSnap));
  });
}

// Get documents for a knowledge base
export async function getKBDocuments(
  tenantId: string,
  kbId: string
): Promise<KBDocument[]> {
  if (!db) throw new Error('Firebase not initialized');
  
  const docsRef = collection(db, 'tenants', tenantId, 'knowledgeBases', kbId, 'documents');
  const q = query(docsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map((docSnap) => docToKBDocument(docSnap))
    .filter((doc): doc is KBDocument => doc !== null);
}

// Add a document to a knowledge base
export async function addKBDocument(
  tenantId: string,
  kbId: string,
  data: {
    filename: string;
    fileType: KBDocument['fileType'];
    fileSize: number;
    storageUrl: string;
  }
): Promise<KBDocument> {
  if (!db) throw new Error('Firebase not initialized');
  
  const docsRef = collection(db, 'tenants', tenantId, 'knowledgeBases', kbId, 'documents');
  
  const newDoc = {
    knowledgeBaseId: kbId,
    filename: data.filename,
    fileType: data.fileType,
    fileSize: data.fileSize,
    storageUrl: data.storageUrl,
    status: 'uploading' as KBDocStatus,
    chunkCount: 0,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(docsRef, newDoc);
  
  // Update KB document count
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  const kbSnap = await getDoc(kbRef);
  if (kbSnap.exists()) {
    const currentCount = kbSnap.data().documentCount || 0;
    await updateDoc(kbRef, {
      documentCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });
  }
  
  return {
    id: docRef.id,
    ...newDoc,
    status: 'uploading',
    createdAt: new Date(),
  } as unknown as KBDocument;
}

// Update document status
export async function updateKBDocumentStatus(
  tenantId: string,
  kbId: string,
  docId: string,
  status: KBDocStatus,
  chunkCount?: number
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  const docRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId, 'documents', docId);
  const updates: Record<string, unknown> = { status };
  
  if (chunkCount !== undefined) {
    updates.chunkCount = chunkCount;
  }
  
  await updateDoc(docRef, updates);
}

// Delete a document from a knowledge base
export async function deleteKBDocument(
  tenantId: string,
  kbId: string,
  docId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  const docRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId, 'documents', docId);
  await deleteDoc(docRef);
  
  // Update KB document count
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  const kbSnap = await getDoc(kbRef);
  if (kbSnap.exists()) {
    const currentCount = kbSnap.data().documentCount || 0;
    await updateDoc(kbRef, {
      documentCount: Math.max(0, currentCount - 1),
      updatedAt: serverTimestamp(),
    });
  }
}

// Subscribe to documents updates
export function subscribeToKBDocuments(
  tenantId: string,
  kbId: string,
  callback: (docs: KBDocument[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }
  
  const docsRef = collection(db, 'tenants', tenantId, 'knowledgeBases', kbId, 'documents');
  const q = query(docsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs
      .map((docSnap) => docToKBDocument(docSnap))
      .filter((doc): doc is KBDocument => doc !== null);
    callback(docs);
  });
}

// Mark KB as ready after training
export async function markKBReady(
  tenantId: string,
  kbId: string,
  totalChunks: number
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  await updateDoc(kbRef, {
    status: 'ready',
    chunkCount: totalChunks,
    lastTrainedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Mark KB as error
export async function markKBError(
  tenantId: string,
  kbId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  
  const kbRef = doc(db, 'tenants', tenantId, 'knowledgeBases', kbId);
  await updateDoc(kbRef, {
    status: 'error',
    updatedAt: serverTimestamp(),
  });
}
