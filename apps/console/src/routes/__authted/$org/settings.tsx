import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { CreditCard, LifeBuoy, Settings2, ShieldCheck, Users } from 'lucide-react';
import { ReactNode } from 'react';

type SettingsPath =
  | '/$org/settings/general'
  | '/$org/settings/team'
  | '/$org/settings/security'
  | '/$org/settings/billing'
  | '/$org/settings/support';

type NavItem = {
  label: string;
  icon: ReactNode;
  path: SettingsPath;
};

const navItems: NavItem[] = [
  {
    label: 'General',
    path: '/$org/settings/general',
    icon: <Settings2 size={16} />,
  },
  {
    label: 'Team',
    path: '/$org/settings/team',
    icon: <Users size={16} />,
  },
  {
    label: 'Security',
    path: '/$org/settings/security',
    icon: <ShieldCheck size={16} />,
  },
  {
    label: 'Billing',
    path: '/$org/settings/billing',
    icon: <CreditCard size={16} />,
  },
  {
    label: 'Support',
    path: '/$org/settings/support',
    icon: <LifeBuoy size={16} />,
  },
];

export const Route = createFileRoute('/__authted/$org/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org } = Route.useParams();
  const { pathname } = useLocation();

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="relative flex h-full w-80 flex-shrink-0 flex-col border border-gray-800 bg-black/40">
        <Brackets />

        <div className="border-b border-gray-800 px-5 py-5">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gray-600">Workspace</p>
          <p className="mt-2 text-sm font-semibold text-white normal-case">{org}</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-gray-600">
            Settings overview
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gray-600">Sections</p>
          <ul className="mt-3 space-y-2">
            {navItems.map((item) => {
              const resolvedPath = item.path.replace('$org', org ?? '');
              const isActive = pathname.startsWith(resolvedPath);

              const buttonContent = (
                <Button
                  icon={item.icon}
                  intent="ghost"
                  size="sm"
                  showBrackets={isActive}
                  className={`justify-start px-3 py-0 ${
                    isActive ? 'bg-white/10 text-white border-gray-700' : 'text-gray-400'
                  }`}
                  rawChildren
                >
                  <span className="text-xs font-medium uppercase tracking-[0.25em]">
                    {item.label}
                  </span>
                </Button>
              );

              return (
                <li key={item.label}>
                  <Link to={item.path} params={{ org }}>
                    {buttonContent}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-800 px-5 py-4 text-[11px] uppercase tracking-[0.3em] text-gray-600">
          <p>PathWatch Console</p>
          <p className="mt-1 text-gray-500">Settings Module</p>
        </div>
      </aside>

      <div className="ml-5 flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
