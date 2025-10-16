import Brackets from '@/components/ui/brackets';
import { createFileRoute } from '@tanstack/react-router';
import { TrendingUp, TrendingDown, Activity, BarChart3, ChevronDown } from 'lucide-react';
import { useState } from 'react';

type TimeInterval = '1h' | '6h' | '24h' | '7d' | '30d';

const INTERVAL_LABELS: Record<TimeInterval, string> = {
  '1h': 'Last 1 hour',
  '6h': 'Last 6 hours',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
};

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/analytics')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org, projectId } = Route.useParams();
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('24h');
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);

  return (
    <div className="flex-1 h-[calc(100vh-2.5rem)] border border-gray-800 bg-black/40 relative flex flex-col overflow-hidden">
      <Brackets />

      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60 flex-shrink-0">
        <div>
          <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">
            Telemetry // Analytics
          </p>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-300">
            <span className="font-medium text-white">{projectId}</span>
            <span className="text-gray-600">/</span>
            <span className="uppercase text-xs tracking-[0.3em] text-gray-500">Org {org}</span>
          </div>
        </div>

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
      </header>

      <section className="px-6 py-5 flex-1 min-h-0 flex flex-col gap-5 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-shrink-0">
          <MetricCard
            label="Total Requests"
            value="1.2M"
            change={12.5}
            trend="up"
            icon={<Activity size={16} />}
          />
          <MetricCard
            label="Avg Response Time"
            value="245ms"
            change={-8.3}
            trend="down"
            icon={<TrendingDown size={16} />}
          />
          <MetricCard
            label="Error Rate"
            value="2.4%"
            change={-15.2}
            trend="down"
            icon={<TrendingDown size={16} />}
          />
          <MetricCard
            label="Success Rate"
            value="97.6%"
            change={1.8}
            trend="up"
            icon={<TrendingUp size={16} />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ChartCard title="Requests Over Time" height="h-80">
            <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
              <BarChart3 size={48} className="opacity-20" />
            </div>
          </ChartCard>

          <ChartCard title="Response Time Distribution" height="h-80">
            <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
              <BarChart3 size={48} className="opacity-20" />
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ChartCard title="Status Code Breakdown" height="h-80">
            <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
              <BarChart3 size={48} className="opacity-20" />
            </div>
          </ChartCard>

          <ChartCard title="Top Endpoints by Volume" height="h-80">
            <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
              <BarChart3 size={48} className="opacity-20" />
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Error Rate Timeline" height="h-64">
          <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
            <BarChart3 size={48} className="opacity-20" />
          </div>
        </ChartCard>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ChartCard title="Traffic by Region" height="h-72">
            <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
              <BarChart3 size={48} className="opacity-20" />
            </div>
          </ChartCard>

          <ChartCard title="Request Methods" height="h-72">
            <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
              <BarChart3 size={48} className="opacity-20" />
            </div>
          </ChartCard>

          <ChartCard title="Cache Hit Rate" height="h-72">
            <div className="flex items-center justify-center h-full text-xs uppercase tracking-[0.3em] text-gray-600">
              <BarChart3 size={48} className="opacity-20" />
            </div>
          </ChartCard>
        </div>
      </section>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
};

function MetricCard({ label, value, change, trend, icon }: MetricCardProps) {
  const isPositive = trend === 'up';
  const changeColor = isPositive ? 'text-emerald-300' : 'text-red-300';

  return (
    <div className="relative border border-gray-800 bg-black/30 px-4 py-3">
      <Brackets />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="uppercase text-[10px] tracking-[0.35em] text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <div className={`mt-1 flex items-center gap-1 text-[11px] ${changeColor}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change)}%</span>
            <span className="text-gray-500">vs prev period</span>
          </div>
        </div>
        <div className="text-gray-600">{icon}</div>
      </div>
    </div>
  );
}

type ChartCardProps = {
  title: string;
  height: string;
  children: React.ReactNode;
};

function ChartCard({ title, height, children }: ChartCardProps) {
  return (
    <div className={`relative border border-gray-800 bg-black/30 ${height} flex flex-col`}>
      <Brackets />
      <div className="border-b border-gray-800 px-4 py-3 bg-black/40">
        <p className="uppercase text-[10px] tracking-[0.35em] text-gray-400">{title}</p>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
