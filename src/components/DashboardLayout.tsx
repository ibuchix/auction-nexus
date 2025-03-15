
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BreadcrumbNav } from "./navigation/Breadcrumb";
import { MobileNav } from "./navigation/MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  // Keyboard shortcuts
  useHotkeys('alt+h', () => navigate('/'), { description: 'Go to Dashboard' });
  useHotkeys('alt+a', () => navigate('/admin/auctions/monitor'), { description: 'Go to Auctions' });
  useHotkeys('alt+d', () => navigate('/admin/disputes'), { description: 'Go to Disputes' });
  useHotkeys('alt+r', () => navigate('/admin/analytics'), { description: 'Go to Reports' });
  useHotkeys('alt+/', () => {
    toast('Keyboard Shortcuts', {
      description: 'Alt + H: Home\nAlt + A: Auctions\nAlt + D: Disputes\nAlt + R: Reports',
    });
  }, { description: 'Show Keyboard Shortcuts' });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 overflow-auto pb-20 md:pb-8">
          <div className="w-full">
            <BreadcrumbNav />
            {children}
          </div>
        </main>
        {isMobile && <MobileNav />}
      </div>
    </SidebarProvider>
  );
}
