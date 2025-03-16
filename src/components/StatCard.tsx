
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 h-full", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {value}
          </h3>
          {trend && (
            <p
              className={`text-xs mt-2 flex items-center ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="inline-block mr-1">
                {trend.isPositive ? "↗" : "↘"}
              </span>
              <span>
                {trend.isPositive ? "+" : "-"}
                {trend.value}% from last month
              </span>
            </p>
          )}
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl transition-all duration-300 group-hover:blur-2xl" />
          <Icon className="h-8 w-8 text-primary opacity-80 transition-transform duration-300 group-hover:scale-110 relative z-10" />
        </div>
      </div>
    </Card>
  );
}
