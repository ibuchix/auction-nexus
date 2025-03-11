
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { menuItems } from "@/constants/sidebarMenuItems";
import { SidebarMenuItemRenderer } from "./sidebar/SidebarMenuItem";
import { SidebarSearch } from "./sidebar/SidebarSearch";

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
            <SidebarSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItemRenderer
                  key={item.title}
                  item={item}
                  isActive={isActive}
                  openGroups={openGroups}
                  toggleGroup={toggleGroup}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
