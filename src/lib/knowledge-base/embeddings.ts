import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Embedding model configuration
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 100; // OpenAI's limit for batch embedding
const RATE_LIMIT_DELAY = 100; // ms between batches to avoid rate limits

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  index: number;
}

// Generate embedding for a single text
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  
  return response.data[0].embedding;
}

// Generate embeddings for multiple texts (with batching and rate limiting)
export async function generateEmbeddings(
  texts: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<EmbeddingResult[]> {
  const client = getOpenAIClient();
  const results: EmbeddingResult[] = [];
  
  // Process in batches
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE);
    const batchIndices = batch.map((_, idx) => i + idx);
    
    try {
      const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
        dimensions: EMBEDDING_DIMENSIONS,
      });
      
      // Map embeddings back to texts
      for (let j = 0; j < response.data.length; j++) {
        results.push({
          text: batch[j],
          embedding: response.data[j].embedding,
          index: batchIndices[j],
        });
      }
      
      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + MAX_BATCH_SIZE, texts.length), texts.length);
      }
      
      // Rate limiting delay between batches
      if (i + MAX_BATCH_SIZE < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error) {
      console.error(`Error generating embeddings for batch starting at ${i}:`, error);
      throw error;
    }
  }
  
  // Sort by original index to maintain order
  return results.sort((a, b) => a.index - b.index);
}

// Compute cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
}

// Get embedding dimension
export function getEmbeddingDimension(): number {
  return EMBEDDING_DIMENSIONS;
}

// Token estimation for embedding input
export function estimateEmbeddingTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

// Check if text is within embedding model's context limit
export function isWithinContextLimit(text: string, maxTokens: number = 8191): boolean {
  return estimateEmbeddingTokens(text) <= maxTokens;
}
