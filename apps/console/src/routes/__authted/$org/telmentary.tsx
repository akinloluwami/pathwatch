import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import {
  BadgeCheck,
  BetweenHorizonalStart,
  Clock4,
  ChevronDown,
  Settings2,
  TriangleAlert,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useProjectsStore } from '@/stores/projects-store';
import { useSession } from '@/lib/auth-client';

export const Route = createFileRoute('/__authted/$org/telmentary')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { org } = Route.useParams();
  const [isPickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const { data: session } = useSession();
  const { projects, isLoading, fetchProjects } = useProjectsStore();

  useEffect(() => {
    if (session?.user) {
      fetchProjects(org);
    }
  }, [org, session, fetchProjects]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleClickAway = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPickerOpen]);

  const pathSegments = pathname.split('/').filter(Boolean);
  const telmentaryIndex = pathSegments.indexOf('telmentary');
  const projectSlugFromPath =
    telmentaryIndex > -1 ? pathSegments[telmentaryIndex + 1] : projects[0]?.slug;

  const activeProject = projects.find((item) => item.slug === projectSlugFromPath) ?? projects[0];

  const links = [
    {
      name: 'Logs',
      path: '/$org/telmentary/$projectId/logs',
      icon: <BetweenHorizonalStart size={16} />,
    },
    {
      name: 'Traces',
      path: '/$org/telmentary/$projectId/traces',
      icon: <Activity size={16} />,
    },
    {
      name: 'Analytics',
      path: '/$org/telmentary/$projectId/analytics',
      icon: <BarChart3 size={16} />,
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

  const isLinkActive = (linkPath: string) => {
    if (!activeProject) {
      return false;
    }
    const resolvedPath = linkPath.replace('$org', org).replace('$projectId', activeProject.slug);
    return pathname === resolvedPath;
  };

  const handleSelectProject = (project: (typeof projects)[number]) => {
    if (!project || project.slug === activeProject?.slug) {
      setPickerOpen(false);
      return;
    }

    navigate({
      to: '/$org/telmentary/$projectId/logs',
      params: {
        org: org,
        projectId: project.slug,
      },
    });
    setPickerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  if (!activeProject) {
    return null;
  }

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-80 h-full border border-gray-800 relative flex-shrink-0 bg-black/40">
        <Brackets />

        <div className="border-b border-gray-800 px-4 py-3">
          <div ref={pickerRef} className="relative">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">Project</p>
            <Button
              intent="ghost"
              showBrackets={false}
              className="mt-2 w-full px-3 py-2 text-white flex items-center justify-between"
              onClick={() => setPickerOpen((prev) => !prev)}
              ariaLabel="Select project"
              ariaExpanded={isPickerOpen}
              rawChildren
            >
              <span className="flex w-full items-center text-xs font-medium text-white normal-case">
                <span className="flex-1 truncate pr-3">{activeProject.name}</span>
                <ChevronDown
                  size={16}
                  className={`ml-auto transition-transform text-gray-500 ${isPickerOpen ? 'rotate-180' : ''}`}
                />
              </span>
            </Button>

            <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-gray-600">{org}</p>

            {isPickerOpen ? (
              <div className="absolute left-0 right-0 top-15 z-20 mt-2 overflow-hidden rounded border border-gray-800 bg-black shadow-2xl">
                <ul className="relative max-h-64 divide-y divide-gray-900/60 overflow-y-auto">
                  {projects.map((project) => {
                    const isSelected = project.slug === activeProject.slug;
                    return (
                      <li key={project.slug}>
                        <button
                          type="button"
                          onClick={() => handleSelectProject(project)}
                          className={`w-full px-3 py-3 text-left transition-colors ${
                            isSelected ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{project.name}</p>
                              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                                {org}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                              <BadgeCheck size={12} /> {project.status || 'Active'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-end text-[11px] uppercase tracking-[0.3em] text-gray-500">
                            <span>
                              {project.updated_at
                                ? new Intl.DateTimeFormat('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  }).format(new Date(project.updated_at))
                                : '—'}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center text-xs text-gray-400">
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <BadgeCheck size={14} />
              {activeProject.status || 'Active'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-gray-500">
            <span className="inline-flex items-center gap-2">
              <Clock4 size={12} /> Updated
            </span>
            <span className="text-gray-400">
              {activeProject.updated_at
                ? new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }).format(new Date(activeProject.updated_at))
                : '—'}
            </span>
          </div>
        </div>

        <div className="px-3 py-4 space-y-6 overflow-y-auto h-[calc(100%-5.5rem)] pb-16">
          <section className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-600">Overview</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-gray-800 bg-black/30 p-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Errors</p>
                <p className="mt-1 text-base text-white">{activeProject.metrics?.errors || 0}</p>
              </div>
              <div className="rounded border border-gray-800 bg-black/30 p-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">P99 latency</p>
                <p className="mt-1 text-base text-white">{activeProject.metrics?.p99 || '—'}</p>
              </div>
            </div>
          </section>

          <nav className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-600">Navigate</p>
            {links.map((link) => {
              const isActive = isLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  params={{
                    org: org,
                    projectId: activeProject.slug,
                  }}
                >
                  <div className="relative">
                    <Button
                      icon={link.icon}
                      showBrackets={isActive}
                      intent="ghost"
                      size="sm"
                      className={`justify-start w-full gap-3 px-3 ${
                        isActive ? 'bg-white/10 text-white border-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {link.name}
                    </Button>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t border-gray-800 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-gray-600 flex items-center justify-between">
          <span>Console v0.1</span>
          <span>Telemetry</span>
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden ml-5">
        <Outlet />
      </div>
    </div>
  );
}
