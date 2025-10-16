import Brackets from '@/components/ui/brackets';
import { createFileRoute } from '@tanstack/react-router';
import { TrendingUp, TrendingDown, Activity, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

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

  const requestsOverTimeData = useMemo(() => generateRequestsOverTime(), []);
  const responseTimeData = useMemo(() => generateResponseTimeDistribution(), []);
  const statusCodeData = useMemo(() => generateStatusCodeBreakdown(), []);
  const topEndpointsData = useMemo(() => generateTopEndpoints(), []);
  const errorRateData = useMemo(() => generateErrorRateTimeline(), []);
  const regionData = useMemo(() => generateRegionData(), []);
  const methodData = useMemo(() => generateMethodData(), []);
  const cacheHitData = useMemo(() => generateCacheHitData(), []);

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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestsOverTimeData}>
                <defs>
                  <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f45817" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f45817" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="time"
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    background: '#000',
                    border: '1px solid #374151',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#f45817"
                  strokeWidth={2}
                  fill="url(#requestsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Response Time Distribution" height="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="range"
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    background: '#000',
                    border: '1px solid #374151',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="count" fill="#f45817" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ChartCard title="Status Code Breakdown" height="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCodeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusCodeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#000',
                    border: '1px solid #374151',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Endpoints by Volume" height="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEndpointsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  type="number"
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <YAxis
                  type="category"
                  dataKey="endpoint"
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    background: '#000',
                    border: '1px solid #374151',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="requests" fill="#f45817" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Error Rate Timeline" height="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
                domain={[0, 10]}
              />
              <Tooltip
                contentStyle={{
                  background: '#000',
                  border: '1px solid #374151',
                  borderRadius: '0',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="errorRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ChartCard title="Traffic by Region" height="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {regionData.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={REGION_COLORS[index % REGION_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#000',
                    border: '1px solid #374151',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Request Methods" height="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="method"
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    background: '#000',
                    border: '1px solid #374151',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#f45817" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cache Hit Rate" height="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cacheHitData}>
                <defs>
                  <linearGradient id="cacheGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="time"
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    background: '#000',
                    border: '1px solid #374151',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area
                  type="monotone"
                  dataKey="hitRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#cacheGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
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

const REGION_COLORS = ['#f45817', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

function generateRequestsOverTime() {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: `${i}:00`,
      requests: Math.floor(Math.random() * 5000) + 15000,
    });
  }
  return data.reverse();
}

function generateResponseTimeDistribution() {
  return [
    { range: '0-100ms', count: 45000 },
    { range: '100-200ms', count: 32000 },
    { range: '200-500ms', count: 18000 },
    { range: '500-1s', count: 8500 },
    { range: '1s+', count: 2800 },
  ];
}

function generateStatusCodeBreakdown() {
  return [
    { name: '2xx', value: 850000, color: '#10b981' },
    { name: '3xx', value: 42000, color: '#3b82f6' },
    { name: '4xx', value: 28000, color: '#f59e0b' },
    { name: '5xx', value: 8500, color: '#ef4444' },
  ];
}

function generateTopEndpoints() {
  return [
    { endpoint: '/api/v1/logs', requests: 125000 },
    { endpoint: '/api/v1/projects', requests: 98000 },
    { endpoint: '/api/v1/ingest', requests: 85000 },
    { endpoint: '/api/v1/metrics', requests: 72000 },
    { endpoint: '/api/v1/errors', requests: 58000 },
  ];
}

function generateErrorRateTimeline() {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: `${i}:00`,
      errorRate: Math.random() * 5 + 1,
    });
  }
  return data.reverse();
}

function generateRegionData() {
  return [
    { name: 'US-East', value: 425000 },
    { name: 'EU-West', value: 285000 },
    { name: 'AP-South', value: 165000 },
    { name: 'US-West', value: 95000 },
    { name: 'Other', value: 58000 },
  ];
}

function generateMethodData() {
  return [
    { method: 'GET', count: 580000 },
    { method: 'POST', count: 245000 },
    { method: 'PUT', count: 85000 },
    { method: 'DELETE', count: 42000 },
    { method: 'PATCH', count: 28000 },
  ];
}

function generateCacheHitData() {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: `${i}:00`,
      hitRate: Math.random() * 15 + 75,
    });
  }
  return data.reverse();
}
