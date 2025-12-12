import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualValuationData } from "@/hooks/useManualValuation";
import { Check, X } from "lucide-react";

interface ManualValuationFeaturesProps {
  valuation: ManualValuationData;
}

// Condition questions configuration
const POSITIVE_CONDITIONS = [
  'ac_working',
  'windows_working', 
  'tires_legal_depth',
  'runs_smoothly'
] as const;

const NEGATIVE_CONDITIONS = [
  'has_scratches',
  'has_dents',
  'has_rust',
  'has_interior_stains',
  'engine_faults',
  'gearbox_faults',
  'electrical_faults',
  'engine_smokes',
  'brakes_noisy',
  'suspension_noisy',
  'warning_lights_on'
] as const;

const formatConditionName = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export function ManualValuationFeatures({ valuation }: ManualValuationFeaturesProps) {
  
  const formatFeatureName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const features = valuation.features || {};
  const featureEntries = Object.entries(features);

  // Extract condition questions from valuation
  const conditionQuestions: Record<string, boolean | null> = {
    ac_working: valuation.ac_working,
    windows_working: valuation.windows_working,
    tires_legal_depth: valuation.tires_legal_depth,
    runs_smoothly: valuation.runs_smoothly,
    has_scratches: valuation.has_scratches,
    has_dents: valuation.has_dents,
    has_rust: valuation.has_rust,
    has_interior_stains: valuation.has_interior_stains,
    engine_faults: valuation.engine_faults,
    gearbox_faults: valuation.gearbox_faults,
    electrical_faults: valuation.electrical_faults,
    engine_smokes: valuation.engine_smokes,
    brakes_noisy: valuation.brakes_noisy,
    suspension_noisy: valuation.suspension_noisy,
    warning_lights_on: valuation.warning_lights_on,
  };

  // Check if there are any condition questions with values
  const hasConditionData = Object.values(conditionQuestions).some(v => v !== null && v !== undefined);

  const renderConditionItem = (key: string, value: boolean | null) => {
    if (value === null || value === undefined) return null;
    
    const isPositiveCondition = POSITIVE_CONDITIONS.includes(key as any);
    
    // For positive conditions: true = good (green check), false = bad (red X)
    // For negative conditions: true = bad (red check), false = good (green X)
    let isGood: boolean;
    if (isPositiveCondition) {
      isGood = value === true;
    } else {
      isGood = value === false;
    }
    
    return (
      <div key={key} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
        {isGood ? (
          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
        ) : (
          <X className="h-4 w-4 text-destructive flex-shrink-0" />
        )}
        <span className={isGood ? "text-foreground" : "text-muted-foreground"}>
          {formatConditionName(key)}
        </span>
        <span className={`text-xs ml-auto ${isGood ? "text-green-600" : "text-destructive"}`}>
          {value ? "Yes" : "No"}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Vehicle Features Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicle Features</CardTitle>
        </CardHeader>
        <CardContent>
          {featureEntries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No features recorded for this vehicle
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Vehicle Condition Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicle Condition</CardTitle>
          <p className="text-sm text-muted-foreground">
            Seller's answers to condition questions
          </p>
        </CardHeader>
        <CardContent>
          {!hasConditionData ? (
            <p className="text-muted-foreground text-center py-4">
              No condition data recorded for this vehicle
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Positive conditions first */}
              {POSITIVE_CONDITIONS.map(key => renderConditionItem(key, conditionQuestions[key]))}
              {/* Then negative conditions */}
              {NEGATIVE_CONDITIONS.map(key => renderConditionItem(key, conditionQuestions[key]))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
