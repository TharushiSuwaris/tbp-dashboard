"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useTasks } from "@/lib/hooks/useSupabaseData";
// Panel removed — not used in kanban layout
import type { Task, TaskStatus } from "@/types";

const statusCols: TaskStatus[] = ["Todo", "In Progress", "Review", "Done"];

const statusColors: Record<TaskStatus, string> = {
  "Todo":        "#8B5CF6",
  "In Progress": "#F59E0B",
  "Review":      "#3B82F6",
  "Done":        "#10B981",
};

const priorityColors = { High: "#F87171", Medium: "#FBBF24", Low: "#34D399" };

function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.status !== "Done" && new Date(task.dueDate) < new Date();
  return (
    <div
      style={{
        background: "#D4EBF2", border: "1px solid rgba(27,42,61,0.07)", borderRadius: 8,
        padding: "12px 14px", transition: "border-color 0.15s", cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(58,159,192,0.35)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(27,42,61,0.07)")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#1B2A3D", flex: 1, lineHeight: 1.4 }}>{task.title}</div>
        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: priorityColors[task.priority] + "22", color: priorityColors[task.priority], fontWeight: 700, marginLeft: 8, whiteSpace: "nowrap" }}>
          {task.priority}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "#756E5D", lineHeight: 1.5, marginBottom: 8 }}>{task.description.slice(0, 80)}...</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 10, background: "rgba(27,42,61,0.06)", padding: "2px 8px", borderRadius: 6, color: "#756E5D" }}>{task.assignedTo}</span>
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{ fontSize: 10, background: "rgba(58,159,192,0.12)", padding: "2px 8px", borderRadius: 6, color: "#D4AA3A" }}>{tag}</span>
          ))}
        </div>
        <span style={{ fontSize: 10, color: isOverdue ? "#F87171" : "#5C5648", fontWeight: isOverdue ? 700 : 400 }}>
          {isOverdue ? "⚠ Overdue " : ""}Due {task.dueDate}
        </span>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, loading } = useTasks();
  const [filterOwner, setFilterOwner] = useState("");

  if (loading) return (
    <div style={{ padding: 28, color: "#756E5D", fontSize: 13 }}>Loading tasks from database...</div>
  );

  const owners = Array.from(new Set(tasks.map((t) => t.assignedTo)));
  const filtered = filterOwner ? tasks.filter((t) => t.assignedTo === filterOwner) : tasks;

  return (
    <>
      <Topbar title="Task Board" subtitle={`${tasks.length} tasks across the team — ${tasks.filter(t => t.status === "Done").length} completed`} />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#756E5D", fontWeight: 600 }}>Filter by:</div>
          <button
            onClick={() => setFilterOwner("")}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(27,42,61,0.1)", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filterOwner === "" ? "#3A9FC0" : "rgba(27,42,61,0.06)", color: filterOwner === "" ? "#D4EBF2" : "#756E5D" }}
          >All</button>
          {owners.map((owner) => (
            <button key={owner}
              onClick={() => setFilterOwner(owner)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(27,42,61,0.1)", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filterOwner === owner ? "#3A9FC0" : "rgba(27,42,61,0.06)", color: filterOwner === owner ? "#D4EBF2" : "#756E5D" }}
            >{owner}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {statusCols.map((status) => {
            const col = filtered.filter((t) => t.status === status);
            return (
              <div key={status}>
                <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColors[status] }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#1B2A3D" }}>{status}</span>
                  <span style={{ fontSize: 11, background: statusColors[status] + "22", color: statusColors[status], padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{col.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.length === 0 && (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: 11, color: "#5C5648", background: "#FFFFFF", border: "1px dashed rgba(27,42,61,0.1)", borderRadius: 8 }}>No tasks</div>
                  )}
                  {col.map((task) => <TaskCard key={task.id} task={task} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
