
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useDealerPresence } from "@/hooks/useDealerPresence";
import { TopNavbar } from "./navigation/TopNavbar";
import { BreadcrumbNav } from "./navigation/Breadcrumb";
import { MobileNav } from "./navigation/MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Track dealer presence - only activates for users with role='dealer'
  useDealerPresence();
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Keyboard shortcuts
  useHotkeys('alt+h', () => navigate('/'), { description: 'Go to Dashboard' });
  useHotkeys('alt+a', () => navigate('/admin/auctions/monitor'), { description: 'Go to Auctions' });
  useHotkeys('alt+r', () => navigate('/admin/analytics'), { description: 'Go to Reports' });
  useHotkeys('alt+/', () => {
    toast('Keyboard Shortcuts', {
      description: 'Alt + H: Home\nAlt + A: Auctions\nAlt + R: Reports',
    });
  }, { description: 'Show Keyboard Shortcuts' });

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50 overflow-x-hidden">
      {/* Single navigation component for the application */}
      <TopNavbar />
      
      <main className="flex-1 w-full pt-4">
        <div className="w-full container mx-auto px-4">
          <BreadcrumbNav />
          {children}
        </div>
      </main>
      
      {isMobile && <MobileNav />}
    </div>
  );
}
