
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

interface SalesVolumeChartProps {
  data: any[];
}

export function SalesVolumeChart({ data }: SalesVolumeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sales Volume</CardTitle>
        <CardDescription>Number of vehicles sold per day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), "MMM dd")}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), "PP")}
                formatter={(value: any) => [value, "Vehicles"]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sold_vehicles" 
                name="Sold"
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="unsold_vehicles" 
                name="Unsold"
                stroke="#ef4444" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
