
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  SidebarMenuItem as SidebarMenuItemType,
} from "@/constants/sidebarMenuItems";
import {
  SidebarMenuItem as SidebarMenuItemComponent,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarSubmenu } from "./SidebarSubmenu";

interface SidebarMenuItemProps {
  item: SidebarMenuItemType;
  isActive: (path: string) => boolean;
  openGroups: string[];
  toggleGroup: (title: string) => void;
}

export function SidebarMenuItemRenderer({
  item,
  isActive,
  openGroups,
  toggleGroup,
}: SidebarMenuItemProps) {
  const isGroupOpen = openGroups.includes(item.title);

  return (
    <SidebarMenuItemComponent key={item.title}>
      {item.submenu ? (
        <SidebarSubmenu 
          item={item} 
          isOpen={isGroupOpen}
          onToggle={() => toggleGroup(item.title)}
          isActive={isActive}
        />
      ) : (
        <SidebarMenuButton
          asChild
          className={cn(
            "hover:bg-iris-light group",
            isActive(item.path as string) && "bg-iris-light text-iris font-medium"
          )}
          tooltip={item.shortcut}
        >
          <Link to={item.path as string} className="flex items-center gap-3">
            <item.icon className="h-5 w-5 group-hover:text-iris" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      )}
    </SidebarMenuItemComponent>
  );
}
