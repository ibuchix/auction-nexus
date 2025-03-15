
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status?: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'ready':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600">Ready</Badge>;
    case 'active':
      return <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>;
    case 'paused':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Paused</Badge>;
    case 'ended':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Ended</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="bg-red-100 text-red-700">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Not Set</Badge>;
  }
}
