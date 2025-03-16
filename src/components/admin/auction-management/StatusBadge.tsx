
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status?: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'ready':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 font-medium">Ready</Badge>;
    case 'active':
      return <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium border-none">Active</Badge>;
    case 'paused':
      return <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-medium border-none">Paused</Badge>;
    case 'ended':
      return <Badge variant="secondary" className="bg-gray-200 text-gray-800 font-medium">Ended</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium border-none">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Not Set</Badge>;
  }
}
