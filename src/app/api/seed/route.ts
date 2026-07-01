export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase/client";
import { mockTasks } from "@/lib/mock-data/tasks";
import { mockDocuments } from "@/lib/mock-data/documents";

// ── CSV parser ────────────────────────────────────────────────────
function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (c === "," && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function readCSV(filename: string): Record<string, string>[] {
  const filePath = path.join(process.cwd(), "data", filename);
  // Strip UTF-8 BOM if present (PowerShell 5.1 adds it)
  let content = fs.readFileSync(filePath, "utf-8").replace(/^﻿/, "");
  const lines = content.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

// ── Region mapping (Excel labels → DB enum) ───────────────────────
const REGION_MAP: Record<string, string> = {
  "Central Asia":          "Central Asia",
  "Indonesia":             "Southeast Asia",
  "Malaysia":              "Southeast Asia",
  "Singapore":             "Southeast Asia",
  "Sri Lanka":             "South Asia",
  "New York / New Jersey": "North America",
};

// ── Seed handler ──────────────────────────────────────────────────
export async function GET() {
  const errors: string[] = [];
  const counts: Record<string, number> = {};

  // 1 — prospects (anchor table, must come first)
  const p1 = readCSV("01_prospects.csv");
  const { error: e1 } = await supabase.from("prospects").upsert(
    p1.map((r) => ({
      id:             r.id,
      prospect_name:  r.prospect_name,
      prospect_type:  r.prospect_type,
      country:        r.country,
      city:           r.city,
      region:         REGION_MAP[r.region] ?? r.region,
    })),
    { onConflict: "id" }
  );
  if (e1) errors.push(`prospects: ${e1.message}`);
  counts.prospects = p1.length;

  // 2 — prospect_profiles
  const p2 = readCSV("02_prospect_profiles.csv");
  const { error: e2 } = await supabase.from("prospect_profiles").upsert(
    p2.map((r) => ({
      prospect_id:                    r.prospect_id,
      family_or_group_background:     r.family_or_group_background     || null,
      investment_philosophy:          r.investment_philosophy           || null,
      long_horizon_capital_indicators:  r.long_horizon_capital_indicators  === "true",
      permanent_capital_indicators:     r.permanent_capital_indicators     === "true",
      direct_investment_activity:       r.direct_investment_activity       === "true",
      governance_stewardship_language:  r.governance_stewardship_language  === "true",
      infrastructure_exposure:        r.infrastructure_exposure        || null,
      energy_exposure:                r.energy_exposure                || null,
      logistics_transport_exposure:   r.logistics_transport_exposure   || null,
      real_estate_exposure:           r.real_estate_exposure           || null,
      technology_digital_exposure:    r.technology_digital_exposure    || null,
      emerging_markets_exposure:      r.emerging_markets_exposure      || null,
    })),
    { onConflict: "prospect_id" }
  );
  if (e2) errors.push(`prospect_profiles: ${e2.message}`);
  counts.profiles = p2.length;

  // 3 — prospect_sources
  const p3 = readCSV("03_prospect_sources.csv");
  const { error: e3 } = await supabase.from("prospect_sources").upsert(
    p3.map((r) => ({
      prospect_id:        r.prospect_id,
      website:            r.website            || null,
      public_source_url:  r.public_source_url  || null,
      source_quality:     r.source_quality     || null,
      key_public_contacts: r.key_public_contacts || null,
      email:              r.email              || null,
      address:            r.address            || null,
    })),
    { onConflict: "prospect_id" }
  );
  if (e3) errors.push(`prospect_sources: ${e3.message}`);
  counts.sources = p3.length;

  // 4 — prospect_scores
  const p4 = readCSV("04_prospect_scores.csv");
  const { error: e4 } = await supabase.from("prospect_scores").upsert(
    p4.map((r) => ({
      prospect_id:                    r.prospect_id,
      suitability_score:              parseInt(r.suitability_score)              || 0,
      classification:                 r.classification                           || null,
      family_office_fit:              parseInt(r.family_office_fit)              || 0,
      permanent_capital_orientation:  parseInt(r.permanent_capital_orientation)  || 0,
      sector_alignment:               parseInt(r.sector_alignment)               || 0,
      governance_institutional_mindset: parseInt(r.governance_institutional_mindset) || 0,
      strategic_adjacency_tbp:        parseInt(r.strategic_adjacency_tbp)        || 0,
      engagement_readiness:           parseInt(r.engagement_readiness)           || 0,
    })),
    { onConflict: "prospect_id" }
  );
  if (e4) errors.push(`prospect_scores: ${e4.message}`);
  counts.scores = p4.length;

  // 5 — prospect_analysis
  const p5 = readCSV("05_prospect_analysis.csv");
  const { error: e5 } = await supabase.from("prospect_analysis").upsert(
    p5.map((r) => ({
      prospect_id:                  r.prospect_id,
      tbp_relevance_summary:        r.tbp_relevance_summary        || null,
      best_tbp_entry_point:         r.best_tbp_entry_point         || null,
      suggested_conversation_angle: r.suggested_conversation_angle || null,
      recommended_contact_route:    r.recommended_contact_route    || null,
    })),
    { onConflict: "prospect_id" }
  );
  if (e5) errors.push(`prospect_analysis: ${e5.message}`);
  counts.analysis = p5.length;

  // 6 — prospect_pipeline
  const p6 = readCSV("06_prospect_pipeline.csv");
  const { error: e6 } = await supabase.from("prospect_pipeline").upsert(
    p6.map((r) => ({
      prospect_id:          r.prospect_id,
      pipeline_stage:       r.pipeline_stage       || "Identified",
      assigned_owner:       r.assigned_owner        || "TBP Advisory",
      next_action:          r.next_action           || null,
      next_action_date:     r.next_action_date      || null,
      briefing_pack_status: r.briefing_pack_status  || "Not Generated",
    })),
    { onConflict: "prospect_id" }
  );
  if (e6) errors.push(`prospect_pipeline: ${e6.message}`);
  counts.pipeline = p6.length;

  // 7 — prospect_sectors (multi-row: delete then re-insert)
  const p7 = readCSV("07_prospect_sectors.csv");
  const sectorIds = [...new Set(p7.map((r) => r.prospect_id))];
  await supabase.from("prospect_sectors").delete().in("prospect_id", sectorIds);
  const { error: e7 } = await supabase.from("prospect_sectors").insert(
    p7.map((r) => ({ prospect_id: r.prospect_id, sector: r.sector }))
  );
  if (e7) errors.push(`prospect_sectors: ${e7.message}`);
  counts.sectors = p7.length;

  // 8 — prospect_diligence (multi-row: delete then re-insert)
  const p8 = readCSV("08_prospect_diligence.csv");
  const diligenceIds = [...new Set(p8.map((r) => r.prospect_id))];
  await supabase.from("prospect_diligence").delete().in("prospect_id", diligenceIds);
  const { error: e8 } = await supabase.from("prospect_diligence").insert(
    p8.map((r) => ({
      prospect_id: r.prospect_id,
      type:        r.type       || "flag",
      content:     r.content    || null,
      sort_order:  parseInt(r.sort_order) || 1,
    }))
  );
  if (e8) errors.push(`prospect_diligence: ${e8.message}`);
  counts.diligence = p8.length;

  // ── Tasks (mock data, unchanged) ──────────────────────────────
  const taskRows = mockTasks.map((t) => ({
    id:               t.id,
    title:            t.title,
    description:      t.description,
    assigned_to:      t.assignedTo,
    status:           t.status,
    priority:         t.priority,
    due_date:         t.dueDate,
    linked_prospects: t.linkedProspects,
    tags:             t.tags,
  }));
  const { error: te } = await supabase.from("tasks").upsert(taskRows, { onConflict: "id" });
  if (te) errors.push(`tasks: ${te.message}`);
  counts.tasks = taskRows.length;

  // ── Documents (mock data, unchanged) ─────────────────────────
  const docRows = mockDocuments.map((d) => ({
    id:                d.id,
    title:             d.title,
    status:            d.status,
    owner:             d.owner,
    version:           d.version,
    last_updated:      d.lastUpdated,
    approved_internal: d.approvedInternal,
    approved_external: d.approvedExternal,
    linked_prospects:  d.linkedProspects,
    notes:             d.notes,
    category:          d.category,
  }));
  const { error: de } = await supabase.from("documents").upsert(docRows, { onConflict: "id" });
  if (de) errors.push(`documents: ${de.message}`);
  counts.documents = docRows.length;

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors, counts }, { status: 500 });
  }

  return NextResponse.json({ ok: true, seeded: counts });
}
