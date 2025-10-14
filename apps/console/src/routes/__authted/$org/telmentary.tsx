import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { BetweenHorizonalStart, ChevronDown, Settings2, TriangleAlert } from 'lucide-react';
import path from 'path';

export const Route = createFileRoute('/__authted/$org/telmentary')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  const links = [
    {
      name: 'Logs',
      path: '/$org/telmentary/$projectId/logs',
      icon: <BetweenHorizonalStart size={16} />,
    },
    {
      name: 'Alerts',
      path: '/$org/telmentary/$projectId/alerts',
      icon: <TriangleAlert size={16} />,
    },
    {
      name: 'Settings',
      path: '/$org/telmentary/$projectId/settings',
      icon: <Settings2 size={16} />,
    },
  ];

  // Helper function to check if a link is active
  const isLinkActive = (linkPath: string) => {
    const resolvedPath = linkPath.replace('$org', 'logbase').replace('$projectId', 'plaything');
    return pathname === resolvedPath;
  };

  return (
    <div className="flex h-full space-x-5">
      <div className="w-72 h-full border border-gray-800 relative">
        <div className="bg-gray-400/10 border-b border-gray-800">
          <button className="w-full flex items-center justify-between px-4 py-2">
            <span className="text-sm">Plaything</span>
            <span>
              <ChevronDown size={24} className="inline-block ml-2" />
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-y-5 p-2">
          {links.map((link) => {
            const isActive = isLinkActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                params={{ org: 'logbase', projectId: 'plaything' }}
              >
                <div className="relative p-1">
                  <Button icon={link.icon} showBrackets={isActive}>
                    {link.name}
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>

        <Brackets />
      </div>
      <Outlet />
    </div>
  );
}
