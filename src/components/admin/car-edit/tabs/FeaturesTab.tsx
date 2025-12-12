import { Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeaturesTabProps {
  features: Record<string, any>;
  conditionQuestions: Record<string, boolean | null>;
}

const formatFeatureName = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Questions where TRUE means a positive/good condition
const positiveConditions = [
  'ac_working',
  'runs_smoothly',
  'tires_legal_depth',
  'windows_working'
];

// Questions where TRUE means a negative/issue condition
const negativeConditions = [
  'has_dents',
  'has_scratches',
  'has_rust',
  'has_interior_stains',
  'engine_faults',
  'engine_smokes',
  'gearbox_faults',
  'electrical_faults',
  'brakes_noisy',
  'suspension_noisy',
  'warning_lights_on'
];

export function FeaturesTab({ features, conditionQuestions }: FeaturesTabProps) {
  const featureEntries = Object.entries(features || {});
  const conditionEntries = Object.entries(conditionQuestions || {}).filter(
    ([_, value]) => value !== null && value !== undefined
  );

  const renderConditionItem = (key: string, value: boolean) => {
    const formattedName = formatFeatureName(key);
    const isPositiveQuestion = positiveConditions.includes(key);
    
    // For positive questions: true = good (green check), false = bad (red X)
    // For negative questions: true = bad (red check), false = good (green X)
    let isGood: boolean;
    if (isPositiveQuestion) {
      isGood = value === true;
    } else {
      isGood = value === false;
    }

    return (
      <div
        key={key}
        className="flex items-center gap-2 p-3 rounded-lg border bg-card"
      >
        {isGood ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        ) : (
          <X className="h-4 w-4 text-destructive flex-shrink-0" />
        )}
        <span className={`text-sm ${isGood ? 'text-foreground' : 'text-destructive font-medium'}`}>
          {formattedName}
          {!isPositiveQuestion && value && (
            <span className="text-xs ml-1">(Yes)</span>
          )}
          {isPositiveQuestion && !value && (
            <span className="text-xs ml-1">(No)</span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Features</CardTitle>
          <CardDescription>Equipment and features selected by the seller</CardDescription>
        </CardHeader>
        <CardContent>
          {featureEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No features recorded</p>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Vehicle Condition Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Condition</CardTitle>
          <CardDescription>Seller's answers to condition questions during listing submission</CardDescription>
        </CardHeader>
        <CardContent>
          {conditionEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No condition data recorded</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {conditionEntries.map(([key, value]) => 
                renderConditionItem(key, value as boolean)
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
