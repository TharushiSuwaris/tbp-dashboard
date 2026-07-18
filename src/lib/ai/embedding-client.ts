// Server-only. Calls the embedding-service (Render, SBERT all-MiniLM-L6-v2) for the same
// cosine-similarity computation compute_similarity() does in discovery/score_*.py.

export async function computeSimilarity(referenceText: string, comparisonText: string): Promise<number> {
  const baseUrl = process.env.EMBEDDING_SERVICE_URL;
  if (!baseUrl) throw new Error("EMBEDDING_SERVICE_URL is not set");

  const res = await fetch(`${baseUrl}/similarity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference_text: referenceText, comparison_text: comparisonText }),
    // Render free tier can take 30-50s to wake from a cold start, plus first-inference
    // overhead loading the model. Kept under Vercel's 60s Hobby-plan function ceiling so this
    // throws a clean, catchable error instead of the platform silently killing the function.
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok) throw new Error(`Embedding service returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.cosine_similarity as number;
}
