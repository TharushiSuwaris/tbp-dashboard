"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMemberNotifications,
  getStaffNotifications,
  markMessagesSeen,
  markOpportunitiesSeen,
  type NotificationItem,
} from "@/lib/portal/notifications";
import { isStaffRole } from "@/lib/portal/session";

export function NotificationBell({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const result = isStaffRole(role) ? await getStaffNotifications(userId, role) : await getMemberNotifications(userId);
      setItems(result);
    } catch {
      // Non-fatal - notifications are a convenience, not core functionality.
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleItemClick(item: NotificationItem) {
    if (item.label === "New Messages") markMessagesSeen(userId);
    if (item.label === "New Investment Opportunities") markOpportunitiesSeen(userId);
    setOpen(false);
    router.push(item.href);
    setTimeout(load, 500);
  }

  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <div ref={ref} style={{ position: "relative", lineHeight: 1 }}>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setOpen((v) => !v)}>
        <span style={{ fontSize: 18 }}>🔔</span>
        {total > 0 && (
          <div
            style={{
              position: "absolute", top: -4, right: -6,
              minWidth: 16, height: 16, padding: "0 3px",
              background: "#EF4444", borderRadius: 8,
              fontSize: 9, fontWeight: 800, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #091524",
            }}
          >
            {total > 9 ? "9+" : total}
          </div>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 0,
            width: 280,
            background: "#0A1624",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#7B8EAA", textTransform: "uppercase", letterSpacing: ".6px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            Notifications
          </div>
          {items.length === 0 ? (
            <div style={{ padding: "16px 14px", fontSize: 12.5, color: "#4A5C70" }}>Nothing new.</div>
          ) : (
            items.map((item) => (
              <div
                key={item.label}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: "11px 14px",
                  fontSize: 12.5,
                  color: "#E8EFF8",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span>{item.label}</span>
                <span style={{ color: "#C4992A", fontWeight: 700 }}>{item.count}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
