import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ background: '#000000' }}>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0" style={{ background: '#000000' }}>
          <header style={{
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #1a1a1a',
            background: '#000000',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}>
            <SidebarTrigger style={{ color: '#555555' }} />
            <span className="md:hidden" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '14px', color: '#ffffff', marginLeft: '12px' }}>ResumeAI</span>
          </header>
          <div style={{ flex: 1, padding: '32px', overflowAuto: true }} className="p-4 md:p-8 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
