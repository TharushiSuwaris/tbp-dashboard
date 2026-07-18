export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";

// Fire-and-forget: pings the embedding service's health check to give a cold Render
// instance a head start waking up while the (slower) search call is still running.
export async function GET() {
  const baseUrl = process.env.EMBEDDING_SERVICE_URL;
  if (!baseUrl) return NextResponse.json({ ok: false });
  try {
    await fetch(baseUrl, { signal: AbortSignal.timeout(55_000) });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
