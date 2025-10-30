import { Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeaturesTabProps {
  features: Record<string, any>;
}

const formatFeatureName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export function FeaturesTab({ features }: FeaturesTabProps) {
  const featureEntries = Object.entries(features || {});

  if (featureEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Features</CardTitle>
          <CardDescription>Features selected by the seller</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No features recorded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Features</CardTitle>
        <CardDescription>Features selected by the seller during listing submission</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featureEntries.map(([key, value]) => {
            const formattedName = formatFeatureName(key);
            
            if (typeof value === 'boolean') {
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                >
                  {value ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-sm ${value ? 'font-medium' : 'text-muted-foreground'}`}>
                    {formattedName}
                  </span>
                </div>
              );
            }
            
            return (
              <div
                key={key}
                className="flex items-center gap-2 p-3 rounded-lg border bg-card"
              >
                <Badge variant="secondary" className="text-xs">
                  {formattedName}: {String(value)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
