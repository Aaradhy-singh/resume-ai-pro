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
      collapsible="offcanvas"
      style={{ "--sidebar-width": "200px" } as React.CSSProperties}
      className="border-r border-[#1a1a1a] bg-[#000000]"
    >
      <SidebarContent className="bg-[#000000]">
        <div className="p-5 mb-2 mt-2 border-b border-[#1a1a1a]">
          <NavLink to="/" end className="flex items-center text-decoration-none">
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', color: '#ffffff', letterSpacing: '0.05em' }}>ResumeAI</span>
          </NavLink>
        </div>
        <SidebarGroup className="px-0 pt-4">
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#E0E0E0', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 20px', marginBottom: '12px' }}>
            TOOLS
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end
                    className={({ isActive }) =>
                      `flex items-center text-[13px] px-[20px] py-[10px] transition-colors border-l-2 ` +
                      (isActive
                        ? "text-[#ffffff] bg-[#111111] border-[#00e5ff]"
                        : "text-[#E0E0E0] bg-transparent hover:text-[#ffffff] hover:bg-[#111111] border-transparent")
                    }
                    style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', textDecoration: 'none' }}
                  >
                    <item.icon className="mr-3 h-[13px] w-[13px] text-current" />
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
