require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

async function test() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  
  const indexName = process.env.PINECONE_INDEX || 'techsupport-knowledge';
  const index = pinecone.Index(indexName);
  
  console.log('Testing single vector upsert...');
  console.log('Index:', indexName);
  
  // Generate a test embedding
  const testText = 'This is a test document for knowledge base upload.';
  console.log('Generating embedding for:', testText);
  
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: testText,
  });
  
  const embedding = embeddingResponse.data[0].embedding;
  console.log('Embedding dimension:', embedding.length);
  
  // Create test vector
  const testVector = {
    id: 'test_vector_' + Date.now(),
    values: embedding,
    metadata: {
      text: testText,
      product: 'Test',
      type: 'test'
    }
  };
  
  console.log('Vector ID:', testVector.id);
  console.log('Vector values length:', testVector.values.length);
  console.log('Metadata:', testVector.metadata);
  
  // Try upsert - SDK v7 requires { records: [...] } format
  try {
    console.log('\nAttempting upsert with records format...');
    await index.upsert({ records: [testVector] });
    console.log('✅ Upsert succeeded!');
  } catch (e) {
    console.error('❌ Upsert failed:', e.message);
    console.error('Full error:', e);
  }
}

test().catch(console.error);
