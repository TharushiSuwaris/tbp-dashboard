"use client";

import { useEffect, useState } from "react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import {
  createOpportunity,
  listAllOpportunities,
  updateOpportunityStatus,
  type Opportunity,
  type OpportunityStatus,
} from "@/lib/portal/content";

const panelStyle: React.CSSProperties = {
  background: portalTheme.panel,
  border: `1px solid ${portalTheme.panelBorder}`,
  borderRadius: 12,
  padding: "20px 22px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 13,
  boxSizing: "border-box",
};

const statusColor: Record<OpportunityStatus, string> = {
  draft: portalTheme.textMuted,
  published: "#34D399",
  closed: portalTheme.danger,
};

export default function ManageOpportunitiesPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setOpportunities(await listAllOpportunities());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
    }
  }

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim() || !category.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await createOpportunity({ title, category, description, status: "draft", created_by: user.id });
      setTitle("");
      setCategory("");
      setDescription("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create opportunity");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: OpportunityStatus) {
    try {
      await updateOpportunityStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  if (!user) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
            Opportunity Management
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
            Create, edit, and publish investment opportunities.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "none",
            background: portalTheme.gold,
            color: portalTheme.goldText,
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ New Opportunity"}
        </button>
      </div>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} style={{ ...panelStyle, marginBottom: 16, display: "grid", gap: 10 }}>
          <input style={inputStyle} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input style={inputStyle} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <textarea
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            disabled={saving}
            style={{
              justifySelf: "start",
              padding: "8px 16px",
              borderRadius: 7,
              border: "none",
              background: portalTheme.gold,
              color: portalTheme.goldText,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Create (as draft)"}
          </button>
        </form>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {opportunities.map((opp) => (
          <div key={opp.id} style={{ ...panelStyle, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ color: portalTheme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>
                {opp.category}
              </div>
              <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14 }}>{opp.title}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: statusColor[opp.status] }}>
                {opp.status}
              </span>
              <select
                value={opp.status}
                onChange={(e) => handleStatusChange(opp.id, e.target.value as OpportunityStatus)}
                style={{ ...inputStyle, width: "auto", padding: "6px 8px", fontSize: 12 }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
