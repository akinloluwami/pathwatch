import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/settings/api-keys')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">API Keys</h2>
        <p className="mt-2 text-xs text-gray-400">
          Manage API keys for programmatic access to this project.
        </p>
      </div>
    </div>
  );
}
