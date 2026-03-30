
import {
  LayoutDashboard,
  Gavel,
  AlertTriangle,
  LineChart,
  ScrollText,
  Users,
  FileCheck,
  CalendarClock,
  Settings,
} from "lucide-react";

export interface SidebarSubmenuItem {
  title: string;
  path: string;
}

export interface SidebarMenuItem {
  title: string;
  icon: React.ComponentType<any>;
  path?: string;
  shortcut?: string;
  submenu?: SidebarSubmenuItem[];
}

export const menuItems: SidebarMenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",  // Updated from "/admin" to "/"
    shortcut: "Alt+H",
  },
  {
    title: "System Management",
    icon: Settings,
    path: "/admin/system",
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
      {
        title: "Auction Scheduling",
        path: "/admin/auctions/scheduling",
      },
      {
        title: "Auction Outcomes",
        path: "/admin/auctions/outcomes",
      },
      {
        title: "Proxy Bids",
        path: "/admin/proxy-bids",
      }
    ],
  },
  {
    title: "User Management",
    icon: Users,
    submenu: [
      {
        title: "Users",
        path: "/admin/users",
      },
      {
        title: "Sellers",
        path: "/admin/sellers",
      },
      {
        title: "Dealer Verification",
        path: "/admin/dealers/verification",
      },
      {
        title: "Valuation Stats",
        path: "/admin/valuation-stats",
      },
      {
        title: "Reviews",
        path: "/admin/reviews",
      },
      {
        title: "Dealer Messaging",
        path: "/admin/dealer-messaging",
      },
    ],
  },
  {
    title: "Listing Management",
    icon: FileCheck,
    submenu: [
      {
        title: "Manual Valuation",
        path: "/admin/manual-valuation",
      }
    ],
  },
  {
    title: "Risk Management",
    icon: AlertTriangle,
    shortcut: "Alt+R",
    submenu: [
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
    submenu: [
      {
        title: "Platform Metrics",
        path: "/admin/metrics",
      },
      {
        title: "Analytics",
        path: "/admin/analytics",
      },
    ],
  },
  {
    title: "System",
    icon: ScrollText,
    submenu: [
      {
        title: "Audit Logs",
        path: "/admin/audit-logs",
      },
      {
        title: "System Settings",
        path: "/admin/settings",
      },
    ],
  },
];
