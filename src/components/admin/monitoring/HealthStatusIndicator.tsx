
import { CheckCircle2, AlertCircle, CircleAlert, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type HealthStatus = 'healthy' | 'degraded' | 'failing' | 'unknown';

interface HealthStatusIndicatorProps {
  status: HealthStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function HealthStatusIndicator({
  status,
  showLabel = true,
  size = 'md'
}: HealthStatusIndicatorProps) {
  const getIcon = () => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className={`${iconSize} text-green-500`} />;
      case 'degraded':
        return <AlertTriangle className={`${iconSize} text-amber-500`} />;
      case 'failing':
        return <AlertCircle className={`${iconSize} text-red-500`} />;
      default:
        return <CircleAlert className={`${iconSize} text-gray-400`} />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'degraded':
        return 'Degraded';
      case 'failing':
        return 'Failing';
      default:
        return 'Unknown';
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'healthy':
        return 'outline';
      case 'degraded':
        return 'secondary';
      case 'failing':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (showLabel) {
    return (
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getIcon()}
        <span>{getLabel()}</span>
      </Badge>
    );
  }

  return getIcon();
}
