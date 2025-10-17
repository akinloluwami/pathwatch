import { TelemetryLayout } from '@/components/layouts/telemetry-layout';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org, projectId } = Route.useParams();

  return (
    <TelemetryLayout org={org} projectId={projectId} section="Settings">
      <div className="px-6 py-5">
        <Outlet />
      </div>
    </TelemetryLayout>
  );
}
