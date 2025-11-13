import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { TelemetryLayout } from '@/components/layouts/telemetry-layout';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCcw, Search, ChevronDown } from 'lucide-react';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { query } from '@/lib/query-client';
import { useProjectsStore } from '@/stores/projects-store';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

type TimeInterval = '15m' | '1h' | '6h' | '24h' | '7d' | 'all';

const INTERVAL_LABELS: Record<TimeInterval, string> = {
  '15m': 'Last 15 min',
  '1h': 'Last 1 hour',
  '6h': 'Last 6 hours',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  all: 'All time',
};

const INTERVAL_MS: Record<TimeInterval, number | null> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  all: null,
};

type LogEntry = {
  id: string;
  timestamp: Date;
  level: LogLevel;
  status: number;
  method: string;
  path: string;
  host: string;
  url: string;
  latencyMs: number;
  requestSize: number;
  responseSize: number;
  ip: string;
  userAgent: string;
  body?: string;
};

const LEVEL_STYLES: Record<LogLevel, string> = {
  error: 'border-red-500/50 bg-red-500/10 text-red-300',
  warn: 'border-amber-500/50 bg-amber-500/10 text-amber-200',
  info: 'border-sky-500/50 bg-sky-500/10 text-sky-200',
  debug: 'border-gray-500/50 bg-gray-500/10 text-gray-300',
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  error: 'Error',
  warn: 'Warn',
  info: 'Info',
  debug: 'Debug',
};

const LEVEL_ORDER: LogLevel[] = ['error', 'warn', 'info', 'debug'];

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/logs')({
  component: RouteComponent,
});

function getLogLevel(status: number): LogLevel {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
}

