import { useFormTracking } from "./form-tracking/useFormTracking";
import { FormTrackingFilters } from "./form-tracking/FormTrackingFilters";
import { FormTrackingTable } from "./form-tracking/FormTrackingTable";
import { LoadingState } from "./activity-log/LoadingState";

export function FormTracking() {
  const { 
    logs, 
    isLoading, 
    filters: {
      searchTerm,
      setSearchTerm,
      dateRange,
      setDateRange
    }
  } = useFormTracking();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {logs?.length || 0} form tracking events found
        </div>
      </div>

      <FormTrackingFilters
        searchTerm={searchTerm}
        dateRange={dateRange}
        onSearchTermChange={setSearchTerm}
        onDateRangeChange={setDateRange}
      />

      <FormTrackingTable logs={logs} />
    </div>
  );
}
