import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { TelemetryLayout } from '@/components/layouts/telemetry-layout';
import { TraceDetailsPanel } from '@/components/traces/trace-details-panel';
import { TraceComparison } from '@/components/traces/trace-comparison';
import { TraceMetricsDashboard } from '@/components/traces/trace-metrics-dashboard';
import { createFileRoute } from '@tanstack/react-router';
import {
  RefreshCcw,
  Search,
  ChevronDown,
  ChevronRight,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  GitCompare,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

type TraceStatus = 'success' | 'error' | 'pending';
type TimeInterval = '15m' | '1h' | '6h' | '24h' | '7d' | 'all';

const INTERVAL_LABELS: Record<TimeInterval, string> = {
  '15m': 'Last 15 min',
  '1h': 'Last 1 hour',
  '6h': 'Last 6 hours',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  all: 'All time',
};

type SpanType = 'http' | 'db' | 'cache' | 'external' | 'internal';

type Span = {
  id: string;
  name: string;
  type: SpanType;
  startTime: number;
  duration: number;
  status: TraceStatus;
  attributes?: Record<string, any>;
  children?: Span[];
};

type Trace = {
  id: string;
  name: string;
  timestamp: Date;
  duration: number;
  status: TraceStatus;
  spans: Span[];
  serviceName: string;
  endpoint: string;
  method: string;
};

const STATUS_STYLES: Record<TraceStatus, { bg: string; text: string; icon: any }> = {
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2 },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: Clock },
};

