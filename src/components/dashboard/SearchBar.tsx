
import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export function SearchBar({ 
  searchQuery, 
  setSearchQuery
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 w-full h-9 rounded-full"
        />
      </div>
    </div>
  );
}
