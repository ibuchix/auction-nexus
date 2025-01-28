import { Search, PlusCircle, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
          Dashboard
        </h1>
        <p className="text-gray-500">{formatDate(currentTime)}</p>
      </div>
      
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform group-hover:scale-110" />
          <Input
            type="text"
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-[300px] transition-all duration-300 border-gray-200 focus:border-primary hover:border-gray-300"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            className="shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            New Auction
          </Button>
          <Button 
            variant="outline" 
            className="shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50 relative"
            onClick={handleAdminClick}
          >
            <ShieldCheck className="mr-2 h-4 w-4 transition-transform hover:rotate-12" />
            Admin
            {(pendingVerifications || suspiciousActivities) ? (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {(pendingVerifications || 0) + (suspiciousActivities || 0)}
              </span>
            ) : null}
          </Button>
          <Button 
            variant="outline" 
            className="shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50"
          >
            <Settings className="mr-2 h-4 w-4 transition-transform hover:rotate-90" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}