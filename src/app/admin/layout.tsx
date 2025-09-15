import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="flex-1 min-h-screen bg-card">
        {children}
      </main>
    </SidebarProvider>
  );
}
