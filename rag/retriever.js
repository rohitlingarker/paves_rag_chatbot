import { pipeline } from "@xenova/transformers";

let sections = [];
let embedder = null;

function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

export async function initRAG() {
  const response = await fetch("./rag/websiteEmbeddings.json"); // static load
  const raw = await response.json();
  sections = raw;

  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("✅ RAG system initialized in browser.");
}

export async function retrieveRelevantSections(query, topK = 5) {
  if (!embedder) throw new Error("RAG not initialized.");
  const output = await embedder(query, { pooling: "mean", normalize: true });
  const queryEmb = output.data;

  console.log("First section embedding:", sections[0].embedding);
console.log("Query embedding:", queryEmb);


  return sections
    .map(sec => ({
      ...sec,
      score: cosineSimilarity(sec.embedding, queryEmb),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function generateRAGContext(query, topK = 5) {
  const topSections = await retrieveRelevantSections(query, topK);
  return topSections.map(s => `From ${s.url}:\n${s.text}`).join("\n\n");
}
