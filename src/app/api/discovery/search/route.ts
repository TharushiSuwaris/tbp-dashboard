export const dynamic = "force-dynamic";
// Gemini web search can take 20-30s; 60 is the Hobby-plan ceiling without Fluid Compute.
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { searchProspects } from "@/lib/ai/live-search";
import { CIRCLES } from "@/lib/ai/circles";

export async function POST(request: Request) {
  const body = await request.json();
  const { circle, country, maxResults } = body as { circle?: string; country?: string; maxResults?: number };

  if (!circle || !CIRCLES[circle]) {
    return NextResponse.json({ error: "circle must be one of: " + Object.keys(CIRCLES).join(", ") }, { status: 400 });
  }
  if (!country || !country.trim()) {
    return NextResponse.json({ error: "country is required" }, { status: 400 });
  }

  try {
    const result = await searchProspects(circle, country.trim(), Math.min(maxResults ?? 8, 15));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Search failed" }, { status: 500 });
  }
}