function RouteComponent() {
  const { org, projectId } = Route.useParams();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevels, setActiveLevels] = useState<LogLevel[]>([...LEVEL_ORDER]);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('24h');
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);
  const { getProjectBySlug } = useProjectsStore();
  const [statsData, setStatsData] = useState({
    totalRequests: 0,
    errorRate: 0,
    errorCount: 0,
    warnCount: 0,
    avgLatency: 0,
    p95Latency: 0,
    p99Latency: 0,
    avgRequestSize: 0,
    avgResponseSize: 0,
    totalTransferBytes: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getDateRangeFromInterval = (interval: TimeInterval) => {
    const intervalMs = INTERVAL_MS[interval];
    if (intervalMs === null) {
      return { start_date: undefined, end_date: undefined };
    }
    const end_date = new Date().toISOString();
    const start_date = new Date(Date.now() - intervalMs).toISOString();
    return { start_date, end_date };
  };

  const fetchLogs = useCallback(
    async (append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setHasMore(true);
      }

      try {
        const { start_date, end_date } = getDateRangeFromInterval(timeInterval);

        const offset = append ? logs.length : 0;

        const result = await query.requests.list({
          limit: 200,
          offset,
          start_date,
          end_date,
        });

        if (result.error || !result.data) {
          console.error('Failed to fetch logs:', result.error);
          if (!append) {
            setLogs([]);
          }
          setHasMore(false);
        } else {
          const transformedLogs = result.data.map((item: any) => ({
            id: item.id || item.request_id,
            timestamp: new Date(item.timestamp),
            level: getLogLevel(item.status_code || item.status),
            status: item.status_code || item.status,
            method: item.method,
            path: item.path,
            host: item.host || new URL(item.url || 'http://unknown').hostname,
            url: item.url,
            latencyMs: item.latency_ms || item.latency || 0,
            requestSize: item.request_size || item.req_size || 0,
            responseSize: item.response_size || item.res_size || 0,
            ip: item.ip_address || item.ip || 'unknown',
            userAgent: item.user_agent || item.userAgent || 'unknown',
            body: item.request_body || item.body,
          }));

          if (append) {
            setLogs((prev) => [...prev, ...transformedLogs]);
          } else {
            setLogs(transformedLogs);
          }

          // If we got less than 200 results, we've reached the end
          setHasMore(transformedLogs.length === 200);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
        if (!append) {
          setLogs([]);
        }
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [projectId, timeInterval, logs.length]
  );

  useEffect(() => {
    fetchLogs();
  }, [projectId, org, timeInterval]);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const { start_date, end_date } = getDateRangeFromInterval(timeInterval);

      const [totalRequestsResult, errorRateResult, avgLatencyResult] = await Promise.all([
        query.analytics.totalRequests({ start_date, end_date }),
        query.analytics.errorRate({ start_date, end_date }),
        query.analytics.avgLatency({ start_date, end_date }),
      ]);

      const newStatsData = {
        totalRequests: 0,
        errorRate: 0,
        errorCount: 0,
        warnCount: 0,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        avgRequestSize: 0,
        avgResponseSize: 0,
        totalTransferBytes: 0,
      };

      if (totalRequestsResult.data && totalRequestsResult.data.length > 0) {
        newStatsData.totalRequests = totalRequestsResult.data[0].total_requests || 0;
      }

      if (errorRateResult.data && errorRateResult.data.length > 0) {
        const errorData = errorRateResult.data[0];
        newStatsData.errorRate = errorData.error_rate_percent || 0;
        newStatsData.errorCount = errorData.error_count || 0;
        newStatsData.warnCount = 0;
      }

      if (avgLatencyResult.data && avgLatencyResult.data.length > 0) {
        const latencyData = avgLatencyResult.data[0];
        newStatsData.avgLatency = latencyData.avg_latency_ms || 0;
        newStatsData.p95Latency = latencyData.p95_latency_ms || 0;
        newStatsData.p99Latency = latencyData.p99_latency_ms || 0;
      }

      setStatsData(newStatsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  }, [projectId, timeInterval]);

  useEffect(() => {
    fetchStats();
  }, [projectId, org, timeInterval]);

  const timeFilteredLogs = useMemo(() => {
    const intervalMs = INTERVAL_MS[timeInterval];
    if (intervalMs === null) {
      return logs;
    }
    const cutoffTime = Date.now() - intervalMs;
    return logs.filter((log) => log.timestamp.getTime() >= cutoffTime);
  }, [logs, timeInterval]);

  const localStats = useMemo(() => {
    const errorCount = timeFilteredLogs.filter((log) => log.level === 'error').length;
    const warnCount = timeFilteredLogs.filter((log) => log.level === 'warn').length;
    const infoCount = timeFilteredLogs.filter((log) => log.level === 'info').length;
    const debugCount = timeFilteredLogs.filter((log) => log.level === 'debug').length;

    const totalRequestSize = timeFilteredLogs.reduce((acc, log) => acc + log.requestSize, 0);
    const totalResponseSize = timeFilteredLogs.reduce((acc, log) => acc + log.responseSize, 0);
    const avgRequestSize = timeFilteredLogs.length ? totalRequestSize / timeFilteredLogs.length : 0;
    const avgResponseSize = timeFilteredLogs.length
      ? totalResponseSize / timeFilteredLogs.length
      : 0;
    const totalTransferBytes = totalRequestSize + totalResponseSize;

    return {
      errorCount,
      warnCount,
      infoCount,
      debugCount,
      avgRequestSize,
      avgResponseSize,
      totalTransferBytes,
    };
  }, [timeFilteredLogs]);

  const stats = useMemo(() => {
    // If no logs are loaded for this time period, show all zeros
    if (logs.length === 0 && !isLoading) {
      return {
        total: 0,
        errorRate: 0,
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        debugCount: 0,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        avgRequestSize: 0,
        avgResponseSize: 0,
        totalTransferBytes: 0,
      };
    }

    return {
      total: statsData.totalRequests,
      errorRate: statsData.errorRate,
      errorCount: localStats.errorCount,
      warnCount: localStats.warnCount,
      infoCount: localStats.infoCount,
      debugCount: localStats.debugCount,
      avgLatency: statsData.avgLatency,
      p95Latency: statsData.p95Latency,
      p99Latency: statsData.p99Latency,
      avgRequestSize: localStats.avgRequestSize,
      avgResponseSize: localStats.avgResponseSize,
      totalTransferBytes: localStats.totalTransferBytes,
    };
  }, [statsData, localStats, logs.length, isLoading]);
  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return timeFilteredLogs.filter((log) => {
      if (!activeLevels.includes(log.level)) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        log.path.toLowerCase().includes(term) ||
        log.method.toLowerCase().includes(term) ||
        log.ip.toLowerCase().includes(term) ||
        log.userAgent.toLowerCase().includes(term) ||
        (log.body ? log.body.toLowerCase().includes(term) : false) ||
        String(log.status).includes(term)
      );
    });
  }, [timeFilteredLogs, activeLevels, searchTerm]);

  const newestLog = logs[0];
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    []
  );

  const handleToggleLevel = (level: LogLevel) => {
    setActiveLevels((prev) => {
      if (prev.includes(level)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((item) => item !== level);
      }
      return [...prev, level];
    });
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // Load more when scrolled to within 200px of bottom
    if (scrollHeight - scrollTop - clientHeight < 200) {
      fetchLogs(true);
    }
  }, [isLoadingMore, hasMore]);

  return (
    <TelemetryLayout
      org={org}
      projectId={projectId}
      section="Logs"
      headerAction={
        <div className="relative">
          <button
            onClick={() => setIsIntervalOpen(!isIntervalOpen)}
            className="relative h-9 w-[180px] border border-gray-700 bg-black/40 px-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5 transition-colors"
          >
            <Brackets />
            <span>{INTERVAL_LABELS[timeInterval]}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${isIntervalOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isIntervalOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsIntervalOpen(false)} />
              <div className="absolute top-full right-0 mt-1 w-[180px] border border-gray-700 bg-black/95 backdrop-blur-sm z-20">
                <Brackets />
                {(Object.keys(INTERVAL_LABELS) as TimeInterval[]).map((interval) => (
                  <button
                    key={interval}
                    onClick={() => {
                      setTimeInterval(interval);
                      setIsIntervalOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs uppercase tracking-[0.2em] transition-colors ${
                      timeInterval === interval
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                    }`}
                  >
                    {INTERVAL_LABELS[interval]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      }
    >
      <div className="px-6 py-5 flex-1 min-h-0 flex flex-col gap-5 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-shrink-0">
          <StatCard
            label="Ingested Events"
            value={stats.total.toLocaleString()}
            hint={`${stats.errorCount} errors · ${stats.warnCount} warnings`}
          />
          <StatCard
            label="Error Rate"
            value={`${stats.errorRate.toFixed(1)}%`}
            hint={`Info ${stats.infoCount.toLocaleString()} · Debug ${stats.debugCount.toLocaleString()}`}
          />
          <StatCard
            label="Avg Latency"
            value={formatLatency(stats.avgLatency)}
            hint={`p95 ${formatLatency(stats.p95Latency)} · p99 ${formatLatency(stats.p99Latency)}`}
          />
          <StatCard
            label="Transfer Volume"
            value={formatBytes(stats.totalTransferBytes)}
            hint={`Req avg ${formatBytes(stats.avgRequestSize)} · Res avg ${formatBytes(stats.avgResponseSize)}`}
          />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {LEVEL_ORDER.map((level) => {
              const isActive = activeLevels.includes(level);
              return (
                <Button
                  key={level}
                  onClick={() => handleToggleLevel(level)}
                  showBrackets={isActive}
                  className={`${isActive ? 'bg-white/10 text-white' : 'bg-black/20 text-gray-400'} w-[80px] justify-center px-3 py-0 uppercase tracking-[0.2em] text-[11px] border-gray-700 transition-colors`}
                >
                  {LEVEL_LABELS[level]}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative h-10">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <input
                spellCheck={false}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search route / ip"
                className="h-full w-64 border border-gray-800 bg-black/40 pl-9 pr-3 text-xs uppercase tracking-[0.2em] text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                icon={<RefreshCcw size={14} />}
                onClick={handleRefresh}
                showBrackets={false}
                iconOnly
                ariaLabel="Refresh logs"
                className="w-10 border-gray-700 text-gray-200"
              >
                Refresh logs
              </Button>
              <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                Showing {logs.length.toLocaleString()} of {stats.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 border border-gray-800 bg-black/30 relative flex flex-col">
          <Brackets />
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-500">
              Loading logs...
            </div>
          ) : filteredLogs.length ? (
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-auto"
            >
              <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-black/80 text-[11px] uppercase tracking-[0.3em] text-gray-500">
                  <tr>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Time</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Level</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Status</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Route</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal text-right">
                      Latency
                    </th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal text-right">
                      Request
                    </th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal text-right">
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-900/40 odd:bg-white/5 even:bg-black/0 hover:bg-white/10 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">
                        {formatTimestamp(log.timestamp, timeFormatter)}.{msPart(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-sm border px-2 py-[3px] text-[11px] uppercase tracking-[0.25em] ${LEVEL_STYLES[log.level]}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {LEVEL_LABELS[log.level]}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 font-mono text-xs ${statusColor(log.status)} whitespace-nowrap`}
                      >
                        {log.status}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-200">
                        <div className="leading-relaxed break-words">
                          {log.method} {log.path}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap text-right">
                        {formatLatency(log.latencyMs)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap text-right">
                        {formatBytes(log.requestSize)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap text-right">
                        {formatBytes(log.responseSize)}
                      </td>
                    </tr>
                  ))}
                  {isLoadingMore && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-4 text-center text-xs uppercase tracking-[0.3em] text-gray-500"
                      >
                        Loading more logs...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-600">
              No logs matched your filters
            </div>
          )}
        </div>
      </div>
    </TelemetryLayout>
  );
}

function computeStats(logs: LogEntry[]) {
  if (!logs.length) {
    return {
      total: 0,
      errorRate: 0,
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      debugCount: 0,
      avgLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      newestAt: undefined as Date | undefined,
      avgRequestSize: 0,
      avgResponseSize: 0,
      totalTransferBytes: 0,
    };
  }

  const total = logs.length;
  const errorCount = logs.filter((log) => log.level === 'error').length;
  const warnCount = logs.filter((log) => log.level === 'warn').length;
  const infoCount = logs.filter((log) => log.level === 'info').length;
  const debugCount = logs.filter((log) => log.level === 'debug').length;

  const latencies = logs.map((log) => log.latencyMs).sort((a, b) => a - b);
  const avgLatency = latencies.length
    ? latencies.reduce((acc, value) => acc + value, 0) / latencies.length
    : 0;
  const p95Latency = percentile(latencies, 0.95);
  const p99Latency = percentile(latencies, 0.99);

  const totalRequestSize = logs.reduce((acc, log) => acc + log.requestSize, 0);
  const totalResponseSize = logs.reduce((acc, log) => acc + log.responseSize, 0);
  const avgRequestSize = total ? totalRequestSize / total : 0;
  const avgResponseSize = total ? totalResponseSize / total : 0;
  const totalTransferBytes = totalRequestSize + totalResponseSize;

  const newestAt = logs[0]?.timestamp;
  const errorRate = total ? (errorCount / total) * 100 : 0;

  return {
    total,
    errorRate,
    errorCount,
    warnCount,
    infoCount,
    debugCount,
    avgLatency,
    p95Latency,
    p99Latency,
    newestAt,
    avgRequestSize,
    avgResponseSize,
    totalTransferBytes,
  };
}

function percentile(values: number[], ratio: number) {
  if (!values.length) {
    return 0;
  }

  const index = Math.min(values.length - 1, Math.floor(ratio * (values.length - 1)));
  return values[index];
}

function formatLatency(value: number) {
  if (!value) {
    return '0ms';
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}s`;
  }
  return `${Math.round(value)}ms`;
}

function formatBytes(value: number) {
  if (!value) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let size = value;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  const display = index === 0 || size >= 10 ? size.toFixed(0) : size.toFixed(1);
  return `${display} ${units[index]}`;
}

function msPart(date: Date) {
  return String(date.getMilliseconds()).padStart(3, '0');
}

function formatTimestamp(date: Date, formatter: Intl.DateTimeFormat) {
  return formatter.format(date);
}

function statusColor(status: number) {
  if (status >= 500) {
    return 'text-red-300';
  }
  if (status >= 400) {
    return 'text-amber-300';
  }
  if (status >= 300) {
    return 'text-sky-300';
  }
  return 'text-emerald-300';
}

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="relative border border-gray-800 bg-black/30 px-4 py-3">
      <Brackets />
      <p className="uppercase text-[10px] tracking-[0.35em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-gray-500">{hint}</p> : null}
    </div>
  );
}
