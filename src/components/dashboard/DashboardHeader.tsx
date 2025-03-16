
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
    <div>
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h1>
      {formattedTime && (
        <p className="text-sm text-gray-500 mt-1">{formattedTime}</p>
      )}
    </div>
  );
}
