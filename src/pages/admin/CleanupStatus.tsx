import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Clock, RefreshCw, CheckCircle2, AlertTriangle, Gauge } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface CronJob {
  jobname: string;
  schedule: string;
  active: boolean;
  last_run: string | null;
  last_status: string | null;
  last_message: string | null;
}

interface CleanupRun {
  created_at: string;
  deleted_count: string | null;
  duration_seconds: string | null;
  batches: string | null;
  cutoff_date: string | null;
  kind?: "daily" | "backlog" | null;
}

interface CleanupStatus {
  table_stats: {
    approximate_total_rows: number;
    rows_older_than_90d_sample: number;
    sample_capped_at: number;
    oldest_row_changed_at: string | null;
  };
  recent_runs: CleanupRun[];
  cron_jobs: CronJob[];
}

// Best-effort next-run for the two simple cron patterns we use
function nextRun(schedule: string): Date | null {
  const now = new Date();
  // "*/N * * * *" — every N minutes
  const everyN = schedule.match(/^\*\/(\d+) \* \* \* \*$/);
  if (everyN) {
    const n = parseInt(everyN[1], 10);
    const next = new Date(now);
    next.setSeconds(0, 0);
    const minutesToAdd = n - (next.getMinutes() % n) || n;
    next.setMinutes(next.getMinutes() + minutesToAdd);
    return next;
  }
  // "M H * * *" — daily at H:M UTC
  const daily = schedule.match(/^(\d+) (\d+) \* \* \*$/);
  if (daily) {
    const m = parseInt(daily[1], 10);
    const h = parseInt(daily[2], 10);
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, 0, 0));
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }
  return null;
}

