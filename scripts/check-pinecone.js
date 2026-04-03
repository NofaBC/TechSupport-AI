require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');

async function check() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const indexName = process.env.PINECONE_INDEX || 'techsupport-knowledge';
  
  console.log('Index name:', indexName);
  
  try {
    const desc = await pc.describeIndex(indexName);
    console.log('Index config:', JSON.stringify(desc, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

check();
