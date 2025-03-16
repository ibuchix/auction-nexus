
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title?: string;
  currentTime?: Date;
  searchQuery?: string;
  setSearchQuery?: Dispatch<SetStateAction<string>>;
  pendingVerifications?: number;
  suspiciousActivities?: number;
}

export function DashboardHeader({ 
  title = "Dashboard", 
  currentTime,
  searchQuery = "",
  setSearchQuery,
  pendingVerifications = 0,
  suspiciousActivities = 0
}: DashboardHeaderProps) {
  const formattedTime = currentTime ? new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(currentTime) : '';

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h1>
      {formattedTime && (
        <p className="text-sm text-gray-500 mt-1">{formattedTime}</p>
      )}
      
      {(setSearchQuery !== undefined) && (
        <div className="mt-4 flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          {(pendingVerifications > 0 || suspiciousActivities > 0) && (
            <div className="relative">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 px-1.5 min-w-5 h-5 flex items-center justify-center"
                >
                  {pendingVerifications + suspiciousActivities}
                </Badge>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
