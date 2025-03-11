
import { Dispute } from "@/types/disputes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BarChart2, Check, Clock } from "lucide-react";

interface DisputeStatsProps {
  disputes: Dispute[];
}

export function DisputeStats({ disputes }: DisputeStatsProps) {
  // Calculate statistics
  const totalDisputes = disputes.length;
  const openDisputes = disputes.filter(d => d.status === 'open').length;
  const investigatingDisputes = disputes.filter(d => d.status === 'investigating').length;
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved' || d.status === 'closed').length;
  
  // Calculate resolution rate
  const resolutionRate = totalDisputes > 0 
    ? Math.round((resolvedDisputes / totalDisputes) * 100) 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDisputes}</div>
          <p className="text-xs text-muted-foreground">
            All time dispute cases
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openDisputes}</div>
          <p className="text-xs text-muted-foreground">
            Cases awaiting review
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investigating</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{investigatingDisputes}</div>
          <p className="text-xs text-muted-foreground">
            Cases in progress
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          <Check className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resolutionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {resolvedDisputes} cases resolved
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
