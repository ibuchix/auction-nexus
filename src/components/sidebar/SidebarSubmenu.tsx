
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { SidebarMenuItem } from "@/constants/sidebarMenuItems";

interface SidebarSubmenuProps {
  item: SidebarMenuItem;
  isOpen: boolean;
  onToggle: () => void;
  isActive: (path: string) => boolean;
}

export function SidebarSubmenu({ 
  item, 
  isOpen, 
  onToggle, 
  isActive 
}: SidebarSubmenuProps) {
  if (!item.submenu) return null;
  
  // Check if any submenu item is active to highlight parent
  const isSubmenuActive = item.submenu.some(subItem => isActive(subItem.path));
  
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton 
          className={cn(
            "w-full justify-between hover:bg-iris-light group",
            isSubmenuActive && "bg-iris-light text-iris font-medium"
          )}
          tooltip={item.shortcut}
        >
          <div className="flex items-center gap-3">
            <item.icon className={cn("h-5 w-5", isSubmenuActive ? "text-iris" : "group-hover:text-iris")} />
            <span>{item.title}</span>
          </div>
          {isOpen ? (
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
  );
}
