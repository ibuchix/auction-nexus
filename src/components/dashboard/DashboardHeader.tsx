
import { Search, PlusCircle, Settings, Bell, FileText, Gavel, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  currentTime: Date;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  pendingVerifications?: number;
  suspiciousActivities?: number;
}

export function DashboardHeader({
  currentTime,
  searchQuery,
  setSearchQuery,
  pendingVerifications = 0,
  suspiciousActivities = 0,
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleAdminClick = () => {
    toast({
      title: "Admin Features Available",
      description: "You can now access dealer verification, suspicious activity monitoring, auction management, and bid validation from the admin dashboard.",
      duration: 5000,
    });
    navigate('/admin');
  };

  const QuickActionButton = ({ icon: Icon, label, onClick, notification = 0 }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="relative h-9 w-9 p-0 hover:bg-iris-light"
          >
            <Icon className="h-5 w-5 text-iris" />
            {notification > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {notification}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="w-full rounded-xl bg-white/90 backdrop-blur-sm shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">
            Dashboard
          </h1>
          <p className="text-subtitle">{formatDate(currentTime)}</p>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtitle h-4 w-4 transition-transform group-hover:scale-110" />
            <Input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-[300px] transition-all duration-300 border-gray-200 focus:border-iris hover:border-gray-300"
            />
          </div>
          
          <div className="flex items-center space-x-2 md:border-l md:pl-4">
            <QuickActionButton
              icon={Bell}
              label="Notifications"
              onClick={() => navigate('/admin/notifications')}
              notification={pendingVerifications + suspiciousActivities}
            />
            <QuickActionButton
              icon={Gavel}
              label="Active Auctions"
              onClick={() => navigate('/admin/auctions/monitor')}
            />
            <QuickActionButton
              icon={FileText}
              label="Reports"
              onClick={() => navigate('/admin/analytics')}
            />
            <QuickActionButton
              icon={ShieldCheck}
              label="Security"
              onClick={() => navigate('/admin/fraud')}
            />
            <QuickActionButton
              icon={HelpCircle}
              label="Help & Support"
              onClick={() => toast({
                title: "Help Center",
                description: "Support resources and documentation will be available soon.",
              })}
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="default" 
              className="shadow-sm hover:shadow-md transition-all duration-300 bg-iris hover:bg-iris/90 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Auction
            </Button>
            <Button 
              variant="outline" 
              className="shadow-sm hover:shadow-md transition-all duration-300 hover:bg-iris-light"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="mr-2 h-4 w-4 text-iris" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
