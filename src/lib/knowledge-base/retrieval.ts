import { generateEmbedding } from './embeddings';
import { queryVectors, VectorMetadata } from '../pinecone';

export interface RetrievalResult {
  content: string;
  score: number;
  metadata: {
    kbId: string;
    docId: string;
    product: string;
    chunkIndex: number;
    language: string;
  };
}

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  product?: string;
  kbId?: string;
  language?: string;
}

// Retrieve relevant chunks for a query
export async function retrieveRelevantChunks(
  tenantId: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  const {
    topK = 5,
    minScore = 0.7,
    product,
    kbId,
    language,
  } = options;
  
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  // Build filter based on options
  const filter: Record<string, unknown> = {};
  if (product) {
    filter.product = { $eq: product };
  }
  if (kbId) {
    filter.kbId = { $eq: kbId };
  }
  if (language) {
    filter.language = { $eq: language };
  }
  
  // Query Pinecone
  const results = await queryVectors(tenantId, queryEmbedding, {
    topK,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    includeMetadata: true,
  });
  
  // Filter by minimum score and format results
  return results
    .filter((result) => result.score >= minScore)
    .map((result) => ({
      content: result.metadata?.content || '',
      score: result.score,
      metadata: {
        kbId: result.metadata?.kbId || '',
        docId: result.metadata?.docId || '',
        product: result.metadata?.product || '',
        chunkIndex: result.metadata?.chunkIndex || 0,
        language: result.metadata?.language || 'en',
      },
    }));
}

// Assemble context for AI prompt from retrieved chunks
export function assembleContext(
  chunks: RetrievalResult[],
  maxTokens: number = 2000
): string {
  if (chunks.length === 0) {
    return '';
  }
  
  // Sort by score descending
  const sortedChunks = [...chunks].sort((a, b) => b.score - a.score);
  
  // Estimate tokens (roughly 4 chars per token)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  
  let context = '';
  let totalTokens = 0;
  
  for (const chunk of sortedChunks) {
    const chunkTokens = estimateTokens(chunk.content);
    
    if (totalTokens + chunkTokens > maxTokens) {
      // Try to add a truncated version
      const remainingTokens = maxTokens - totalTokens;
      const truncatedContent = chunk.content.slice(0, remainingTokens * 4);
      if (truncatedContent.length > 100) {
        context += `\n---\n${truncatedContent}...`;
      }
      break;
    }
    
    context += `\n---\n${chunk.content}`;
    totalTokens += chunkTokens;
  }
  
  return context.trim();
}

// Format context with source citations
export function assembleContextWithSources(
  chunks: RetrievalResult[],
  maxTokens: number = 2000
): { context: string; sources: Array<{ kbId: string; docId: string; product: string }> } {
  if (chunks.length === 0) {
    return { context: '', sources: [] };
  }
  
  const sortedChunks = [...chunks].sort((a, b) => b.score - a.score);
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  
  let context = '';
  let totalTokens = 0;
  const sources: Array<{ kbId: string; docId: string; product: string }> = [];
  const seenSources = new Set<string>();
  
  for (let i = 0; i < sortedChunks.length; i++) {
    const chunk = sortedChunks[i];
    const chunkTokens = estimateTokens(chunk.content);
    
    if (totalTokens + chunkTokens > maxTokens) {
      break;
    }
    
    // Add source reference
    const sourceKey = `${chunk.metadata.kbId}:${chunk.metadata.docId}`;
    if (!seenSources.has(sourceKey)) {
      seenSources.add(sourceKey);
      sources.push({
        kbId: chunk.metadata.kbId,
        docId: chunk.metadata.docId,
        product: chunk.metadata.product,
      });
    }
    
    context += `\n[Source ${sources.length}]\n${chunk.content}`;
    totalTokens += chunkTokens;
  }
  
  return {
    context: context.trim(),
    sources,
  };
}

// Build system prompt with KB context
export function buildRAGPrompt(
  basePrompt: string,
  context: string,
  productName?: string
): string {
  if (!context) {
    return basePrompt;
  }
  
  const contextHeader = productName
    ? `The following is relevant documentation from the ${productName} knowledge base:`
    : 'The following is relevant documentation from the knowledge base:';
  
  return `${basePrompt}

${contextHeader}

${context}

---

Use the above documentation to inform your responses. If the documentation contains the answer, provide it with confidence. If the documentation doesn't cover the user's question, acknowledge that and provide general guidance.`;
}

// Quick relevance check (without full retrieval)
export async function hasRelevantContent(
  tenantId: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<boolean> {
  const results = await retrieveRelevantChunks(tenantId, query, {
    ...options,
    topK: 1,
    minScore: 0.75,
  });
  
  return results.length > 0;
}
