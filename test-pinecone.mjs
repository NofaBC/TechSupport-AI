import { Pinecone } from '@pinecone-database/pinecone';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manual env loading
const envPath = join(__dirname, '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch (e) { console.log('Warning: Could not load .env.local'); }

console.log('Testing Pinecone connection...');
console.log('API Key:', process.env.PINECONE_API_KEY ? `✓ Set (${process.env.PINECONE_API_KEY.substring(0,8)}...)` : '✗ Missing');
console.log('Index:', process.env.PINECONE_INDEX || 'techsupport-kb (default)');

try {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const indexName = process.env.PINECONE_INDEX || 'techsupport-kb';
  const index = pc.index(indexName);
  const stats = await index.describeIndexStats();
  console.log('\n✓ Connection successful!');
  console.log('Namespaces:', stats.namespaces ? Object.keys(stats.namespaces).length : 0);
  console.log('Total vectors:', stats.totalRecordCount || 0);
  console.log('Dimension:', stats.dimension);
} catch (err) {
  console.error('\n✗ Connection failed:', err.message);
}
