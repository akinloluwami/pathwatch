import { TelemetryLayout } from '@/components/layouts/telemetry-layout';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Settings2, Bell, Webhook, Key, Database, Shield } from 'lucide-react';
import { ReactNode } from 'react';

type SettingsPath =
  | '/$org/telmentary/$projectId/settings/general'
  | '/$org/telmentary/$projectId/settings/alerts'
  | '/$org/telmentary/$projectId/settings/integrations'
  | '/$org/telmentary/$projectId/settings/api-keys'
  | '/$org/telmentary/$projectId/settings/data-retention'
  | '/$org/telmentary/$projectId/settings/access-control';

type NavItem = {
  label: string;
  icon: ReactNode;
  path: SettingsPath;
};

const navItems: NavItem[] = [
  {
    label: 'General',
    path: '/$org/telmentary/$projectId/settings/general',
    icon: <Settings2 size={16} />,
  },
  {
    label: 'Alert Config',
    path: '/$org/telmentary/$projectId/settings/alerts',
    icon: <Bell size={16} />,
  },
  {
    label: 'Integrations',
    path: '/$org/telmentary/$projectId/settings/integrations',
    icon: <Webhook size={16} />,
  },
  {
    label: 'API Keys',
    path: '/$org/telmentary/$projectId/settings/api-keys',
    icon: <Key size={16} />,
  },
  {
    label: 'Data Retention',
    path: '/$org/telmentary/$projectId/settings/data-retention',
    icon: <Database size={16} />,
  },
  {
    label: 'Access Control',
    path: '/$org/telmentary/$projectId/settings/access-control',
    icon: <Shield size={16} />,
  },
];

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org, projectId } = Route.useParams();
  const { pathname } = useLocation();

  return (
    <TelemetryLayout org={org} projectId={projectId} section="Settings">
      <div className="px-6 py-5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <nav className="flex-shrink-0 border-b border-gray-800 pb-4 mb-5">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const resolvedPath = item.path
                .replace('$org', org ?? '')
                .replace('$projectId', projectId ?? '');
              const isActive = pathname === resolvedPath;

              return (
                <Link key={item.label} to={item.path} params={{ org, projectId }}>
                  <Button
                    icon={item.icon}
                    size="sm"
                    showBrackets={isActive}
                    className={`px-3 py-0 gap-3 ${
                      isActive
                        ? 'bg-white/10 text-white border-gray-700'
                        : 'bg-black/20 text-gray-400 border-gray-700 hover:bg-white/5'
                    } transition-colors`}
                    rawChildren
                  >
                    <span className="text-xs uppercase tracking-[0.2em]">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </div>
      </div>
    </TelemetryLayout>
  );
}
