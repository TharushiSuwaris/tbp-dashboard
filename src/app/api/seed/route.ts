import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { mockProspects } from "@/lib/mock-data/prospects";
import { mockTasks } from "@/lib/mock-data/tasks";
import { mockDocuments } from "@/lib/mock-data/documents";

export async function GET() {
  const errors: string[] = [];

  // ── Prospects ──────────────────────────────────────────────
  const { error: pe } = await supabase.from("prospects").upsert(
    mockProspects,
    { onConflict: "id" }
  );
  if (pe) errors.push(`prospects: ${pe.message}`);

  // ── Tasks ──────────────────────────────────────────────────
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

  // ── Documents ─────────────────────────────────────────────
  const docRows = mockDocuments.map((d) => ({
    id:               d.id,
    title:            d.title,
    status:           d.status,
    owner:            d.owner,
    version:          d.version,
    last_updated:     d.lastUpdated,
    approved_internal: d.approvedInternal,
    approved_external: d.approvedExternal,
    linked_prospects: d.linkedProspects,
    notes:            d.notes,
    category:         d.category,
  }));
  const { error: de } = await supabase.from("documents").upsert(docRows, { onConflict: "id" });
  if (de) errors.push(`documents: ${de.message}`);

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    seeded: {
      prospects: mockProspects.length,
      tasks:     mockTasks.length,
      documents: mockDocuments.length,
    },
  });
}
