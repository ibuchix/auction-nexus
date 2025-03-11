
import { SidebarInput } from "@/components/ui/sidebar";

interface SidebarSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SidebarSearch({ searchQuery, setSearchQuery }: SidebarSearchProps) {
  return (
    <div className="px-2 mb-4">
      <SidebarInput
        type="search"
        placeholder="Search menu..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
