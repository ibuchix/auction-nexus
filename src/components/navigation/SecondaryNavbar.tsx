
// NOTE: This component is currently not in use in the application.
// It was removed to eliminate duplicate navigation bars.
// Consider removing this file in a future cleanup if it remains unused.

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { menuItems, SidebarSubmenuItem } from "@/constants/sidebarMenuItems";

export function SecondaryNavbar() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [subsections, setSubsections] = useState<SidebarSubmenuItem[]>([]);

  useEffect(() => {
    // Determine which section is active based on the current path
    const currentPath = location.pathname;
    
    // Find the main section that contains the current path
    const matchingMainItem = menuItems.find(item => {
      if (item.path && currentPath.includes(item.path.split('/').filter(Boolean)[1] || '')) {
        return true;
      }
      
      // Check if any submenu item matches the current path
      if (item.submenu) {
        return item.submenu.some(subItem => 
          currentPath.includes(subItem.path.split('/').filter(Boolean)[1] || '')
        );
      }
      
      return false;
    });
    
    if (matchingMainItem) {
      setActiveSection(matchingMainItem.title);
      setSubsections(matchingMainItem.submenu || []);
    } else {
      setActiveSection(null);
      setSubsections([]);
    }
  }, [location.pathname]);
  
  // Don't render anything if there's no active section or no subsections
  if (!activeSection || subsections.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-100 py-2 px-4 border-b">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-500 mr-3">{activeSection}:</span>
            {subsections.map((subsection) => (
              <Button
                key={subsection.path}
                variant="ghost"
                size="sm"
                className={`text-sm rounded-full ${
                  location.pathname === subsection.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:text-primary hover:bg-primary/5"
                }`}
                asChild
              >
                <Link to={subsection.path}>{subsection.title}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
