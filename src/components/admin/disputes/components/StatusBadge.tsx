
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'open':
      return <Badge className="bg-gradient-to-r from-orange-400 to-amber-500 text-white border-none shadow-sm">Open</Badge>;
    case 'investigating':
      return <Badge className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-none shadow-sm">Investigating</Badge>;
    case 'resolved':
      return <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-none shadow-sm">Resolved</Badge>;
    case 'closed':
      return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-none shadow-sm">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
