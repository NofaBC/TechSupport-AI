/**
 * TechSupport AI - Knowledge Base Upload Script
 * 
 * This script uploads markdown knowledge base files to Pinecone vector database
 * for use by TechSupport AI's RAG (Retrieval-Augmented Generation) system.
 * 
 * Usage:
 *   node scripts/upload-knowledge-bases.js
 * 
 * Requirements:
 *   - Pinecone API key configured
 *   - OpenAI API key configured (for embeddings)
 *   - Knowledge base files in knowledge-bases/ directory
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

// Configuration
const KNOWLEDGE_BASE_DIR = path.join(__dirname, '../knowledge-bases');
const CHUNK_SIZE = 1000; // characters per chunk
const OVERLAP = 200; // overlap between chunks

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

/**
 * Knowledge base file metadata
 * Updated April 16, 2026: Rebranded CareerPilot AI to Dlyn AI
 */
const KNOWLEDGE_BASE_FILES = [
  // TechSupport AI specific KB files (primary source)
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\LEVEL1_BASIC_SUPPORT.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'technical_support',
      support_levels: ['level_1'],
      version: '2.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\LEVEL2_TROUBLESHOOTING.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'technical_support',
      support_levels: ['level_2'],
      version: '2.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\LEVEL3_ESCALATION_GUIDE.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'escalation_guide',
      support_levels: ['level_3'],
      version: '2.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\DLYN_KB_SUMMARY.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'general_docs',
      support_levels: ['level_1', 'level_2', 'level_3'],
      version: '2.0',
      priority: 'high'
    }
  },
  // Dlyn AI targeted KB articles
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\dlyn\\resume-parsing.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '2.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\dlyn\\ats-scoring.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '2.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\dlyn\\interview-sim.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '2.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\dlyn\\salary-data.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '2.0',
      priority: 'medium'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\dlyn\\QUICK_REFERENCE.md',
    metadata: {
      product: 'Dlyn AI',
      type: 'quick_reference',
      support_levels: ['level_1'],
      version: '2.0',
      priority: 'high'
    }
  },
  // Magazinify AI targeted KB articles
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\magazinify\\QUICK_REFERENCE.md',
    metadata: {
      product: 'Magazinify AI',
      type: 'quick_reference',
      support_levels: ['level_1'],
      version: '1.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\magazinify\\magazine-generation.md',
    metadata: {
      product: 'Magazinify AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '1.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\magazinify\\flipbook-viewer.md',
    metadata: {
      product: 'Magazinify AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '1.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\magazinify\\billing.md',
    metadata: {
      product: 'Magazinify AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '1.0',
      priority: 'high'
    }
  },
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\magazinify\\onboarding.md',
    metadata: {
      product: 'Magazinify AI',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '1.0',
      priority: 'high'
    }
  },
  // Factory-wide (applies to all NOFA products)
  {
    path: 'C:\\Users\\fnass\\TechSupport-AI\\knowledge-bases\\factory-wide\\auth.md',
    metadata: {
      product: 'NOFA AI Factory',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2', 'level_3'],
      version: '1.0',
      priority: 'high'
    }
  },
];

/**
 * Split markdown content into chunks
 */
