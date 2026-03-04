import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format: "number" | "percent" | "decimal";
  description: string;
}

export function MetricCard({ title, value, previousValue, format, description }: MetricCardProps) {
  const formatted = formatValue(value, format);
  const delta = previousValue != null ? value - previousValue : null;

  return (
    <Card>
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold tabular-nums">{formatted}</span>
          {delta !== null && (
            <DeltaBadge delta={delta} format={format} />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function formatValue(value: number, format: "number" | "percent" | "decimal") {
  if (format === "percent") return `${value}%`;
  if (format === "decimal") return value.toFixed(2);
  return value.toLocaleString();
}

function DeltaBadge({ delta, format }: { delta: number; format: string }) {
  if (Math.abs(delta) < 0.01) {
    return (
      <span className="flex items-center text-xs text-muted-foreground">
        <Minus className="h-3 w-3 mr-0.5" />
        —
      </span>
    );
  }

  const isPositive = delta > 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;
  const color = isPositive ? "text-emerald-600" : "text-destructive";
  const label = format === "percent" ? `${Math.abs(delta).toFixed(1)}pp` : 
                format === "decimal" ? Math.abs(delta).toFixed(2) :
                Math.abs(delta).toLocaleString();

  return (
    <span className={`flex items-center text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3 mr-0.5" />
      {label}
    </span>
  );
}
