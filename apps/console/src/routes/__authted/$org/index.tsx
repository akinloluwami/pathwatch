import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useProjectsStore } from '@/stores/projects-store';
import { useSession, authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { APP_NAME } from '@/constants';
import { appClient } from '@/lib/app-client';
import { toast } from '@/components/ui/toast';

export const Route = createFileRoute('/__authted/$org/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org } = Route.useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { projects, isLoading, fetchProjects } = useProjectsStore();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchProjects(org);
      // Fetch organization details to get ID
      fetchOrganizationId();
    }
  }, [org, session, fetchProjects]);

  const fetchOrganizationId = async () => {
    try {
      const { data } = await authClient.organization.list();
      if (data) {
        const currentOrg = (data as any[]).find((o: any) => o.slug === org);
        if (currentOrg) {
          setOrganizationId(currentOrg.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
    }
  };

  const handleSelectProject = (projectSlug: string) => {
    navigate({
      to: '/$org/telmentary/$projectId/logs',
      params: { org, projectId: projectSlug },
    });
  };

  const handleBack = () => {
    navigate({ to: '/organizations' });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: '/' });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !organizationId) return;

    setIsCreating(true);

    try {
      const result = await appClient.projects.create({
        name: projectName,
        org_id: organizationId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        toast.success('Project created successfully!');
        setShowCreateModal(false);
        setProjectName('');
        // Refresh projects list
        fetchProjects(org);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={handleBack}
              showBrackets={false}
              className="border-gray-700 text-gray-300 hover:bg-white/5"
              iconOnly
              ariaLabel="Back to organizations"
            >
              <></>
            </Button>
            <div>
              <h1 className="text-lg uppercase tracking-[0.2em]">{APP_NAME}</h1>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">/{org}</p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            showBrackets={false}
            className="border-gray-700 text-gray-300 hover:bg-white/5"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Title Section */}
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl uppercase tracking-[0.2em]">Projects</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Select a project to view telemetry data
              </p>
            </div>
            <Button
              icon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
              className="border-gray-700"
            >
              New Project
            </Button>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project.slug)}
                  className="group relative flex flex-col gap-4 border border-gray-800 bg-black/30 p-6 text-left transition-all hover:border-gray-600 hover:bg-white/5"
                >
                  <Brackets />
                  <div className="space-y-4">
                    {/* Project Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center border border-gray-700 bg-black/40">
                          <FolderKanban size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white">{project.name}</h3>
                          <p className="text-xs font-mono text-gray-500">{project.slug}</p>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-gray-400"
                      />
                    </div>

                    {/* Project Stats */}
                    {project.metrics && (
                      <div className="flex items-center gap-4 border-t border-gray-800 pt-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-amber-400" />
                          <span className="text-xs text-gray-400">
                            {project.metrics.errors} errors
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-sky-400" />
                          <span className="text-xs text-gray-400">p99: {project.metrics.p99}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center border border-gray-800 bg-black/30">
                <Brackets />
                <FolderKanban size={32} className="text-gray-600" />
              </div>
              <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
                No Projects Yet
              </h3>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-gray-600">
                Create your first project to start monitoring
              </p>
              <Button
                icon={<Plus size={16} />}
                onClick={() => setShowCreateModal(true)}
                className="border-gray-700"
              >
                Create Project
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => !isCreating && setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md border border-gray-700 bg-black p-8">
              <Brackets />
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl uppercase tracking-[0.2em]">Create Project</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                    Add a new project to {org}
                  </p>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-6">
                  <div className="relative">
                    <label
                      htmlFor="project-name"
                      className="mb-3 block text-xs uppercase tracking-[0.2em] text-gray-400"
                    >
                      Project Name
                    </label>
                    <div className="relative">
                      <input
                        id="project-name"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="My API"
                        className="h-12 w-full border border-gray-700 bg-black px-4 text-sm text-white placeholder:text-gray-600 focus:border-gray-400 focus:outline-none"
                        required
                        autoFocus
                        disabled={isCreating}
                      />
                      <Brackets />
                    </div>
                    <p className="mt-2 text-xs tracking-[0.15em] text-gray-600">
                      {projectName.toLowerCase().replace(/\s+/g, '-') || 'my-api'}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      disabled={isCreating}
                      showBrackets={false}
                      className="border-gray-700 bg-transparent text-gray-400 hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || !projectName.trim()}>
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gray-600">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} in {org}
          </p>
        </div>
      </footer>
    </div>
  );
}
