import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DealerActivityBadgeProps {
  status: 'online' | 'recent' | 'inactive';
  label: string | null;
  color: 'green' | 'yellow' | 'blue' | null;
}

export function DealerActivityBadge({ status, label, color }: DealerActivityBadgeProps) {
  if (status === 'inactive' || !label) {
    return null;
  }

  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs font-medium',
        color && colorClasses[color]
      )}
    >
      {status === 'online' && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      )}
      {label}
    </Badge>
  );
}
