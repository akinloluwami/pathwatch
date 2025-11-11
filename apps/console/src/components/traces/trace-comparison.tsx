import { useState } from 'react';
import Brackets from '@/components/ui/brackets';
import { X, ArrowLeftRight } from 'lucide-react';

type SpanType = 'http' | 'db' | 'cache' | 'external' | 'internal';
type TraceStatus = 'success' | 'error' | 'pending';

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

type TraceComparisonProps = {
  traces: Trace[];
  onClose: () => void;
};

const SPAN_TYPE_COLORS: Record<SpanType, string> = {
  http: '#f45817',
  db: '#3b82f6',
  cache: '#10b981',
  external: '#8b5cf6',
  internal: '#6b7280',
};

export function TraceComparison({ traces, onClose }: TraceComparisonProps) {
  if (traces.length === 0) return null;

  const maxDuration = Math.max(...traces.map((t) => t.duration));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="relative w-full max-w-7xl h-[80vh] border border-gray-700 bg-black flex flex-col">
        <Brackets />

        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <ArrowLeftRight size={20} className="text-orange-500" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
                Trace Comparison
              </div>
              <div className="text-sm text-white">
                Comparing {traces.length} trace{traces.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close comparison"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {traces.map((trace) => (
              <TraceComparisonCard key={trace.id} trace={trace} maxDuration={maxDuration} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TraceComparisonCard({ trace, maxDuration }: { trace: Trace; maxDuration: number }) {
  return (
    <div className="relative border border-gray-800 bg-black/40 flex flex-col">
      <Brackets />
      <div className="border-b border-gray-800 px-4 py-3 bg-black/60">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
          {trace.method}
        </div>
        <div className="text-sm font-mono text-white truncate">{trace.endpoint}</div>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span>{trace.serviceName}</span>
          <span>•</span>
          <span>{trace.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <ComparisonStat label="Duration" value={`${trace.duration}ms`} />
        <ComparisonStat
          label="Status"
          value={
            <span
              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                trace.status === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : trace.status === 'error'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {trace.status}
            </span>
          }
        />
        <ComparisonStat label="Spans" value={countSpans(trace.spans).toString()} />

        <div className="pt-3 border-t border-gray-800">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
            Span Breakdown
          </div>
          <div className="space-y-2">
            {trace.spans.map((span) => (
              <div key={span.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SPAN_TYPE_COLORS[span.type] }}
                    />
                    <span className="text-gray-300 truncate">{span.name}</span>
                  </div>
                  <span className="font-mono text-gray-500">{span.duration}ms</span>
                </div>
                <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(span.duration / maxDuration) * 100}%`,
                      backgroundColor: SPAN_TYPE_COLORS[span.type],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </div>
  );
}

function countSpans(spans: Span[]): number {
  return spans.reduce((count, span) => {
    return count + 1 + (span.children ? countSpans(span.children) : 0);
  }, 0);
}