const SPAN_TYPE_COLORS: Record<SpanType, string> = {
  http: '#f45817',
  db: '#3b82f6',
  cache: '#10b981',
  external: '#8b5cf6',
  internal: '#6b7280',
};

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/traces')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org, projectId } = Route.useParams();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('24h');
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TraceStatus | 'all'>('all');
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useEffect(() => {
    const mockTraces: Trace[] = [
      {
        id: 'trace-1',
        name: 'GET /api/users',
        timestamp: new Date(Date.now() - 300000),
        duration: 245,
        status: 'success',
        serviceName: 'api-service',
        endpoint: '/api/users',
        method: 'GET',
        spans: [
          {
            id: 'span-1',
            name: 'HTTP GET /api/users',
            type: 'http',
            startTime: 0,
            duration: 245,
            status: 'success',
            children: [
              {
                id: 'span-2',
                name: 'DB Query: SELECT users',
                type: 'db',
                startTime: 5,
                duration: 120,
                status: 'success',
                attributes: { query: 'SELECT * FROM users WHERE active = true' },
              },
              {
                id: 'span-3',
                name: 'Cache Check',
                type: 'cache',
                startTime: 130,
                duration: 15,
                status: 'success',
              },
              {
                id: 'span-4',
                name: 'External API: Enrich Data',
                type: 'external',
                startTime: 150,
                duration: 85,
                status: 'success',
              },
            ],
          },
        ],
      },
      {
        id: 'trace-2',
        name: 'POST /api/orders',
        timestamp: new Date(Date.now() - 600000),
        duration: 1230,
        status: 'error',
        serviceName: 'order-service',
        endpoint: '/api/orders',
        method: 'POST',
        spans: [
          {
            id: 'span-5',
            name: 'HTTP POST /api/orders',
            type: 'http',
            startTime: 0,
            duration: 1230,
            status: 'error',
            children: [
              {
                id: 'span-6',
                name: 'Validate Order',
                type: 'internal',
                startTime: 5,
                duration: 45,
                status: 'success',
              },
              {
                id: 'span-7',
                name: 'DB Transaction',
                type: 'db',
                startTime: 55,
                duration: 890,
                status: 'error',
                attributes: { error: 'Deadlock detected' },
              },
              {
                id: 'span-8',
                name: 'Rollback',
                type: 'internal',
                startTime: 950,
                duration: 280,
                status: 'success',
              },
            ],
          },
        ],
      },
      {
        id: 'trace-3',
        name: 'GET /api/products/search',
        timestamp: new Date(Date.now() - 900000),
        duration: 456,
        status: 'success',
        serviceName: 'search-service',
        endpoint: '/api/products/search',
        method: 'GET',
        spans: [
          {
            id: 'span-9',
            name: 'HTTP GET /api/products/search',
            type: 'http',
            startTime: 0,
            duration: 456,
            status: 'success',
            children: [
              {
                id: 'span-10',
                name: 'Cache Lookup',
                type: 'cache',
                startTime: 5,
                duration: 12,
                status: 'success',
              },
              {
                id: 'span-11',
                name: 'Search Index Query',
                type: 'db',
                startTime: 20,
                duration: 380,
                status: 'success',
              },
              {
                id: 'span-12',
                name: 'Format Results',
                type: 'internal',
                startTime: 405,
                duration: 45,
                status: 'success',
              },
            ],
          },
        ],
      },
    ];

    setTimeout(() => {
      setTraces(mockTraces);
      setIsLoading(false);
    }, 500);
  }, [timeInterval]);

  const filteredTraces = useMemo(() => {
    return traces.filter((trace) => {
      const matchesSearch =
        trace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trace.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trace.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || trace.status === statusFilter;
      const matchesService = serviceFilter === 'all' || trace.serviceName === serviceFilter;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [traces, searchTerm, statusFilter, serviceFilter]);

  const services = useMemo(() => {
    const uniqueServices = new Set(traces.map((t) => t.serviceName));
    return ['all', ...Array.from(uniqueServices)];
  }, [traces]);

  const stats = useMemo(() => {
    const total = traces.length;
    const successful = traces.filter((t) => t.status === 'success').length;
    const errors = traces.filter((t) => t.status === 'error').length;
    const durations = traces.map((t) => t.duration).sort((a, b) => a - b);
    const avgDuration = traces.reduce((sum, t) => sum + t.duration, 0) / (total || 1);
    const p50Duration = durations[Math.floor(total * 0.5)] || 0;
    const p95Duration = durations[Math.floor(total * 0.95)] || 0;
    const p99Duration = durations[Math.floor(total * 0.99)] || 0;
    const successRate = (successful / (total || 1)) * 100;
    const errorRate = (errors / (total || 1)) * 100;

    const slowestTrace = traces.reduce(
      (slowest, trace) => (trace.duration > (slowest?.duration || 0) ? trace : slowest),
      traces[0]
    );

    return {
      totalTraces: total,
      total,
      successful,
      errors,
      avgDuration,
      p50Duration,
      p95Duration,
      p99Duration,
      successRate,
      errorRate,
      slowestEndpoint: slowestTrace?.endpoint || '',
      slowestDuration: slowestTrace?.duration || 0,
    };
  }, [traces]);

  const toggleTraceForComparison = (traceId: string) => {
    setSelectedForComparison((prev) => {
      const next = new Set(prev);
      if (next.has(traceId)) {
        next.delete(traceId);
      } else if (next.size < 3) {
        next.add(traceId);
      }
      return next;
    });
  };

  const tracesToCompare = useMemo(() => {
    return traces.filter((t) => selectedForComparison.has(t.id));
  }, [traces, selectedForComparison]);

  return (
    <TelemetryLayout
      org={org}
      projectId={projectId}
      section="Traces"
      headerAction={
        <div className="flex items-center gap-3">
          {selectedForComparison.size > 0 && (
            <Button
              icon={<GitCompare size={14} />}
              onClick={() => setShowComparison(true)}
              className="border-orange-700 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
            >
              Compare ({selectedForComparison.size})
            </Button>
          )}
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
          <Button
            icon={<RefreshCcw size={14} />}
            iconOnly
            onClick={() => setIsLoading(true)}
            ariaLabel="Refresh traces"
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-gray-800 bg-black/60 px-6 py-4 flex-shrink-0">
            <TraceMetricsDashboard metrics={stats} />
          </div>

          <div className="border-b border-gray-800 bg-black/40 px-6 py-3 flex items-center gap-4 flex-shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH TRACES..."
                className="w-full bg-black/60 border border-gray-700 px-3 py-2 pl-9 text-xs uppercase tracking-[0.2em] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
              <Brackets />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-black/60 border border-gray-700 px-3 py-2 text-xs uppercase tracking-[0.2em] text-gray-300 focus:outline-none focus:border-gray-500"
              >
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service === 'all' ? 'All Services' : service}
                  </option>
                ))}
              </select>
              {(['all', 'success', 'error', 'pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
                    statusFilter === status
                      ? 'bg-white/10 border-gray-500 text-white'
                      : 'bg-black/40 border-gray-700 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 uppercase text-xs tracking-[0.3em]">
                  Loading traces...
                </div>
              </div>
            ) : filteredTraces.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 uppercase text-xs tracking-[0.3em]">
                  No traces found
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredTraces.map((trace) => (
                  <TraceRow
                    key={trace.id}
                    trace={trace}
                    isSelected={selectedTrace?.id === trace.id}
                    isSelectedForComparison={selectedForComparison.has(trace.id)}
                    onSelect={() => setSelectedTrace(trace)}
                    onToggleComparison={() => toggleTraceForComparison(trace.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedTrace && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="relative w-full max-w-4xl h-[85vh] border border-gray-700 bg-black flex flex-col">
              <Brackets />
              <TraceDetailsPanel trace={selectedTrace} onClose={() => setSelectedTrace(null)} />
            </div>
          </div>
        )}
      </div>

      {showComparison && (
        <TraceComparison traces={tracesToCompare} onClose={() => setShowComparison(false)} />
      )}
    </TelemetryLayout>
  );
}

function TraceRow({
  trace,
  isSelected,
  isSelectedForComparison,
  onSelect,
  onToggleComparison,
}: {
  trace: Trace;
  isSelected: boolean;
  isSelectedForComparison: boolean;
  onSelect: () => void;
  onToggleComparison: () => void;
}) {
  const statusConfig = STATUS_STYLES[trace.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`flex items-center gap-2 ${isSelected ? 'bg-white/5 border-l-2 border-l-orange-500' : ''}`}
    >
      <div className="px-4 flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelectedForComparison}
          onChange={onToggleComparison}
          className="w-4 h-4 rounded border-gray-700 bg-black/60 text-orange-500 focus:ring-orange-500"
          aria-label="Select for comparison"
        />
      </div>
      <button
        onClick={onSelect}
        className={`flex-1 px-6 py-4 flex items-center gap-4 text-left transition-colors ${
          isSelected ? '' : 'hover:bg-white/[0.02]'
        }`}
      >
        <div className={`p-2 rounded ${statusConfig.bg}`}>
          <StatusIcon size={16} className={statusConfig.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-white">{trace.name}</span>
            <span className="px-2 py-0.5 bg-gray-800 text-[10px] uppercase tracking-wider text-gray-400">
              {trace.method}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-mono">{trace.serviceName}</span>
            <span>•</span>
            <span className="font-mono">{trace.id}</span>
            <span>•</span>
            <span>{trace.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="text-right">
            <div className="text-gray-500 uppercase text-[10px] tracking-wider mb-1">Duration</div>
            <div className="text-white">{trace.duration}ms</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 uppercase text-[10px] tracking-wider mb-1">Spans</div>
            <div className="text-white">{countSpans(trace.spans)}</div>
          </div>
        </div>

        <ChevronRight size={16} className="text-gray-600" />
      </button>
    </div>
  );
}

function countSpans(spans: Span[]): number {
  return spans.reduce((count, span) => {
    return count + 1 + (span.children ? countSpans(span.children) : 0);
  }, 0);
}
