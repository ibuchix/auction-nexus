import {
  LayoutDashboard,
  Gavel,
  AlertTriangle,
  LineChart,
  Bell,
  ScrollText,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    shortcut: "Alt+H",
  },
  {
    title: "Auctions",
    icon: Gavel,
    shortcut: "Alt+A",
    submenu: [
      {
        title: "Monitor Auctions",
        path: "/admin/auctions/monitor",
      },
      {
        title: "Manage Auctions",
        path: "/admin/auctions/manage",
      },
    ],
  },
  {
    title: "Risk Management",
    icon: AlertTriangle,
    shortcut: "Alt+R",
    submenu: [
      {
        title: "Disputes",
        path: "/admin/disputes",
      },
      {
        title: "Fraud Detection",
        path: "/admin/fraud",
      },
      {
        title: "Compliance",
        path: "/admin/compliance",
      },
    ],
  },
  {
    title: "Insights",
    icon: LineChart,
    path: "/admin/analytics",
  },
  {
    title: "Communications",
    icon: Bell,
    path: "/admin/announcements",
  },
  {
    title: "System",
    icon: ScrollText,
    path: "/admin/audit-logs",
  },
];

export function AppSidebar() {
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((group) => group !== title)
        : [...prev, title]
    );
  };

  const filteredItems = menuItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.submenu?.some((subItem) =>
      subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-6">
          <h1 className="text-xl font-kanit font-bold text-primary">Auction Manager</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 mb-4">
              <SidebarInput
                type="search"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <Collapsible
                      open={openGroups.includes(item.title)}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          className="w-full justify-between hover:bg-iris-light group"
                          tooltip={item.shortcut}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 group-hover:text-iris" />
                            <span>{item.title}</span>
                          </div>
                          {openGroups.includes(item.title) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "hover:bg-iris-light",
                                  isActive(subItem.path) && "bg-iris-light text-iris font-medium"
                                )}
                              >
                                <Link
                                  to={subItem.path}
                                  className="pl-9 flex items-center gap-3"
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "hover:bg-iris-light group",
                        isActive(item.path) && "bg-iris-light text-iris font-medium"
                      )}
                      tooltip={item.shortcut}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 group-hover:text-iris" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}