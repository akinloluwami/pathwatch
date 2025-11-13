import { useState } from 'react';
import Brackets from '@/components/ui/brackets';
import { X, Copy, Check, ChevronDown } from 'lucide-react';

type SpanType = 'http' | 'db' | 'cache' | 'external' | 'internal';
type TraceStatus = 'success' | 'error' | 'pending';

type SpanAttribute = {
  key: string;
  value: any;
};

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

type TraceDetailsPanelProps = {
  trace: Trace;
  onClose: () => void;
};

const SPAN_TYPE_COLORS: Record<SpanType, string> = {
  http: '#2d86de',
  db: '#3b82f6',
  cache: '#10b981',
  external: '#8b5cf6',
  internal: '#6b7280',
};

export function TraceDetailsPanel({ trace, onClose }: TraceDetailsPanelProps) {
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60 flex-shrink-0">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
            Trace Details
          </div>
          <div className="text-sm font-mono text-white">{trace.name}</div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4 border-b border-gray-800 space-y-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">Overview</div>
          <DetailField
            label="Trace ID"
            value={trace.id}
            onCopy={() => copyToClipboard(trace.id, 'traceId')}
            isCopied={copiedField === 'traceId'}
          />
          <DetailField label="Service" value={trace.serviceName} />
          <DetailField label="Endpoint" value={trace.endpoint} />
          <DetailField label="Method" value={trace.method} />
          <DetailField label="Timestamp" value={trace.timestamp.toISOString()} />
          <DetailField label="Total Duration" value={`${trace.duration}ms`} />
          <DetailField
            label="Status"
            value={
              <span
                className={`px-2 py-1 text-xs uppercase tracking-wider ${
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
        </div>

        <div className="px-6 py-4 border-b border-gray-800">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">
            Span Timeline
          </div>
          <div className="space-y-2">
            {trace.spans.map((span) => (
              <SpanTimeline
                key={span.id}
                span={span}
                maxDuration={trace.duration}
                onSelect={setSelectedSpan}
                isSelected={selectedSpan?.id === span.id}
              />
            ))}
          </div>
        </div>

        {selectedSpan && (
          <div className="px-6 py-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">
              Span Details: {selectedSpan.name}
            </div>
            <div className="space-y-3">
              <DetailField
                label="Span ID"
                value={selectedSpan.id}
                onCopy={() => copyToClipboard(selectedSpan.id, 'spanId')}
                isCopied={copiedField === 'spanId'}
              />
              <DetailField label="Type" value={selectedSpan.type.toUpperCase()} />
              <DetailField label="Duration" value={`${selectedSpan.duration}ms`} />
              <DetailField
                label="Start Time"
                value={`+${selectedSpan.startTime}ms from trace start`}
              />
              {selectedSpan.attributes && Object.keys(selectedSpan.attributes).length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
                    Attributes
                  </div>
                  <div className="space-y-2">
                    {Object.entries(selectedSpan.attributes).map(([key, value]) => (
                      <DetailField
                        key={key}
                        label={key}
                        value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  onCopy,
  isCopied,
}: {
  label: string;
  value: React.ReactNode;
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <div className="flex items-start justify-between text-xs group">
      <span className="text-gray-500 uppercase tracking-wider flex-shrink-0 w-32">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-gray-300 font-mono text-right break-all">{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300 flex-shrink-0"
            aria-label="Copy to clipboard"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SpanTimeline({
  span,
  maxDuration,
  onSelect,
  isSelected,
  depth = 0,
}: {
  span: Span;
  maxDuration: number;
  onSelect: (span: Span) => void;
  isSelected: boolean;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = span.children && span.children.length > 0;
  const leftPercent = (span.startTime / maxDuration) * 100;
  const widthPercent = (span.duration / maxDuration) * 100;
  const color = SPAN_TYPE_COLORS[span.type];

  return (
    <div>
      <button
        onClick={() => onSelect(span)}
        className={`w-full text-left ${isSelected ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <div className="flex items-center gap-2 py-2">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-500 hover:text-gray-300"
            >
              <ChevronDown
                size={12}
                className={`transition-transform ${isExpanded ? '' : '-rotate-90'}`}
              />
            </button>
          ) : (
            <div className="w-3" />
          )}

          <div className="flex-1 flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-300 flex-1">{span.name}</span>
            <span className="text-[10px] font-mono text-gray-500">{span.duration}ms</span>
          </div>
        </div>

        <div className="relative h-2 mb-1" style={{ marginLeft: `${depth * 16 + 20}px` }}>
          <div
            className="absolute h-full"
            style={{
              left: `${leftPercent}%`,
              width: `${Math.max(widthPercent, 0.5)}%`,
              backgroundColor: color,
              opacity: 0.8,
            }}
          />
        </div>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {span.children!.map((child) => (
            <SpanTimeline
              key={child.id}
              span={child}
              maxDuration={maxDuration}
              onSelect={onSelect}
              isSelected={isSelected}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
