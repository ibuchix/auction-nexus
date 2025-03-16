
import { useState } from "react";
import { Link } from "react-router-dom";
import { MainNavigationMenu } from "./MainNavigationMenu";
import { UserActionsMenu } from "./UserActionsMenu";
import { MobileNavigationMenu } from "./MobileNavigationMenu";
import { useAdmin } from "@/context/AdminContext";

export function TopNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin } = useAdmin();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-md">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <MobileNavigationMenu />
          
          <Link to="/admin" className="flex items-center">
            <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></h1>
          </Link>
        </div>
        
        <MainNavigationMenu />
        
        <UserActionsMenu 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationCount={3}
        />
      </div>
    </header>
  );
}
