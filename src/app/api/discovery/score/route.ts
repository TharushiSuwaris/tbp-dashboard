export const dynamic = "force-dynamic";
// Tier judgment + a cold-starting embedding service can approach 60-70s; 60 is the Hobby-plan
// ceiling without Fluid Compute. See the client-side warm-up ping in /api/discovery/warm,
// fired in parallel with search to give the embedding service a head start.
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { scoreProspect } from "@/lib/ai/live-scoring";
import { CIRCLES } from "@/lib/ai/circles";
import type { DiscoveredProspect } from "@/lib/ai/live-search";

export async function POST(request: Request) {
  const body = await request.json();
  const { circle, country, prospect } = body as { circle?: string; country?: string; prospect?: DiscoveredProspect };

  if (!circle || !CIRCLES[circle]) {
    return NextResponse.json({ error: "circle must be one of: " + Object.keys(CIRCLES).join(", ") }, { status: 400 });
  }
  if (!country || !prospect) {
    return NextResponse.json({ error: "country and prospect are required" }, { status: 400 });
  }

  try {
    const result = await scoreProspect(circle, country, prospect);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Scoring failed" }, { status: 500 });
  }
}
