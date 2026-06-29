"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { mockTasks } from "@/lib/mock-data/tasks";
import type { Task, TaskStatus } from "@/types";

const statusCols: TaskStatus[] = ["Todo", "In Progress", "Review", "Done"];

const statusColors: Record<TaskStatus, string> = {
  "Todo": "#8B5CF6",
  "In Progress": "#F59E0B",
  "Review": "#3B82F6",
  "Done": "#10B981",
};

const priorityColors = { High: "#DC2626", Medium: "#D97706", Low: "#059669" };

function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.status !== "Done" && new Date(task.dueDate) < new Date();
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8,
      padding: "12px 14px", transition: "box-shadow 0.15s", cursor: "pointer",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#1A2B45", flex: 1, lineHeight: 1.4 }}>{task.title}</div>
        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: priorityColors[task.priority] + "18", color: priorityColors[task.priority], fontWeight: 700, marginLeft: 8, whiteSpace: "nowrap" }}>
          {task.priority}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "#5A6B7F", lineHeight: 1.5, marginBottom: 8 }}>{task.description.slice(0, 80)}...</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 10, background: "#F4F6FA", padding: "2px 8px", borderRadius: 6, color: "#5A6B7F" }}>{task.assignedTo}</span>
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{ fontSize: 10, background: "rgba(196,153,42,0.1)", padding: "2px 8px", borderRadius: 6, color: "#92711A" }}>{tag}</span>
          ))}
        </div>
        <span style={{ fontSize: 10, color: isOverdue ? "#DC2626" : "#8899AA", fontWeight: isOverdue ? 700 : 400 }}>
          {isOverdue ? "⚠ Overdue " : ""}Due {task.dueDate}
        </span>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks] = useState(mockTasks);
  const [filterOwner, setFilterOwner] = useState("");

  const owners = Array.from(new Set(tasks.map((t) => t.assignedTo)));
  const filtered = filterOwner ? tasks.filter((t) => t.assignedTo === filterOwner) : tasks;

  return (
    <>
      <Topbar title="Task Board" subtitle={`${tasks.length} tasks across the team — ${tasks.filter(t => t.status === "Done").length} completed`} />
      <div style={{ padding: "24px 28px 40px" }}>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#5A6B7F", fontWeight: 600 }}>Filter by:</div>
          <button
            onClick={() => setFilterOwner("")}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filterOwner === "" ? "#1A2B45" : "#fff", color: filterOwner === "" ? "#fff" : "#5A6B7F" }}
          >All</button>
          {owners.map((owner) => (
            <button key={owner}
              onClick={() => setFilterOwner(owner)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filterOwner === owner ? "#1A2B45" : "#fff", color: filterOwner === owner ? "#fff" : "#5A6B7F" }}
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
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#1A2B45" }}>{status}</span>
                  <span style={{ fontSize: 11, background: statusColors[status] + "18", color: statusColors[status], padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{col.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.length === 0 && (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: 11, color: "#8899AA", background: "#fff", border: "1px dashed #E2E8F0", borderRadius: 8 }}>No tasks</div>
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
