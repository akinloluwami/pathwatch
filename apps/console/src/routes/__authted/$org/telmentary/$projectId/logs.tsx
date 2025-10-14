import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { faker } from '@faker-js/faker';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

type LogEntry = {
  id: string;
  timestamp: Date;
  level: LogLevel;
  status: number;
  method: string;
  path: string;
  duration: number;
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

function RouteComponent() {
  const { org, projectId } = Route.useParams();
  const [logs, setLogs] = useState<LogEntry[]>(() => generateLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevels, setActiveLevels] = useState<LogLevel[]>([...LEVEL_ORDER]);

  const stats = useMemo(() => computeStats(logs), [logs]);
  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      if (!activeLevels.includes(log.level)) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        log.path.toLowerCase().includes(term) ||
        log.method.toLowerCase().includes(term) ||
        String(log.status).includes(term)
      );
    });
  }, [logs, activeLevels, searchTerm]);

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
    setLogs(generateLogs());
  };

  return (
    <div className="flex-1 h-full border border-gray-800 bg-black/40 relative flex flex-col overflow-hidden">
      <Brackets />

      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60">
        <div>
          <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">Telemetry // Logs</p>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-300">
            <span className="font-medium text-white">{projectId}</span>
            <span className="text-gray-600">/</span>
            <span className="uppercase text-xs tracking-[0.3em] text-gray-500">Org {org}</span>
          </div>
        </div>

        <div className="text-right text-xs text-gray-400">
          <p>
            Latest event:{' '}
            <span className="text-white">
              {newestLog
                ? `${formatTimestamp(newestLog.timestamp, timeFormatter)}.${msPart(newestLog.timestamp)}`
                : '—'}
            </span>
          </p>
          <p className="mt-1">
            Total events: <span className="text-white">{stats.total}</span>
          </p>
        </div>
      </header>

      <section className="px-6 py-5 space-y-5 flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Stream Volume"
            value={stats.total.toLocaleString()}
            hint={`${stats.errorCount} errors · ${stats.warnCount} warnings`}
          />
          <StatCard
            label="Error Rate"
            value={`${stats.errorRate.toFixed(1)}%`}
            hint={`Debug events: ${stats.debugCount.toLocaleString()}`}
          />
          <StatCard
            label="Avg Latency"
            value={formatLatency(stats.avgLatency)}
            hint={`p95 ${formatLatency(stats.p95Latency)} · p99 ${formatLatency(stats.p99Latency)}`}
          />
          <StatCard
            label="Stream Freshness"
            value={stats.newestAt ? formatFreshness(stats.freshnessMs) : '—'}
            hint={stats.newestAt ? formatTimestamp(stats.newestAt, timeFormatter) : ''}
          />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {LEVEL_ORDER.map((level) => {
              const isActive = activeLevels.includes(level);
              return (
                <Button
                  key={level}
                  onClick={() => handleToggleLevel(level)}
                  showBrackets={isActive}
                  className={`${isActive ? 'bg-white/10 text-white' : 'bg-black/20 text-gray-400'} min-w-[96px] justify-center px-4 py-0 uppercase tracking-[0.2em] text-[11px] border-gray-700`}
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
                placeholder="Search route / status"
                className="h-full w-64 border border-gray-800 bg-black/40 pl-9 pr-3 text-xs uppercase tracking-[0.2em] text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                icon={<RefreshCcw size={14} />}
                onClick={handleRefresh}
                showBrackets={false}
                className="w-10 justify-center border-gray-700 text-gray-200 hover:bg-white/10"
              >
                <span className="sr-only">Refresh mock data</span>
              </Button>
              <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                Showing {filteredLogs.length} / {stats.total}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 border border-gray-800 bg-black/30 relative overflow-hidden">
          <Brackets />
          {filteredLogs.length ? (
            <div className="h-full overflow-auto">
              <table className="w-full min-w-[48rem] border-collapse text-left text-sm table-fixed">
                <thead className="sticky top-0 bg-black/80 text-[11px] uppercase tracking-[0.3em] text-gray-500">
                  <tr>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Time</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Level</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Status</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Route</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Duration</th>
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
                      <td className="px-4 py-3 font-mono text-xs text-[#f45817] whitespace-nowrap">
                        <span className="block max-w-[16rem] truncate">
                          {log.method} {log.path}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">
                        {formatLatency(log.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-600">
              No logs matched your filters
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function generateLogs(): LogEntry[] {
  const now = Date.now();
  const basePaths = [
    '/api/v1/logs',
    '/api/v1/projects',
    '/api/v1/errors',
    '/api/v1/metrics',
    '/api/v1/ingest',
    '/api/v1/uptime',
  ];

  const methods: Array<LogEntry['method']> = ['GET', 'POST', 'PATCH', 'DELETE'];

  return Array.from({ length: 120 }, () => {
    const timestamp = faker.date.recent({ days: 2, refDate: now });
    const statusPool = [200, 200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 504];
    const status = faker.helpers.arrayElement(statusPool);
    const method = faker.helpers.arrayElement(methods);
    const path = faker.helpers.arrayElement(basePaths);
    const level: LogLevel =
      status >= 500
        ? 'error'
        : status >= 400
          ? 'warn'
          : faker.helpers.arrayElement(['info', 'debug']);

    const duration = faker.number.int({ min: 18, max: 1800 });

    return {
      id: faker.string.uuid(),
      timestamp,
      level,
      status,
      method,
      path,
      duration,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
      freshnessMs: 0,
    };
  }

  const total = logs.length;
  const errorCount = logs.filter((log) => log.level === 'error').length;
  const warnCount = logs.filter((log) => log.level === 'warn').length;
  const infoCount = logs.filter((log) => log.level === 'info').length;
  const debugCount = logs.filter((log) => log.level === 'debug').length;

  const durations = logs.map((log) => log.duration).sort((a, b) => a - b);
  const avgLatency = durations.reduce((acc, value) => acc + value, 0) / durations.length;
  const p95Latency = percentile(durations, 0.95);
  const p99Latency = percentile(durations, 0.99);

  const newestAt = logs[0]?.timestamp;
  const freshnessMs = newestAt ? Math.max(0, Date.now() - newestAt.getTime()) : 0;
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
    freshnessMs,
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

function formatFreshness(ms: number) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 5) {
    return 'live';
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s ago`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
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
