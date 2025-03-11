
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'open':
      return <Badge className="bg-orange-100 text-orange-800">Open</Badge>;
    case 'investigating':
      return <Badge className="bg-blue-100 text-blue-800">Investigating</Badge>;
    case 'resolved':
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
    case 'closed':
      return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
