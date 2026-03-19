import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[var(--bg-primary)]">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
          <header className="h-14 flex items-center border-b border-[var(--border)] bg-[var(--bg-primary)] px-4 shrink-0">
            <SidebarTrigger className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-transparent" />
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
