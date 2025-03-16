import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, Menu as MenuIcon } from "lucide-react";
import { menuItems, SidebarSubmenuItem } from "@/constants/sidebarMenuItems";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdmin } from "@/context/AdminContext";

export function TopNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAdmin } = useAdmin();
  
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

  const renderSubmenuItems = (submenu?: SidebarSubmenuItem[]) => {
    if (!submenu) return null;
    
    return submenu.map(item => (
      <DropdownMenuItem key={item.title} asChild>
        <Link 
          to={item.path} 
          className="w-full cursor-pointer hover:bg-accent"
        >
          {item.title}
        </Link>
      </DropdownMenuItem>
    ));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-md">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          {isMobile && (
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
          )}
          
          <Link to="/admin" className="flex items-center">
            <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></h1>
          </Link>
        </div>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationGroups.map(group => (
              <NavigationMenuItem key={group.name}>
                <NavigationMenuTrigger className="h-9 px-4">
                  {group.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid min-w-[200px] gap-1 p-4">
                    {group.items.map(item => (
                      <div key={item.title}>
                        {item.path ? (
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.path}
                              className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </NavigationMenuLink>
                        ) : (
                          <>
                            <div className="font-medium text-sm px-3 py-2 flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {item.submenu && (
                              <DropdownMenu>
                                <div className="ml-6 space-y-1">
                                  {item.submenu.map(subItem => (
                                    <NavigationMenuLink asChild key={subItem.title}>
                                      <Link
                                        to={subItem.path}
                                        className="flex items-center py-2 px-3 rounded-md hover:bg-accent text-sm"
                                      >
                                        {subItem.title}
                                      </Link>
                                    </NavigationMenuLink>
                                  ))}
                                </div>
                              </DropdownMenu>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block max-w-xs">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} notificationCount={3} />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative hidden sm:flex">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 px-1.5 min-w-5 h-5 flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
