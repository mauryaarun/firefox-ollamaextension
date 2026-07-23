// rag-worker.js - Web Worker for RAG indexing
// Receives chunks from main thread, calls embedding API, returns embeddings

self.onmessage = async (event) => {
  const { action, data } = event.data;

  if (action === 'embed-chunk') {
    try {
      const { chunk, index, baseUrl, model } = data;
      const res = await fetch(`${baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: chunk })
      });
      if (!res.ok) throw new Error(`Embedding API returned ${res.status}`);
      const result = await res.json();
      self.postMessage({
        action: 'chunk-embedded',
        data: { index, chunk, embedding: result.embedding }
      });
    } catch (e) {
      self.postMessage({
        action: 'embed-error',
        data: { index: data.index, error: e.message }
      });
    }
  }

  if (action === 'hybrid-search') {
    try {
      const { query, chunks, queryEmbedding, topK } = data;
      const queryTerms = tokenize(query);
      const docFreqs = computeDocFreqs(chunks.map(c => c.text));

      const scored = chunks.map((chunk, i) => {
        const vecScore = cosineSimilarity(queryEmbedding, chunk.embedding);
        const bm25Score = bm25ScoreQuery(queryTerms, chunk.text, docFreqs, chunks.length);
        // Weighted hybrid: 70% vector, 30% keyword
        const combined = (0.7 * normalize(vecScore)) + (0.3 * normalize(bm25Score));
        return { ...chunk, score: combined, vecScore, bm25Score };
      });

      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, topK);
      self.postMessage({ action: 'search-results', data: { results: top } });
    } catch (e) {
      self.postMessage({ action: 'search-error', data: { error: e.message } });
    }
  }
};

// ===== BM25 Implementation =====
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

const STOPWORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','should','could','may','might','can',
  'this','that','these','those','it','its','as','from','up','about','into'
]);

function computeDocFreqs(texts) {
  const df = {};
  for (const text of texts) {
    const terms = new Set(tokenize(text));
    for (const term of terms) {
      df[term] = (df[term] || 0) + 1;
    }
  }
  return df;
}

function bm25ScoreQuery(queryTerms, docText, docFreqs, totalDocs, k1 = 1.5, b = 0.75) {
  const docTerms = tokenize(docText);
  const termFreq = {};
  for (const t of docTerms) termFreq[t] = (termFreq[t] || 0) + 1;
  const avgDl = docTerms.length || 1;
  const dl = docTerms.length;

  let score = 0;
  for (const term of queryTerms) {
    const tf = termFreq[term] || 0;
    if (tf === 0) continue;
    const df = docFreqs[term] || 0;
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgDl)));
    score += idf * tfNorm;
  }
  return score;
}

function normalize(x) {
  // Sigmoid normalization to [0,1]
  return 1 / (1 + Math.exp(-x));
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}