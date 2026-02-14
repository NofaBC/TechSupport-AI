import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is not set');
    }
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
}

export function getPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX || 'techsupport-kb';
  return getPineconeClient().index(indexName);
}

export interface VectorMetadata {
  tenantId: string;
  kbId: string;
  docId: string;
  product: string;
  chunkIndex: number;
  content: string;
  language: string;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

// Upsert vectors to Pinecone (batch)
export async function upsertVectors(
  tenantId: string,
  vectors: VectorRecord[]
): Promise<void> {
  if (vectors.length === 0) return;
  
  const index = getPineconeIndex();
  const namespace = index.namespace(tenantId);
  
  // Pinecone recommends batches of 100 vectors
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await namespace.upsert({
      records: batch.map(v => ({
        id: v.id,
        values: v.values,
        metadata: v.metadata as unknown as Record<string, string | number | boolean>,
      })),
    });
  }
}

// Query vectors from Pinecone
export async function queryVectors(
  tenantId: string,
  queryVector: number[],
  options: {
    topK?: number;
    filter?: Record<string, unknown>;
    includeMetadata?: boolean;
  } = {}
): Promise<Array<{ id: string; score: number; metadata?: VectorMetadata }>> {
  const index = getPineconeIndex();
  const namespace = index.namespace(tenantId);
  
  const results = await namespace.query({
    vector: queryVector,
    topK: options.topK || 5,
    filter: options.filter,
    includeMetadata: options.includeMetadata ?? true,
  });
  
  return (results.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: match.metadata as VectorMetadata | undefined,
  }));
}

// Delete vectors by KB ID
export async function deleteVectorsByKB(
  tenantId: string,
  kbId: string
): Promise<void> {
  const index = getPineconeIndex();
  const namespace = index.namespace(tenantId);
  
  // Delete by metadata filter
  await namespace.deleteMany({
    filter: { kbId: { $eq: kbId } },
  });
}

// Delete vectors by document ID
export async function deleteVectorsByDocument(
  tenantId: string,
  kbId: string,
  docId: string
): Promise<void> {
  const index = getPineconeIndex();
  const namespace = index.namespace(tenantId);
  
  // Delete by metadata filter
  await namespace.deleteMany({
    filter: {
      kbId: { $eq: kbId },
      docId: { $eq: docId },
    },
  });
}

// Delete entire namespace (all vectors for a tenant)
export async function deleteNamespace(tenantId: string): Promise<void> {
  const index = getPineconeIndex();
  const namespace = index.namespace(tenantId);
  await namespace.deleteAll();
}

// Get index stats
export async function getIndexStats(): Promise<{
  dimension: number;
  totalVectorCount: number;
  namespaces: Record<string, { vectorCount: number }>;
}> {
  const index = getPineconeIndex();
  const stats = await index.describeIndexStats();
  
  // Map namespaces to our expected format
  const namespaces: Record<string, { vectorCount: number }> = {};
  if (stats.namespaces) {
    for (const [key, value] of Object.entries(stats.namespaces)) {
      namespaces[key] = { vectorCount: value.recordCount || 0 };
    }
  }
  
  return {
    dimension: stats.dimension || 1536,
    totalVectorCount: stats.totalRecordCount || 0,
    namespaces,
  };
}
