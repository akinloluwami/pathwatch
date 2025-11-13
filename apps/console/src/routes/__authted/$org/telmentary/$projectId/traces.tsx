import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { TelemetryLayout } from '@/components/layouts/telemetry-layout';
import { TraceDetailsPanel } from '@/components/traces/trace-details-panel';
import { TraceComparison } from '@/components/traces/trace-comparison';
import { TraceMetricsDashboard } from '@/components/traces/trace-metrics-dashboard';
import { query } from '@/lib/query-client';
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

const INTERVAL_MS: Record<TimeInterval, number | null> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  all: null,
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
  spanCount: number;
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
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('24h');
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TraceStatus | 'all'>('all');
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalTraces: 0,
    avgDuration: 0,
    p50Duration: 0,
    p95Duration: 0,
    p99Duration: 0,
    successRate: 0,
    errorRate: 0,
    slowestEndpoint: '',
    slowestDuration: 0,
  });

  const getDateRangeFromInterval = (interval: TimeInterval) => {
    const intervalMs = INTERVAL_MS[interval];
    if (intervalMs === null) {
      return { start_date: undefined, end_date: undefined };
    }
    const end_date = new Date().toISOString();
    const start_date = new Date(Date.now() - intervalMs).toISOString();
    return { start_date, end_date };
  };

  // Fetch traces from API
  useEffect(() => {
    async function fetchTraces() {
      setIsLoading(true);
      try {
        const params: any = {
          limit: 100,
        };

        // Add time interval filter
        const { start_date, end_date } = getDateRangeFromInterval(timeInterval);
        if (start_date && end_date) {
          // Convert ISO dates to Unix timestamps (seconds)
          params.start_time = Math.floor(new Date(start_date).getTime() / 1000);
          params.end_time = Math.floor(new Date(end_date).getTime() / 1000);
        }

        // Add status filter
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        // Add service filter
        if (serviceFilter !== 'all') {
          params.service_name = serviceFilter;
        }

        const response = await query.tracing.listTraces(params);

        if (response.error) {
          console.error('Error fetching traces:', response.error);
          setTraces([]);
          return;
        }

        // Transform API response to match UI format
        const transformedTraces: Trace[] = (response.data || []).map((apiTrace: any) => ({
          id: apiTrace.trace_id,
          name: apiTrace.trace_name || `${apiTrace.http_method} ${apiTrace.http_url}`,
          timestamp: new Date(apiTrace.timestamp * 1000), // Convert Unix timestamp to Date
          duration: apiTrace.duration_ms,
          status: apiTrace.status as TraceStatus,
          spans: [], // Will be loaded on demand when trace is selected
          spanCount: apiTrace.span_count || 0,
          serviceName: apiTrace.root_service_name || apiTrace.service_name,
          endpoint: apiTrace.endpoint || apiTrace.http_url || '',
          method: apiTrace.http_method || '',
        }));

        setTraces(transformedTraces);
      } catch (error) {
        console.error('Failed to fetch traces:', error);
        setTraces([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTraces();
  }, [timeInterval, statusFilter, serviceFilter]);

  // Fetch metrics independently from trace list
  useEffect(() => {
    async function fetchMetrics() {
      setIsMetricsLoading(true);
      try {
        const params: any = {};

        // Add time interval filter using the same helper as fetchTraces
        const { start_date, end_date } = getDateRangeFromInterval(timeInterval);
        if (start_date && end_date) {
          // Convert ISO strings to Unix timestamps for metrics endpoints
          params.start_time = Math.floor(new Date(start_date).getTime() / 1000);
          params.end_time = Math.floor(new Date(end_date).getTime() / 1000);
        }

        // Add service filter
        if (serviceFilter !== 'all') {
          params.service_name = serviceFilter;
        }

        // Fetch all metrics in parallel
        const [latencyResponse, errorRateResponse, topEndpointsResponse] = await Promise.all([
          query.tracing.metrics.latency(params),
          query.tracing.metrics.errorRate(params),
          query.tracing.topEndpoints(params),
        ]);

        if (latencyResponse.error || errorRateResponse.error || topEndpointsResponse.error) {
          console.error('Error fetching metrics');
          return;
        }

        const latencyData = latencyResponse.data?.[0] || {};
        const errorData = errorRateResponse.data?.[0] || {};
        const topEndpoints = topEndpointsResponse.data || [];

        setStats({
          totalTraces: latencyData.total_traces || 0,
          avgDuration: Math.round(latencyData.avg_duration_ms || 0),
          p50Duration: Math.round(latencyData.p50_duration_ms || 0),
          p95Duration: Math.round(latencyData.p95_duration_ms || 0),
          p99Duration: Math.round(latencyData.p99_duration_ms || 0),
          successRate: errorData.success_rate || 0,
          errorRate: errorData.error_rate || 0,
          slowestEndpoint: topEndpoints[0]?.endpoint || '',
          slowestDuration: Math.round(topEndpoints[0]?.avg_duration_ms || 0),
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setIsMetricsLoading(false);
      }
    }

    fetchMetrics();
  }, [timeInterval, serviceFilter]);

  // Fetch trace details when a trace is selected
  useEffect(() => {
    async function fetchTraceDetails() {
      if (!selectedTrace) return;

      try {
        const [detailsResponse, spansResponse] = await Promise.all([
          query.tracing.getTraceDetails(selectedTrace.id),
          query.tracing.getTraceSpans(selectedTrace.id),
        ]);

        if (spansResponse.error) {
          console.error('Error fetching spans:', spansResponse.error);
          return;
        }

        // Transform spans from API format to UI format
        const apiSpans = spansResponse.data || [];

        // Build span hierarchy
        const spanMap = new Map<string, Span>();
        const rootSpans: Span[] = [];

        apiSpans.forEach((apiSpan: any) => {
          const span: Span = {
            id: apiSpan.span_id,
            name: apiSpan.span_name,
            type: determineSpanType(apiSpan),
            startTime: apiSpan.start_time_ms - apiSpans[0]?.start_time_ms || 0, // Relative to trace start
            duration: apiSpan.duration_ms,
            status: apiSpan.error ? 'error' : 'success',
            attributes: apiSpan.attributes ? JSON.parse(apiSpan.attributes) : undefined,
            children: [],
          };
          spanMap.set(span.id, span);
        });

        // Build hierarchy
        apiSpans.forEach((apiSpan: any) => {
          const span = spanMap.get(apiSpan.span_id);
          if (!span) return;

          if (apiSpan.parent_span_id && spanMap.has(apiSpan.parent_span_id)) {
            const parent = spanMap.get(apiSpan.parent_span_id);
            if (parent) {
              if (!parent.children) parent.children = [];
              parent.children.push(span);
            }
          } else {
            rootSpans.push(span);
          }
        });

        // Update the selected trace with spans
        setSelectedTrace((prev) =>
          prev
            ? {
                ...prev,
                spans: rootSpans,
              }
            : null
        );
      } catch (error) {
        console.error('Failed to fetch trace details:', error);
      }
    }

    fetchTraceDetails();
  }, [selectedTrace?.id]);

  // Helper function to determine span type from API data
  function determineSpanType(apiSpan: any): SpanType {
    if (apiSpan.http_method) return 'http';
    if (apiSpan.db_system) return 'db';
    if (apiSpan.span_kind === 'CLIENT') return 'external';
    if (apiSpan.span_name?.toLowerCase().includes('cache')) return 'cache';
    return 'internal';
  }

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
            <div className="text-white">{trace.spanCount}</div>
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
