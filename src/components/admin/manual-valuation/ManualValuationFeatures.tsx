import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualValuationData } from "@/hooks/useManualValuation";
import { Check, X } from "lucide-react";

interface ManualValuationFeaturesProps {
  valuation: ManualValuationData;
}

export function ManualValuationFeatures({ valuation }: ManualValuationFeaturesProps) {
  
  const formatFeatureName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const features = valuation.features || {};
  const featureEntries = Object.entries(features);

  if (featureEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No features recorded for this vehicle
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vehicle Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {featureEntries.map(([key, value]) => {
            const isBoolean = typeof value === 'boolean' || value === 'true' || value === 'false';
            const boolValue = value === true || value === 'true';
            
            return (
              <div key={key} className="flex items-center space-x-2">
                {isBoolean ? (
                  <>
                    {boolValue ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={boolValue ? "font-medium" : "text-muted-foreground"}>
                      {formatFeatureName(key)}
                    </span>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary">{formatFeatureName(key)}</Badge>
                    <span className="text-sm">{value as string}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