export default function CleanupStatus() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<CleanupStatus>({
    queryKey: ["cars-history-cleanup-status"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_cars_history_cleanup_status" as any);
      if (error) throw error;
      return data as unknown as CleanupStatus;
    },
    refetchInterval: 60_000,
  });

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Failed to load cleanup status: {(error as Error).message}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDeletedLast30Days =
    data?.recent_runs.reduce((sum, r) => sum + (parseInt(r.deleted_count || "0", 10) || 0), 0) ?? 0;
  const lastRun = data?.recent_runs[0];

  // Backlog drain progress + ETA from system_logs
  const backlogRuns = data?.recent_runs.filter((r) => r.kind === "backlog") ?? [];
  const backlogDrained = backlogRuns.reduce(
    (sum, r) => sum + (parseInt(r.deleted_count || "0", 10) || 0),
    0,
  );
  const lastBacklogRun = backlogRuns[0];
  // Use the last 10 backlog runs for a fresher rate (rows/sec)
  const recentBacklog = backlogRuns.slice(0, 10);
  const recentDeleted = recentBacklog.reduce(
    (s, r) => s + (parseInt(r.deleted_count || "0", 10) || 0),
    0,
  );
  const recentDuration = recentBacklog.reduce(
    (s, r) => s + (parseFloat(r.duration_seconds || "0") || 0),
    0,
  );
  const rowsPerSec = recentDuration > 0 ? recentDeleted / recentDuration : 0;

  const sample = data?.table_stats.rows_older_than_90d_sample ?? 0;
  const sampleCap = data?.table_stats.sample_capped_at ?? 0;
  const sampleCapped = sample >= sampleCap && sampleCap > 0;
  // Best-effort remaining: if sample is capped, estimate from total rows
  // (assume the rest of the table is mostly older-than-90d backlog).
  const remainingEstimate = sampleCapped
    ? Math.max(data?.table_stats.approximate_total_rows ?? 0, sample)
    : sample;

  const totalToProcess = backlogDrained + remainingEstimate;
  const progressPct =
    totalToProcess > 0 ? Math.min(100, (backlogDrained / totalToProcess) * 100) : 0;
  const etaSeconds = rowsPerSec > 0 ? remainingEstimate / rowsPerSec : null;

  const formatEta = (secs: number) => {
    if (secs < 60) return `${Math.round(secs)}s`;
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remMin = mins % 60;
    if (hours < 24) return `${hours}h ${remMin}m`;
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-7 w-7" />
            Cars History Cleanup
          </h1>
          <p className="text-muted-foreground mt-1">
            Retention policy: rows older than 90 days are deleted nightly.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approximate rows in cars_history</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-32" /> : data!.table_stats.approximate_total_rows.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            From planner statistics — refreshed by autovacuum.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rows older than 90 days (sample)</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  {data!.table_stats.rows_older_than_90d_sample.toLocaleString()}
                  {data!.table_stats.rows_older_than_90d_sample >= data!.table_stats.sample_capped_at && (
                    <span className="text-sm text-muted-foreground font-normal">+</span>
                  )}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Sample capped at {data?.table_stats.sample_capped_at.toLocaleString() ?? "—"} for performance. A "+" means there are at least this many awaiting deletion.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total deleted (last 30 days)</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-32" /> : totalDeletedLast30Days.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {lastRun ? (
              <>Last run {formatDistanceToNow(new Date(lastRun.created_at), { addSuffix: true })}</>
            ) : (
              "No runs recorded yet."
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backlog drain progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Backlog drain progress
          </CardTitle>
          <CardDescription>
            Estimated from recent backlog drain runs in system_logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : backlogRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No backlog drain runs recorded yet. Progress will appear here once the
              <code className="mx-1 px-1 rounded bg-muted">temp-cars-history-backlog-drain</code>
              job logs its first successful run.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">
                    Drained {backlogDrained.toLocaleString()} of ~
                    {totalToProcess.toLocaleString()}
                    {sampleCapped && "+"} rows
                  </span>
                  <span className="font-mono font-medium">{progressPct.toFixed(1)}%</span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Estimated remaining</div>
                  <div className="font-mono text-base">
                    {remainingEstimate.toLocaleString()}
                    {sampleCapped && "+"}
                    <span className="text-muted-foreground"> rows</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Throughput</div>
                  <div className="font-mono text-base">
                    {rowsPerSec > 0
                      ? `${Math.round(rowsPerSec * 60).toLocaleString()} rows/min`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">ETA to clear backlog</div>
                  <div className="font-mono text-base">
                    {etaSeconds !== null ? formatEta(etaSeconds) : "—"}
                    {sampleCapped && etaSeconds !== null && (
                      <span className="text-muted-foreground"> +</span>
                    )}
                  </div>
                </div>
              </div>

              {lastBacklogRun && (
                <p className="text-xs text-muted-foreground">
                  Last backlog run {formatDistanceToNow(new Date(lastBacklogRun.created_at), { addSuffix: true })} —{" "}
                  {parseInt(lastBacklogRun.deleted_count || "0", 10).toLocaleString()} rows in{" "}
                  {parseFloat(lastBacklogRun.duration_seconds || "0").toFixed(1)}s
                  {lastBacklogRun.batches && <> across {lastBacklogRun.batches} batches</>}.
                  {sampleCapped && " ETA is a lower bound — older-than-90d sample is capped."}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled jobs
          </CardTitle>
          <CardDescription>Times shown in your local timezone. Schedules are UTC.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : data!.cron_jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cleanup cron jobs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Schedule (UTC)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last run</TableHead>
                    <TableHead>Next run</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.cron_jobs.map((j) => {
                    const next = nextRun(j.schedule);
                    return (
                      <TableRow key={j.jobname}>
                        <TableCell className="font-mono text-xs">{j.jobname}</TableCell>
                        <TableCell className="font-mono text-xs">{j.schedule}</TableCell>
                        <TableCell>
                          {j.active ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {j.last_status && (
                            <span className="ml-2 text-xs text-muted-foreground">{j.last_status}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {j.last_run ? (
                            <>
                              {format(new Date(j.last_run), "MMM d, HH:mm")}
                              <div className="text-muted-foreground">
                                {formatDistanceToNow(new Date(j.last_run), { addSuffix: true })}
                              </div>
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {next ? (
                            <>
                              {format(next, "MMM d, HH:mm")}
                              <div className="text-muted-foreground">
                                {formatDistanceToNow(next, { addSuffix: true })}
                              </div>
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent cleanup runs (last 30 days)</CardTitle>
          <CardDescription>Daily nightly runs and backlog drain runs.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : data!.recent_runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs in the last 30 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Rows deleted</TableHead>
                    <TableHead className="text-right">Batches</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead>Cutoff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.recent_runs.map((r) => (
                    <TableRow key={r.created_at}>
                      <TableCell className="text-xs">
                        {format(new Date(r.created_at), "MMM d, yyyy HH:mm")}
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.kind === "backlog" ? (
                          <Badge variant="secondary">Backlog</Badge>
                        ) : (
                          <Badge variant="default">Daily</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {parseInt(r.deleted_count || "0", 10).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">{r.batches ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {r.duration_seconds ? `${parseFloat(r.duration_seconds).toFixed(1)}s` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.cutoff_date ? format(new Date(r.cutoff_date), "MMM d, yyyy") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
