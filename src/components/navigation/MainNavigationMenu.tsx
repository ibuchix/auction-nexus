
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
  DropdownMenuItem, 
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import { menuItems, SidebarSubmenuItem } from "@/constants/sidebarMenuItems";

interface NavigationGroupItem {
  name: string;
  items: typeof menuItems;
}

export function MainNavigationMenu() {
  const navigate = useNavigate();
  
  const navigationGroups: NavigationGroupItem[] = [
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
  };

  return (
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
  );
}
