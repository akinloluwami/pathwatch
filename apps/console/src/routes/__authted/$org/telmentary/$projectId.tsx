import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { query } from '@/lib/query-client';
import { appClient } from '@/lib/app-client';

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);

  // Set API key for all telemetry queries
  useEffect(() => {
    async function setupApiKey() {
      try {
        const project = await appClient.projects.get(projectId);
        if (project.data?.api_key) {
          query.setApiKey(project.data.api_key);
          setIsApiKeyReady(true);
        }
      } catch (error) {
        console.error('Failed to fetch project for API key:', error);
        setIsApiKeyReady(true); // Continue anyway to show error state
      }
    }

    setupApiKey();
  }, [projectId]);

  if (!isApiKeyReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-green-400">Loading project...</div>
      </div>
    );
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
