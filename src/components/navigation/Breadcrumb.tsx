
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  admin: "Admin Dashboard",
  auctions: "Auctions",
  monitor: "Monitor",
  manage: "Manage",
  scheduling: "Scheduling",
  disputes: "Disputes",
  analytics: "Analytics",
  announcements: "Announcements",
  fraud: "Fraud Detection",
  compliance: "Compliance",
  "audit-logs": "Audit Logs",
  dealers: "Dealers",
  sellers: "Sellers",
  verification: "Verification",
  listings: "Listings",
  purchases: "Purchases",
  users: "Users",
  settings: "Settings",
  "proxy-bids": "Proxy Bids",
};

export function BreadcrumbNav() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // For the root admin path, don't show redundant breadcrumb
  if (pathSegments.length === 1 && pathSegments[0] === "admin") {
    return null;
  }

  // Generate a unique key based on the current path
  const pathKey = location.pathname;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="text-iris hover:text-iris/90">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <BreadcrumbItem key={`${pathKey}-${index}`}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage className="text-foreground">
                  {label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={path}
                    className="text-iris hover:text-iris/90 font-kanit"
                  >
                    {label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
