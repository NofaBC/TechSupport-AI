// Smart text chunker for knowledge base documents
// Splits text into semantic chunks with overlap for context continuity

export interface ChunkOptions {
  maxTokens?: number;      // Target max tokens per chunk (default: 500)
  minTokens?: number;      // Minimum tokens per chunk (default: 100)
  overlapTokens?: number;  // Overlap between chunks (default: 50)
}

export interface TextChunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
  tokenEstimate: number;
}

// Rough token estimation (1 token ≈ 4 characters for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Split text into sentences
function splitIntoSentences(text: string): string[] {
  // Split on sentence endings, keeping the delimiter
  const sentenceEndings = /([.!?]+[\s\n]+|[\n]{2,})/g;
  const parts = text.split(sentenceEndings);
  
  const sentences: string[] = [];
  let current = '';
  
  for (const part of parts) {
    if (sentenceEndings.test(part)) {
      current += part;
      if (current.trim()) {
        sentences.push(current.trim());
      }
      current = '';
    } else {
      current += part;
    }
  }
  
  if (current.trim()) {
    sentences.push(current.trim());
  }
  
  return sentences;
}

// Split text into paragraphs
function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).filter((p) => p.trim());
}

// Main chunking function
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const {
    maxTokens = 500,
    minTokens = 100,
    overlapTokens = 50,
  } = options;
  
  const chunks: TextChunk[] = [];
  
  // Clean and normalize text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
  
  if (!cleanText) return [];
  
  // First, try splitting by headers (markdown-style)
  const headerPattern = /^(#{1,6})\s+(.+)$/gm;
  const hasHeaders = headerPattern.test(cleanText);
  
  if (hasHeaders) {
    // Split by headers for better semantic boundaries
    const sections = cleanText.split(/(?=^#{1,6}\s+)/m).filter((s) => s.trim());
    let charOffset = 0;
    
    for (const section of sections) {
      const sectionChunks = chunkSection(section, maxTokens, minTokens, overlapTokens);
      
      for (const chunk of sectionChunks) {
        chunks.push({
          ...chunk,
          index: chunks.length,
          startChar: charOffset + chunk.startChar,
          endChar: charOffset + chunk.endChar,
        });
      }
      
      charOffset += section.length;
    }
  } else {
    // No headers, chunk by paragraphs and sentences
    const sectionChunks = chunkSection(cleanText, maxTokens, minTokens, overlapTokens);
    chunks.push(...sectionChunks.map((chunk, i) => ({ ...chunk, index: i })));
  }
  
  return chunks;
}

// Chunk a single section
function chunkSection(
  text: string,
  maxTokens: number,
  minTokens: number,
  overlapTokens: number
): Omit<TextChunk, 'index'>[] {
  const chunks: Omit<TextChunk, 'index'>[] = [];
  const paragraphs = splitIntoParagraphs(text);
  
  let currentChunk = '';
  let currentStartChar = 0;
  let charOffset = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);
    const currentTokens = estimateTokens(currentChunk);
    
    // If paragraph alone is too big, split by sentences
    if (paragraphTokens > maxTokens) {
      // First, flush current chunk if not empty
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          startChar: currentStartChar,
          endChar: charOffset,
          tokenEstimate: estimateTokens(currentChunk),
        });
        currentChunk = '';
      }
      
      // Split large paragraph into sentence-based chunks
      const sentences = splitIntoSentences(paragraph);
      let sentenceChunk = '';
      let sentenceStartChar = charOffset;
      
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence);
        const chunkTokens = estimateTokens(sentenceChunk);
        
        if (chunkTokens + sentenceTokens > maxTokens && sentenceChunk.trim()) {
          chunks.push({
            content: sentenceChunk.trim(),
            startChar: sentenceStartChar,
            endChar: charOffset,
            tokenEstimate: chunkTokens,
          });
          
          // Start new chunk with overlap
          const overlapText = getOverlapText(sentenceChunk, overlapTokens);
          sentenceChunk = overlapText + ' ' + sentence;
          sentenceStartChar = charOffset - overlapText.length;
        } else {
          sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
        }
        
        charOffset += sentence.length + 1;
      }
      
      // Don't lose remaining sentences
      if (sentenceChunk.trim()) {
        currentChunk = sentenceChunk;
        currentStartChar = sentenceStartChar;
      }
    } else if (currentTokens + paragraphTokens > maxTokens) {
      // Would exceed max, save current chunk and start new one
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          startChar: currentStartChar,
          endChar: charOffset,
          tokenEstimate: currentTokens,
        });
      }
      
      // Start new chunk with overlap from previous
      const overlapText = getOverlapText(currentChunk, overlapTokens);
      currentChunk = overlapText + '\n\n' + paragraph;
      currentStartChar = charOffset - overlapText.length;
      charOffset += paragraph.length + 2;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      charOffset += paragraph.length + 2;
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim() && estimateTokens(currentChunk) >= minTokens) {
    chunks.push({
      content: currentChunk.trim(),
      startChar: currentStartChar,
      endChar: charOffset,
      tokenEstimate: estimateTokens(currentChunk),
    });
  } else if (currentChunk.trim() && chunks.length > 0) {
    // Merge small last chunk with previous
    const lastChunk = chunks[chunks.length - 1];
    lastChunk.content += '\n\n' + currentChunk.trim();
    lastChunk.endChar = charOffset;
    lastChunk.tokenEstimate = estimateTokens(lastChunk.content);
  } else if (currentChunk.trim()) {
    // Only chunk, even if small
    chunks.push({
      content: currentChunk.trim(),
      startChar: currentStartChar,
      endChar: charOffset,
      tokenEstimate: estimateTokens(currentChunk),
    });
  }
  
  return chunks;
}

// Get overlap text from the end of a chunk
function getOverlapText(text: string, overlapTokens: number): string {
  const targetChars = overlapTokens * 4;
  if (text.length <= targetChars) return text;
  
  // Try to break at a sentence boundary
  const endPortion = text.slice(-targetChars * 2);
  const sentences = splitIntoSentences(endPortion);
  
  if (sentences.length > 1) {
    // Take the last complete sentence(s) that fit
    let overlap = '';
    for (let i = sentences.length - 1; i >= 0; i--) {
      const candidate = sentences.slice(i).join(' ');
      if (candidate.length <= targetChars) {
        overlap = candidate;
      }
    }
    return overlap || text.slice(-targetChars);
  }
  
  return text.slice(-targetChars);
}

// Utility: Extract text from common document formats
export function extractTextFromMarkdown(content: string): string {
  // Remove code blocks
  let text = content.replace(/```[\s\S]*?```/g, '\n[code block]\n');
  
  // Remove inline code
  text = text.replace(/`[^`]+`/g, '[code]');
  
  // Remove images but keep alt text
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  
  // Convert links to just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  return text;
}

export function extractTextFromHTML(content: string): string {
  // Remove script and style tags
  let text = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  
  return text;
}
