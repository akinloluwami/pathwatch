import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/settings/alerts')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">
          Alert Configuration
        </h2>
        <p className="mt-2 text-xs text-gray-400">
          Configure default alert settings and notification preferences.
        </p>
      </div>
    </div>
  );
}
