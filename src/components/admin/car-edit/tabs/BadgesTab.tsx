import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Flag } from "lucide-react";
import type { CarEditFormData } from "../types";

interface BadgesTabProps {
  formData: CarEditFormData;
  updateField: (field: keyof CarEditFormData, value: any) => void;
}

export function BadgesTab({ formData, updateField }: BadgesTabProps) {
  // Derived states
  const accidentFreeOn =
    formData.is_accident_record_poland === false &&
    formData.is_accident_record_abroad === false;

  const salonPlOn = formData.is_polish_origin === true;

  const handleAccidentFreeToggle = (checked: boolean) => {
    if (checked) {
      updateField("is_accident_record_poland", false);
      updateField("is_accident_record_abroad", false);
    } else {
      updateField("is_accident_record_poland", null);
      updateField("is_accident_record_abroad", null);
    }
  };

  const handleSalonPlToggle = (checked: boolean) => {
    updateField("is_polish_origin", checked ? true : null);
  };

  return (
    <div className="space-y-4">
      {/* Bezwypadkowy */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="badge-accident-free" className="text-base font-semibold cursor-pointer">
                  Bezwypadkowy
                </Label>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                >
                  Preview
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Display the accident-free badge. Marks the vehicle as having no accident records in Poland or abroad.
              </p>
            </div>
          </div>
          <Switch
            id="badge-accident-free"
            checked={accidentFreeOn}
            onCheckedChange={handleAccidentFreeToggle}
          />
        </CardContent>
      </Card>

      {/* Salon PL */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-sky-500/10 p-2 text-sky-600">
              <Flag className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="badge-salon-pl" className="text-base font-semibold cursor-pointer">
                  Salon PL
                </Label>
                <Badge
                  variant="outline"
                  className="border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold"
                >
                  Preview
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Display the Polish showroom badge. Marks the vehicle as originally sold through a Polish dealership.
              </p>
            </div>
          </div>
          <Switch
            id="badge-salon-pl"
            checked={salonPlOn}
            onCheckedChange={handleSalonPlToggle}
          />
        </CardContent>
      </Card>
    </div>
  );
}
