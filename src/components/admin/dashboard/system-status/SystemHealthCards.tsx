
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemHealth } from "./types";
import { CheckCircle2, AlertCircle, CircleAlert } from "lucide-react";

interface SystemHealthCardsProps {
  systemHealth: SystemHealth[];
}

export function SystemHealthCards({ systemHealth }: SystemHealthCardsProps) {
  return (
    <>
      <h3 className="text-lg font-medium mt-6">System Health Components</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {systemHealth
          .filter(h => !['auction_system', 'database_performance'].includes(h.component_name))
          .map(component => (
            <Card key={component.component_name} className={`border-l-4 ${
              component.status === 'healthy' ? 'border-l-green-500' : 
              component.status === 'failing' ? 'border-l-red-500' :
              component.status === 'degraded' ? 'border-l-amber-500' : 'border-l-gray-300'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {component.status === 'healthy' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {component.status === 'failing' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {component.status === 'degraded' && <CircleAlert className="h-5 w-5 text-amber-500" />}
                  {component.status === 'unknown' && <CircleAlert className="h-5 w-5 text-gray-400" />}
                  {component.component_name.charAt(0).toUpperCase() + component.component_name.slice(1).replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(component.last_check_time).toLocaleString()}
                </p>
                {component.details?.message && (
                  <p className={`text-sm mt-1 ${
                    component.status === 'healthy' ? 'text-green-600' : 
                    component.status === 'failing' ? 'text-red-500' : 
                    'text-amber-500'
                  }`}>
                    {component.details.message}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        }
      </div>
    </>
  );
}
