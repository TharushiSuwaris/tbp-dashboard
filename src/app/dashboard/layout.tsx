import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FA" }}>
      <Sidebar />
      <main style={{ marginLeft: 244, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
