# TechSupport AI - Knowledge Base Management

This directory contains knowledge base files and upload scripts for TechSupport AI's RAG (Retrieval-Augmented Generation) system.

## 📚 Knowledge Base Files

Currently configured to upload **13 markdown files** from CareerPilot AI:

### High Priority (Level 1-3 Support)
1. **CAREERPILOT_AI_SUPPORT_KNOWLEDGE_BASE.md** ⭐ (v1.1)
   - Customer technical support (Level 1, 2, 3)
   - Troubleshooting guides
   - Escalation framework

2. **SUBSCRIPTION_AND_CREDITS_KNOWLEDGE_BASE.md** (v1.1)
   - Pricing & billing info
   - Credit system explanation
   - Rollover policies

### Medium Priority (Level 2-3 Support)
3. **CAREERPILOT_AI_TECHNICAL_KNOWLEDGE_BASE.md** (v1.0)
   - Developer documentation
   - System architecture
   - API reference

4. **KNOWLEDGE_BASE.md** (v0.9.5)
   - General product documentation
   - Feature descriptions

5. **careerpilot_ecosystem_integration.md**
   - NOFA AI Factory integration
   - TechSupport AI integration docs

### Low Priority (Level 3 Support)
6. **STRIPE_INTEGRATION_GUIDE.md**
   - Payment integration technical docs

7. **BUG_TRACKING.md**
   - Known issues and bug reports

8. **TESTING_CHECKLIST.md**
   - QA documentation

9. **careerpilot_pricing_strategy.md**
   - Internal pricing strategy

---

## 🚀 Upload Process

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install openai @pinecone-database/pinecone
   ```

2. **Set environment variables:**
   ```bash
   # .env file
   OPENAI_API_KEY=sk-...
   PINECONE_API_KEY=...
   PINECONE_INDEX=techsupport-knowledge
   ```

### Running the Upload Script

**Option 1: Upload all 13 files**
```bash
node scripts/upload-knowledge-bases.js
```

**Option 2: Test with a single file first**
Edit `scripts/upload-knowledge-bases.js` and comment out files you don't want to upload yet.

### Expected Output
```
🚀 TechSupport AI - Knowledge Base Upload

Total files to process: 13

📊 Connected to Pinecone index: techsupport-knowledge

📄 Processing: CAREERPILOT_AI_SUPPORT_KNOWLEDGE_BASE.md
   File size: 95420 characters
   Created 87 chunks
   Processing chunk 1/87: Getting Started
   ...
✅ Completed: CAREERPILOT_AI_SUPPORT_KNOWLEDGE_BASE.md

...

============================================================
📊 UPLOAD SUMMARY
============================================================
Total files processed: 13
✅ Successful: 13
❌ Failed: 0
📦 Total chunks uploaded: 847

✨ Knowledge base upload complete!
```

---

## 📊 How It Works

### 1. **Chunking Strategy**
- Splits markdown by `## Headings` for semantic chunking
- Chunk size: 1000 characters
- Overlap: 200 characters (prevents context loss)

### 2. **Embedding Generation**
- Uses OpenAI `text-embedding-3-small` model
- Generates 1536-dimension vectors
- Cost: ~$0.02 per 1 million tokens

### 3. **Pinecone Upload**
Each chunk is uploaded with rich metadata:
```javascript
{
  id: "careerpilot_ai_1234567890_0",
  values: [0.123, -0.456, ...], // 1536-dim vector
  metadata: {
    product: "CareerPilot AI",
    type: "technical_support",
    support_levels: ["level_1", "level_2", "level_3"],
    version: "1.1",
    priority: "high",
    text: "## Getting Started\n...",
    section: "Getting Started",
    chunk_index: 0,
    total_chunks: 87,
    file_name: "CAREERPILOT_AI_SUPPORT_KNOWLEDGE_BASE.md",
    uploaded_at: "2026-03-12T23:15:00.000Z"
  }
}
```

### 4. **TechSupport AI Retrieval**
When a user asks a question:
1. Question is embedded using same model
2. Pinecone finds most similar chunks
3. Chunks are filtered by support level (Level 1, 2, or 3)
4. Retrieved context is passed to GPT-4 for answer generation

---

## 🔄 Updating Knowledge Bases

### After editing a markdown file:

**Option 1: Re-upload all files**
```bash
node scripts/upload-knowledge-bases.js
```
- Vectors will have new IDs (timestamped)
- Old vectors remain but won't be retrieved (lower similarity)

**Option 2: Delete old + upload new (recommended)**
```javascript
// In Pinecone console or via API:
await index.deleteMany({
  filter: { 
    product: { $eq: "CareerPilot AI" },
    file_name: { $eq: "CAREERPILOT_AI_SUPPORT_KNOWLEDGE_BASE.md" }
  }
});

// Then run upload script
node scripts/upload-knowledge-bases.js
```

