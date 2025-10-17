import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { TelemetryLayout } from '@/components/layouts/telemetry-layout';
import { CreateAlertModal, type AlertFormData } from '@/components/alerts/create-alert-modal';
import { faker } from '@faker-js/faker';
import { createFileRoute } from '@tanstack/react-router';
import { Plus, Bell, BellOff, ChevronDown, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type AlertStatus = 'active' | 'paused' | 'triggered';
type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertCondition = 'error_rate' | 'latency' | 'status_code' | 'request_volume';

type Alert = {
  id: string;
  name: string;
  status: AlertStatus;
  severity: AlertSeverity;
  condition: AlertCondition;
  threshold: string;
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  channels: string[];
};

const STATUS_STYLES: Record<AlertStatus, string> = {
  active: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  paused: 'border-gray-500/50 bg-gray-500/10 text-gray-300',
  triggered: 'border-red-500/50 bg-red-500/10 text-red-300',
};

const STATUS_LABELS: Record<AlertStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  triggered: 'Triggered',
};

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: 'text-red-300',
  warning: 'text-amber-300',
  info: 'text-sky-300',
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

const CONDITION_LABELS: Record<AlertCondition, string> = {
  error_rate: 'Error Rate',
  latency: 'Latency',
  status_code: 'Status Code',
  request_volume: 'Request Volume',
};

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/alerts')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org, projectId } = Route.useParams();
  const [alerts, setAlerts] = useState<Alert[]>(() => generateAlerts());
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredAlerts = useMemo(() => {
    if (filterStatus === 'all') {
      return alerts;
    }
    return alerts.filter((alert) => alert.status === filterStatus);
  }, [alerts, filterStatus]);

  const stats = useMemo(() => {
    const active = alerts.filter((a) => a.status === 'active').length;
    const triggered = alerts.filter((a) => a.status === 'triggered').length;
    const paused = alerts.filter((a) => a.status === 'paused').length;
    const totalTriggers = alerts.reduce((sum, a) => sum + a.triggerCount, 0);

    return { active, triggered, paused, total: alerts.length, totalTriggers };
  }, [alerts]);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    []
  );

  const handleToggleStatus = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === alertId) {
          const newStatus = alert.status === 'paused' ? 'active' : 'paused';
          return { ...alert, status: newStatus };
        }
        return alert;
      })
    );
  };

  const handleCreateAlert = (formData: AlertFormData) => {
    const newAlert: Alert = {
      id: faker.string.uuid(),
      name: formData.name,
      status: 'active',
      severity: formData.severity,
      condition: formData.condition,
      threshold: formData.threshold,
      lastTriggered: undefined,
      triggerCount: 0,
      createdAt: new Date(),
      channels: formData.channels,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setIsCreateModalOpen(false);
  };

  return (
    <TelemetryLayout
      org={org}
      projectId={projectId}
      section="Alerts"
      headerAction={
        <Button
          icon={<Plus size={14} />}
          onClick={() => setIsCreateModalOpen(true)}
          showBrackets={false}
          className="border-gray-700 text-gray-200 hover:bg-white/5"
        >
          New Alert
        </Button>
      }
    >
      <div className="px-6 py-5 flex-1 min-h-0 flex flex-col gap-5 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-shrink-0">
          <StatCard
            label="Total Alerts"
            value={stats.total.toString()}
            hint={`${stats.active} active`}
          />
          <StatCard
            label="Active"
            value={stats.active.toString()}
            hint={`${stats.triggered} triggered`}
          />
          <StatCard label="Triggered" value={stats.triggered.toString()} hint="Needs attention" />
          <StatCard label="Paused" value={stats.paused.toString()} hint="Not monitoring" />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setFilterStatus('all')}
              showBrackets={filterStatus === 'all'}
              className={`${filterStatus === 'all' ? 'bg-white/10 text-white' : 'bg-black/20 text-gray-400'} w-[80px] justify-center px-3 py-0 uppercase tracking-[0.2em] text-[11px] border-gray-700 transition-colors`}
            >
              All
            </Button>
            <Button
              onClick={() => setFilterStatus('active')}
              showBrackets={filterStatus === 'active'}
              className={`${filterStatus === 'active' ? 'bg-white/10 text-white' : 'bg-black/20 text-gray-400'} w-[80px] justify-center px-3 py-0 uppercase tracking-[0.2em] text-[11px] border-gray-700 transition-colors`}
            >
              Active
            </Button>
            <Button
              onClick={() => setFilterStatus('triggered')}
              showBrackets={filterStatus === 'triggered'}
              className={`${filterStatus === 'triggered' ? 'bg-white/10 text-white' : 'bg-black/20 text-gray-400'} w-[96px] justify-center px-3 py-0 uppercase tracking-[0.2em] text-[11px] border-gray-700 transition-colors`}
            >
              Triggered
            </Button>
            <Button
              onClick={() => setFilterStatus('paused')}
              showBrackets={filterStatus === 'paused'}
              className={`${filterStatus === 'paused' ? 'bg-white/10 text-white' : 'bg-black/20 text-gray-400'} w-[80px] justify-center px-3 py-0 uppercase tracking-[0.2em] text-[11px] border-gray-700 transition-colors`}
            >
              Paused
            </Button>
          </div>
        </div>

        <CreateAlertModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAlert}
        />

        <div className="flex-1 min-h-0 border border-gray-800 bg-black/30 relative flex flex-col">
          <Brackets />
          {filteredAlerts.length ? (
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-black/80 text-[11px] uppercase tracking-[0.3em] text-gray-500">
                  <tr>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Alert Name</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Status</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Severity</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Condition</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">Threshold</th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal">
                      Last Triggered
                    </th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal text-right">
                      Triggers
                    </th>
                    <th className="border-b border-gray-800 px-4 py-3 font-normal text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-gray-900/40 odd:bg-white/5 even:bg-black/0 hover:bg-white/10 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-200">
                        <div className="font-medium">{alert.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-500">
                          {alert.channels.map((channel) => (
                            <span key={channel}>{channel}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-sm border px-2 py-[3px] text-[11px] uppercase tracking-[0.25em] ${STATUS_STYLES[alert.status]}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {STATUS_LABELS[alert.status]}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-xs uppercase tracking-[0.2em] ${SEVERITY_STYLES[alert.severity]}`}
                      >
                        {SEVERITY_LABELS[alert.severity]}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {CONDITION_LABELS[alert.condition]}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300">
                        {alert.threshold}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">
                        {alert.lastTriggered ? timeFormatter.format(alert.lastTriggered) : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap text-right">
                        {alert.triggerCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(alert.id)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title={alert.status === 'paused' ? 'Activate' : 'Pause'}
                          >
                            {alert.status === 'paused' ? <Bell size={14} /> : <BellOff size={14} />}
                          </button>
                          <button
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="Settings"
                          >
                            <Settings2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-600">
              No alerts matched your filters
            </div>
          )}
        </div>
      </div>
    </TelemetryLayout>
  );
}

function generateAlerts(): Alert[] {
  const now = Date.now();
  const alertNames = [
    'High Error Rate API',
    'Slow Response Time',
    'Database Connection Failures',
    'Memory Usage Critical',
    '5xx Status Surge',
    'Request Volume Spike',
    'Authentication Failures',
    'Payment Gateway Timeout',
  ];

  const channels = ['Email', 'Slack', 'PagerDuty', 'Webhook'];

  return Array.from({ length: 12 }, (_, index) => {
    const status = faker.helpers.arrayElement<AlertStatus>([
      'active',
      'paused',
      'triggered',
      'active',
      'active',
    ]);
    const severity = faker.helpers.arrayElement<AlertSeverity>(['critical', 'warning', 'info']);
    const condition = faker.helpers.arrayElement<AlertCondition>([
      'error_rate',
      'latency',
      'status_code',
      'request_volume',
    ]);

    const thresholds: Record<AlertCondition, string> = {
      error_rate: `> ${faker.number.int({ min: 1, max: 10 })}%`,
      latency: `> ${faker.number.int({ min: 500, max: 3000 })}ms`,
      status_code: `5xx > ${faker.number.int({ min: 5, max: 50 })}`,
      request_volume: `> ${faker.number.int({ min: 1000, max: 10000 })}/min`,
    };

    const hasTriggered = status === 'triggered' || Math.random() > 0.3;
    const lastTriggered = hasTriggered ? faker.date.recent({ days: 7, refDate: now }) : undefined;

    const triggerCount = hasTriggered ? faker.number.int({ min: 1, max: 150 }) : 0;
    const createdAt = faker.date.recent({ days: 30, refDate: now });

    const selectedChannels = faker.helpers.arrayElements(
      channels,
      faker.number.int({ min: 1, max: 3 })
    );

    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(alertNames),
      status,
      severity,
      condition,
      threshold: thresholds[condition],
      lastTriggered,
      triggerCount,
      createdAt,
      channels: selectedChannels,
    };
  }).sort((a, b) => {
    if (a.status === 'triggered' && b.status !== 'triggered') return -1;
    if (a.status !== 'triggered' && b.status === 'triggered') return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
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
