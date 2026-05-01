import { Badge } from "@/components/ui/badge";

interface ListingBadgesProps {
  /** Accepts both snake_case and camelCase from various sources */
  car: any;
  className?: string;
}

/**
 * Renders the optional admin-controlled badges on a listing.
 * - "Bezwypadkowy" → both accident records explicitly false
 * - "Salon PL"     → polish origin explicitly true
 */
export function ListingBadges({ car, className }: ListingBadgesProps) {
  if (!car) return null;

  const accidentPoland = car.is_accident_record_poland ?? car.isAccidentRecordPoland;
  const accidentAbroad = car.is_accident_record_abroad ?? car.isAccidentRecordAbroad;
  const polishOrigin = car.is_polish_origin ?? car.isPolishOrigin;

  const showAccidentFree = accidentPoland === false && accidentAbroad === false;
  const showSalonPl = polishOrigin === true;

  if (!showAccidentFree && !showSalonPl) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {showAccidentFree && (
        <Badge
          variant="outline"
          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
        >
          Bezwypadkowy
        </Badge>
      )}
      {showSalonPl && (
        <Badge
          variant="outline"
          className="border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold"
        >
          Salon PL
        </Badge>
      )}
    </div>
  );
}
