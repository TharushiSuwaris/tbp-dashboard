"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { mockDocuments } from "@/lib/mock-data/documents";
import type { DocumentStatus } from "@/types";

const categories = ["Core Documents", "Corridor Briefs", "Compliance", "Technical Notes", "Prospect Briefing Packs", "Templates", "Research"];

function StatusChip({ status }: { status: DocumentStatus }) {
  const styles: Record<DocumentStatus, React.CSSProperties> = {
    "Draft": { background: "rgba(139,92,246,0.1)", color: "#7C3AED" },
    "In Review": { background: "rgba(245,158,11,0.1)", color: "#D97706" },
    "Approved (Internal)": { background: "rgba(59,130,246,0.1)", color: "#2563EB" },
    "Approved (External)": { background: "rgba(16,185,129,0.1)", color: "#059669" },
    "Archived": { background: "rgba(0,0,0,0.05)", color: "#9CA3AF" },
  };
  return <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, ...styles[status] }}>{status}</span>;
}

export default function DocumentsPage() {
  return (
    <>
      <Topbar title="Data Room / Documents" subtitle={`${mockDocuments.length} documents tracked — manage versions, approvals, and prospect links`} />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#7f1d1d" }}>
          🔒 All documents in this data room are for <strong>internal TBP use only</strong> unless explicitly marked "Approved (External)". Sharing any document externally requires prior TBP Leadership and legal adviser sign-off.
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Documents", value: mockDocuments.length, color: "#C4992A" },
            { label: "Approved Internal", value: mockDocuments.filter(d => d.approvedInternal).length, color: "#3B82F6" },
            { label: "Approved External", value: mockDocuments.filter(d => d.approvedExternal).length, color: "#10B981" },
            { label: "In Review", value: mockDocuments.filter(d => d.status === "In Review").length, color: "#F59E0B" },
            { label: "Draft", value: mockDocuments.filter(d => d.status === "Draft").length, color: "#8B5CF6" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
              <div style={{ fontSize: 24, fontWeight: 900, color: "#1A2B45" }}>{c.value}</div>
              <div style={{ fontSize: 11, color: "#5A6B7F" }}>{c.label}</div>
            </div>
          ))}
        </div>

        {categories.map((cat) => {
          const docs = mockDocuments.filter((d) => d.category === cat);
          if (docs.length === 0) return null;
          return (
            <Panel key={cat} title={cat} style={{ marginBottom: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Document", "Status", "Owner", "Version", "Last Updated", "Internal", "External", "Notes"].map((h) => (
                      <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#8899AA", padding: "0 8px 8px 0", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6FA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0" }}>
                        <div style={{ fontWeight: 600, color: "#1A2B45", fontSize: 13 }}>{doc.title}</div>
                        {doc.linkedProspects.length > 0 && (
                          <div style={{ fontSize: 10, color: "#8899AA" }}>Linked to {doc.linkedProspects.length} prospect{doc.linkedProspects.length > 1 ? "s" : ""}</div>
                        )}
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0" }}><StatusChip status={doc.status} /></td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#5A6B7F" }}>{doc.owner}</td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#5A6B7F" }}>{doc.version}</td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#5A6B7F" }}>{doc.lastUpdated}</td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", textAlign: "center" }}>
                        <span style={{ fontSize: 14 }}>{doc.approvedInternal ? "✅" : "❌"}</span>
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", textAlign: "center" }}>
                        <span style={{ fontSize: 14 }}>{doc.approvedExternal ? "✅" : "❌"}</span>
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: "#5A6B7F", maxWidth: 220 }}>{doc.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
