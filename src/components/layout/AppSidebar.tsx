import { FileText, BarChart3, CheckSquare, Compass } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Analyze Resume", url: "/upload", icon: FileText },
  { title: "Results", url: "/results", icon: BarChart3 },
  { title: "Action Plan", url: "/action-plan", icon: CheckSquare },
  { title: "Career Explorer", url: "/career-explorer", icon: Compass },
];

export function AppSidebar() {
  return (
    <Sidebar
      style={{ "--sidebar-width": "220px" } as React.CSSProperties}
      className="border-r border-[var(--border)] bg-[var(--bg-primary)] w-[220px]"
    >
      <SidebarContent className="bg-[var(--bg-primary)]">
        <div className="p-4 mb-2 mt-2">
          <NavLink to="/" end className="flex items-center">
            <span className="font-[var(--font-body)] text-[13px] tracking-[0.05em] text-[var(--text-primary)]">ResumeAI</span>
          </NavLink>
        </div>
        <SidebarGroup className="px-0">
          <div className="px-4 font-[var(--font-body)] text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-[8px]">
            Tools
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end
                    className={({ isActive }) =>
                      `flex items-center font-[var(--font-body)] text-[12px] px-[16px] py-[10px] rounded-none transition-colors border-l-2 ` +
                      (isActive
                        ? "text-[var(--accent)] bg-transparent border-[var(--accent)]"
                        : "text-[var(--text-secondary)] bg-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border-transparent")
                    }
                  >
                    <item.icon className="mr-3 h-[14px] w-[14px] text-current" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
