import Brackets from '@/components/ui/brackets';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

type TraceMetric = {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  suffix?: string;
};

type TraceMetricsDashboardProps = {
  metrics: {
    totalTraces: number;
    avgDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    errorRate: number;
    successRate: number;
    slowestEndpoint: string;
    slowestDuration: number;
  };
};

export function TraceMetricsDashboard({ metrics }: TraceMetricsDashboardProps) {
  const displayMetrics: TraceMetric[] = [
    {
      label: 'Total Traces',
      value: metrics.totalTraces.toLocaleString(),
      trend: 'neutral',
    },
    {
      label: 'Avg Duration',
      value: metrics.avgDuration.toFixed(0),
      suffix: 'ms',
      trend: 'neutral',
    },
    {
      label: 'P50 Latency',
      value: metrics.p50Duration.toFixed(0),
      suffix: 'ms',
      trend: 'neutral',
    },
    {
      label: 'P95 Latency',
      value: metrics.p95Duration.toFixed(0),
      suffix: 'ms',
      trend: 'neutral',
    },
    {
      label: 'P99 Latency',
      value: metrics.p99Duration.toFixed(0),
      suffix: 'ms',
      trend: 'neutral',
    },
    {
      label: 'Success Rate',
      value: metrics.successRate.toFixed(1),
      suffix: '%',
      trend: metrics.successRate > 95 ? 'up' : metrics.successRate < 90 ? 'down' : 'neutral',
    },
    {
      label: 'Error Rate',
      value: metrics.errorRate.toFixed(1),
      suffix: '%',
      trend: metrics.errorRate < 5 ? 'up' : metrics.errorRate > 10 ? 'down' : 'neutral',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {displayMetrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
      {metrics.slowestEndpoint && (
        <div className="relative border border-gray-800 bg-black/40 px-4 py-3 md:col-span-2 xl:col-span-4">
          <Brackets />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
                Slowest Endpoint
              </div>
              <div className="text-sm font-mono text-white">{metrics.slowestEndpoint}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
                Duration
              </div>
              <div className="text-xl font-mono text-orange-400">{metrics.slowestDuration}ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ metric }: { metric: TraceMetric }) {
  const getTrendIcon = () => {
    if (metric.trend === 'up') return <TrendingUp size={14} className="text-emerald-400" />;
    if (metric.trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
    return <Activity size={14} className="text-gray-500" />;
  };

  const getTrendColor = () => {
    if (metric.trend === 'up') return 'text-emerald-400';
    if (metric.trend === 'down') return 'text-red-400';
    return 'text-gray-300';
  };

  return (
    <div className="relative border border-gray-800 bg-black/40 px-4 py-3">
      <Brackets />
      <div className="flex items-start justify-between mb-1">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500">{metric.label}</div>
        {getTrendIcon()}
      </div>
      <div className={`text-xl font-mono ${getTrendColor()}`}>
        {metric.value}
        {metric.suffix && <span className="text-sm ml-0.5">{metric.suffix}</span>}
      </div>
    </div>
  );
}
