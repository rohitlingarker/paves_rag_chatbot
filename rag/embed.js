import fs from "fs/promises";
import path from "path";
import { pipeline } from "@xenova/transformers";

const dataPath = path.join("../scrapper/websiteData.json");
const outputPath = path.join("./websiteEmbeddings.json");

async function runEmbedding() {
  const raw = await fs.readFile(dataPath, "utf-8");
  const sections = JSON.parse(raw);

  const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  const withEmbeddings = [];

  for (const section of sections) {
    const embedding = await embedder(section.text, { pooling: "mean", normalize: true });

    // Convert Float32Array to regular array
    const embeddingArray = Array.from(embedding.data);

    withEmbeddings.push({ ...section, embedding: embeddingArray });
  }

  await fs.writeFile(outputPath, JSON.stringify(withEmbeddings, null, 2), "utf-8");
  console.log(`✅ Saved embeddings to ${outputPath}`);
}

runEmbedding();