---

## 📝 Adding New Knowledge Base Files

Edit `scripts/upload-knowledge-bases.js`:

```javascript
const KNOWLEDGE_BASE_FILES = [
  // ... existing files ...
  {
    path: 'C:\\Users\\fnass\\NewProduct\\NEW_KB.md',
    metadata: {
      product: 'New Product',
      type: 'technical_support',
      support_levels: ['level_1', 'level_2'],
      version: '1.0',
      priority: 'high'
    }
  },
];
```

---

## 🎯 Metadata Fields Explained

| Field | Purpose | Example |
|-------|---------|---------|
| `product` | Which product this KB covers | "CareerPilot AI" |
| `type` | Document category | "technical_support", "developer_docs" |
| `support_levels` | Which levels can use this | ["level_1", "level_2", "level_3"] |
| `version` | Document version | "1.1" |
| `priority` | Relevance priority | "high", "medium", "low" |
| `section` | Section within document | "Getting Started" |
| `chunk_index` | Position in document | 0, 1, 2... |

---

## 🔍 Querying the Knowledge Base

### Example: TechSupport AI Level 1 Query

```javascript
// User question: "How do I sign up?"

// 1. Generate embedding for question
const queryEmbedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'How do I sign up?'
});

// 2. Search Pinecone
const results = await index.query({
  vector: queryEmbedding.data[0].embedding,
  topK: 5,
  includeMetadata: true,
  filter: {
    product: { $eq: 'CareerPilot AI' },
    support_levels: { $in: ['level_1'] }, // Level 1 only
    priority: { $in: ['high', 'medium'] }
  }
});

// 3. Extract relevant context
const context = results.matches
  .map(match => match.metadata.text)
  .join('\n\n');

// 4. Generate response with GPT-4
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: `You are TechSupport AI Level 1. Use this knowledge base:\n\n${context}`
    },
    {
      role: 'user',
      content: 'How do I sign up?'
    }
  ]
});
```

---

## 💰 Cost Estimates

### One-time upload (13 files, ~500KB total):
- **Embeddings:** ~500,000 tokens ÷ 1000 chars/chunk × $0.02/1M tokens = **$0.01**
- **Pinecone storage:** ~850 vectors × $0.00005/vector/month = **$0.04/month**

### Per query:
- **Embedding:** 1 query × $0.02/1M tokens = **$0.000002**
- **Pinecone search:** 1 query × $0.0001 = **$0.0001**
- **GPT-4 response:** ~500 tokens × $0.03/1K tokens = **$0.015**

**Total per query: ~$0.015** (1.5 cents)

---

## 🐛 Troubleshooting

### "OPENAI_API_KEY not set"
```bash
# Add to .env file
OPENAI_API_KEY=sk-your-key-here
```

### "PINECONE_API_KEY not set"
```bash
# Add to .env file
PINECONE_API_KEY=your-key-here
```

### "Index not found: techsupport-knowledge"
Create the index in Pinecone console:
- Dimensions: 1536
- Metric: cosine
- Pod type: p1 (or serverless)

### Upload is slow
- Normal: ~2-3 seconds per chunk (rate limits)
- For 850 chunks: ~30-45 minutes total
- Run overnight if needed

### "File not found" error
Check file paths in `KNOWLEDGE_BASE_FILES` array. Use double backslashes for Windows paths:
```javascript
'C:\\Users\\fnass\\CareerPilot-AI\\file.md'
```

---

## 📦 File Locations

```
TechSupport-AI/
├── knowledge-bases/
│   └── README.md (this file)
├── scripts/
│   └── upload-knowledge-bases.js
└── .env

CareerPilot-AI/
├── CAREERPILOT_AI_SUPPORT_KNOWLEDGE_BASE.md ⭐
├── CAREERPILOT_AI_TECHNICAL_KNOWLEDGE_BASE.md
├── SUBSCRIPTION_AND_CREDITS_KNOWLEDGE_BASE.md
├── KNOWLEDGE_BASE.md
├── STRIPE_INTEGRATION_GUIDE.md
├── BUG_TRACKING.md
├── TESTING_CHECKLIST.md
├── careerpilot_ecosystem_integration.md
└── careerpilot_pricing_strategy.md
```

---

## ✅ Next Steps

1. **Configure environment variables** in `.env`
2. **Review file list** in `scripts/upload-knowledge-bases.js`
3. **Add 4 more files** to reach 13 total (currently 9 configured)
4. **Run upload script**: `node scripts/upload-knowledge-bases.js`
5. **Test retrieval** with sample queries
6. **Monitor Pinecone** dashboard for vector counts

---

**Last Updated:** March 12, 2026  
**Maintained By:** Farhad Nassiri (@NofaBC)  
**Part of:** NOFA AI Factory - TechSupport AI™
