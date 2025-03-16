
import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  notificationCount?: number;
}

export function SearchBar({ 
  searchQuery, 
  setSearchQuery,
  notificationCount = 0
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
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
      
      {notificationCount > 0 && (
        <div className="relative">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 px-1.5 min-w-5 h-5 flex items-center justify-center"
            >
              {notificationCount}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
}