function chunkMarkdown(content, chunkSize = CHUNK_SIZE, overlap = OVERLAP) {
  const chunks = [];

  // Split by sections (## headings) first for better semantic chunking
  const sections = content.split(/(?=^##\s)/gm);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed || trimmed.length < 10) continue; // Skip empty or tiny sections
    
    if (trimmed.length <= chunkSize) {
      // Section fits in one chunk
      chunks.push(trimmed);
    } else {
      // Split large sections into smaller chunks
      for (let i = 0; i < trimmed.length; i += chunkSize - overlap) {
        const chunk = trimmed.slice(i, i + chunkSize).trim();
        if (chunk && chunk.length >= 10) {
          chunks.push(chunk);
        }
      }
    }
  }

  // If no ## sections found, chunk the whole content
  if (chunks.length === 0 && content.trim().length > 0) {
    const trimmed = content.trim();
    for (let i = 0; i < trimmed.length; i += chunkSize - overlap) {
      const chunk = trimmed.slice(i, i + chunkSize).trim();
      if (chunk && chunk.length >= 10) {
        chunks.push(chunk);
      }
    }
  }

  return chunks;
}

/**
 * Extract section title from markdown chunk
 */
function extractSectionTitle(chunk) {
  const match = chunk.match(/^##\s+(.+)$/m);
  return match ? match[1].trim() : 'General';
}

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large', // 3072 dimensions to match Pinecone index
      input: text.slice(0, 8000), // OpenAI limit
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

/**
 * Upload chunk to Pinecone
 */
async function uploadToPinecone(index, vectors) {
  if (!vectors || vectors.length === 0) {
    console.log('   ⚠️ No vectors to upload, skipping');
    return;
  }
  
  try {
    console.log(`   📤 Uploading ${vectors.length} vectors...`);
    // Pinecone SDK v7 requires { records: [...] } format
    await index.upsert({ records: vectors });
    console.log(`   ✅ Uploaded ${vectors.length} vectors to Pinecone`);
  } catch (error) {
    console.error('   ❌ Error uploading to Pinecone:', error.message);
    throw error;
  }
}

/**
 * Process a single knowledge base file
 */
async function processKnowledgeBase(fileConfig, index) {
  console.log(`\n📄 Processing: ${path.basename(fileConfig.path)}`);

  try {
    // Read file
    const content = fs.readFileSync(fileConfig.path, 'utf-8');
    console.log(`   File size: ${content.length} characters`);

    // Chunk content
    const chunks = chunkMarkdown(content);
    console.log(`   Created ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
      console.log(`   ⚠️ No chunks created, skipping file`);
      return { success: true, chunks: 0 };
    }

    // Process each chunk
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const sectionTitle = extractSectionTitle(chunk);

      console.log(`   Processing chunk ${i + 1}/${chunks.length}: ${sectionTitle}`);

      // Generate embedding
      const embedding = await generateEmbedding(chunk);

      // Create vector with metadata
      const vectorId = `${fileConfig.metadata.product.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${i}`;
      
      vectors.push({
        id: vectorId,
        values: embedding,
        metadata: {
          ...fileConfig.metadata,
          text: chunk,
          section: sectionTitle,
          chunk_index: i,
          total_chunks: chunks.length,
          file_name: path.basename(fileConfig.path),
          uploaded_at: new Date().toISOString(),
        },
      });

      // Upload in batches of 100 to avoid rate limits
      if (vectors.length >= 100) {
        await uploadToPinecone(index, vectors);
        vectors.length = 0; // Clear array
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit delay
      }
    }

    // Upload remaining vectors
    if (vectors.length > 0) {
      await uploadToPinecone(index, vectors);
    }

    console.log(`✅ Completed: ${path.basename(fileConfig.path)}`);
    return { success: true, chunks: chunks.length };

  } catch (error) {
    console.error(`❌ Error processing ${path.basename(fileConfig.path)}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main upload function
 */
async function uploadAllKnowledgeBases() {
  console.log('🚀 TechSupport AI - Knowledge Base Upload\n');
  console.log(`Total files to process: ${KNOWLEDGE_BASE_FILES.length}\n`);

  // Verify API keys
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY environment variable not set');
  }

  // Connect to Pinecone index
  const indexName = process.env.PINECONE_INDEX || 'techsupport-knowledge';
  const index = pinecone.Index(indexName);
  console.log(`📊 Connected to Pinecone index: ${indexName}\n`);

  // Process each file
  const results = [];
  let totalChunks = 0;

  for (const fileConfig of KNOWLEDGE_BASE_FILES) {
    const result = await processKnowledgeBase(fileConfig, index);
    results.push(result);
    if (result.success) {
      totalChunks += result.chunks;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total files processed: ${KNOWLEDGE_BASE_FILES.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total chunks uploaded: ${totalChunks}`);
  console.log('\n✨ Knowledge base upload complete!\n');

  // Exit with error code if any failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  uploadAllKnowledgeBases()
    .catch(error => {
      console.error('\n❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { uploadAllKnowledgeBases, processKnowledgeBase };
