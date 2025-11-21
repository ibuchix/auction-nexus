import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDealerPresenceMonitor } from '@/hooks/useDealerPresenceMonitor';
import { Users, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function OnlineDealersCard() {
  const { onlineCount, lastSixHoursCount, isLoading } = useDealerPresenceMonitor();

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online Dealers
          </div>
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-20" />
        ) : (
          <>
            <div className="text-3xl font-bold">{onlineCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently Active
            </p>
            <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Last 6 hours: <span className="font-medium text-foreground">{lastSixHoursCount}</span> {lastSixHoursCount === 1 ? 'dealer' : 'dealers'}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
