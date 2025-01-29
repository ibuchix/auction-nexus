import { Home, Gavel, AlertTriangle, LineChart, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "../AppSidebar";
import { useState } from "react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <nav className="flex items-center justify-around h-16">
          <Link to="/" className="flex flex-col items-center space-y-1 text-subtitle hover:text-iris">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/admin/auctions/monitor" className="flex flex-col items-center space-y-1 text-subtitle hover:text-iris">
            <Gavel className="h-5 w-5" />
            <span className="text-xs">Auctions</span>
          </Link>
          <Link to="/admin/disputes" className="flex flex-col items-center space-y-1 text-subtitle hover:text-iris">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs">Disputes</span>
          </Link>
          <Link to="/admin/analytics" className="flex flex-col items-center space-y-1 text-subtitle hover:text-iris">
            <LineChart className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 text-subtitle hover:text-iris">
                <Menu className="h-5 w-5" />
                <span className="text-xs">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <AppSidebar />
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
}