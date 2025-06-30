import json
import os
from sentence_transformers import SentenceTransformer
import numpy as np

# Load model (MiniLM)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Load website sections with embeddings
with open(os.path.join(os.path.dirname(__file__), "websiteEmbeddings.json"), "r", encoding="utf-8") as f:
    sections = json.load(f)

# Preprocess embeddings to numpy arrays
for section in sections:
    section["embedding"] = np.array(section["embedding"], dtype=np.float32)

# Cosine similarity function
def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Retrieve top-k relevant sections
def retrieve_relevant_sections(query, top_k=5):
    query_embedding = model.encode(query, normalize_embeddings=True)

    scored_sections = []
    for section in sections:
        score = cosine_similarity(section["embedding"], query_embedding)
        scored_sections.append({**section, "score": score})

    scored_sections.sort(key=lambda x: x["score"], reverse=True)
    return scored_sections[:top_k]

# Generate RAG context string
def generate_rag_context(query, top_k=5):
    top_sections = retrieve_relevant_sections(query, top_k)
    context = "\n\n".join([f"From {s['url']}:\n{s['text']}" for s in top_sections])
    return context
