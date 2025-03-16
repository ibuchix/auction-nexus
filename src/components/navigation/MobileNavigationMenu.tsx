
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon } from "lucide-react";
import { menuItems } from "@/constants/sidebarMenuItems";

export function MobileNavigationMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationGroups = [
    {
      name: "Dashboard",
      items: menuItems.filter(item => item.title === "Dashboard")
    },
    {
      name: "Auctions",
      items: menuItems.filter(item => item.title === "Auctions")
    },
    {
      name: "User Management",
      items: menuItems.filter(item => ["User Management", "Listing Management"].includes(item.title))
    },
    {
      name: "Risk & Insights",
      items: menuItems.filter(item => ["Risk Management", "Insights"].includes(item.title))
    },
    {
      name: "System",
      items: menuItems.filter(item => ["System Management", "Communications", "System"].includes(item.title))
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <div className="py-4">
          <nav className="flex flex-col gap-2">
            {navigationGroups.map(group => (
              <div key={group.name} className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">{group.name}</h3>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <div key={item.title}>
                      {item.path ? (
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start" 
                          onClick={() => handleNavigate(item.path as string)}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Button>
                      ) : (
                        <>
                          <div className="px-2 py-1.5 text-sm font-medium flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                          </div>
                          {item.submenu && (
                            <div className="pl-6 space-y-1">
                              {item.submenu.map(subItem => (
                                <Button
                                  key={subItem.title}
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => handleNavigate(subItem.path)}
                                >
                                  {subItem.title}
                                </Button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
