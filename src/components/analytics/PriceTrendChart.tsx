
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

interface PriceTrendChartProps {
  data: any[];
}

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Sale Price Trend</CardTitle>
        <CardDescription>Daily average sale price of vehicles</CardDescription>
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
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), "PP")}
                formatter={(value: any) => [`$${value.toLocaleString()}`, "Average Price"]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="average_sale_price" 
                name="Average Price"
                stroke="#6366f1" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
