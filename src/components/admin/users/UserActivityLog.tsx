
import { useActivityLogs } from "./activity-log/useActivityLogs";
import { LogFilters } from "./activity-log/LogFilters";
import { LogTable } from "./activity-log/LogTable";
import { LoadingState } from "./activity-log/LoadingState";

export function UserActivityLog() {
  const { 
    logs, 
    isLoading, 
    filters: {
      actionFilter,
      setActionFilter,
      searchTerm,
      setSearchTerm,
      dateRange,
      setDateRange
    }
  } = useActivityLogs();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <LogFilters
        actionFilter={actionFilter}
        searchTerm={searchTerm}
        dateRange={dateRange}
        onActionFilterChange={setActionFilter}
        onSearchTermChange={setSearchTerm}
        onDateRangeChange={setDateRange}
      />

      <LogTable logs={logs} />
    </div>
  );
}
