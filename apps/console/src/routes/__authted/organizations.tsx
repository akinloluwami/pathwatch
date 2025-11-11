import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession, authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { Building2, ChevronRight, Plus } from 'lucide-react';
import { APP_NAME } from '@/constants';

export const Route = createFileRoute('/__authted/organizations')({
  component: RouteComponent,
});

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

function RouteComponent() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!session?.user) return;

      setIsLoading(true);
      try {
        const { data } = await authClient.organization.list();
        if (data) {
          setOrganizations(data as Organization[]);
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [session]);

  const handleSelectOrganization = (slug: string) => {
    navigate({ to: '/$org', params: { org: slug } });
  };

  const handleCreateOrganization = () => {
    navigate({ to: '/onboarding' });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: '/' });
  };

  if (isLoading && !organizations.length) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg uppercase tracking-[0.2em]">{APP_NAME}</h1>
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
        <div className="mx-auto max-w-4xl">
          {/* Title Section */}
          <div className="mb-8 space-y-3">
            <h2 className="text-2xl uppercase tracking-[0.2em]">Select Organization</h2>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Choose an organization to continue or create a new one
            </p>
          </div>

          {/* Organizations Grid */}
          {organizations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrganization(org.slug)}
                  className="group relative flex flex-col gap-4 border border-gray-800 bg-black/30 p-6 text-left transition-all hover:border-gray-600 hover:bg-white/5"
                >
                  <Brackets />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center border border-gray-700 bg-black/40">
                        <Building2 size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{org.name}</h3>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                          /{org.slug}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-gray-400"
                    />
                  </div>
                </button>
              ))}

              {/* Create New Organization Card */}
              <button
                onClick={handleCreateOrganization}
                className="group relative flex flex-col items-center justify-center gap-3 border border-dashed border-gray-700 bg-black/20 p-6 transition-all hover:border-gray-500 hover:bg-white/5"
              >
                <Brackets />
                <div className="flex h-10 w-10 items-center justify-center border border-gray-700 bg-black/40 transition-colors group-hover:border-gray-500">
                  <Plus size={20} className="text-gray-500 group-hover:text-gray-300" />
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500 group-hover:text-gray-400">
                  New Organization
                </p>
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center border border-gray-800 bg-black/30">
                <Brackets />
                <Building2 size={32} className="text-gray-600" />
              </div>
              <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
                No Organizations Yet
              </h3>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-gray-600">
                Create your first organization to get started
              </p>
              <Button
                icon={<Plus size={16} />}
                onClick={handleCreateOrganization}
                className="border-gray-700"
              >
                Create Organization
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gray-600">
            {session?.user?.email}
          </p>
        </div>
      </footer>
    </div>
  );
}
