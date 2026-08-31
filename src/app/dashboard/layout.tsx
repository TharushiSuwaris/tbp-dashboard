import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#D4EBF2" }}>
      <AppHeader />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ marginLeft: 200, flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
