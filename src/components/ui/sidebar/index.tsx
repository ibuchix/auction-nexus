export { SidebarProvider, useSidebar } from "./SidebarContext"
export { SidebarBase } from "./SidebarBase"
export * from "./SidebarComponents"

// Re-export everything as a single component for backwards compatibility
import { SidebarProvider } from "./SidebarContext"
import { SidebarBase } from "./SidebarBase"
import * as Components from "./SidebarComponents"

export const Sidebar = SidebarBase
export {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./SidebarComponents"
