import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/telmentary/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org } = Route.useParams();

  return (
    <Navigate to="/$org/telmentary/$projectId/logs" params={{ org, projectId: 'plaything' }} />
  );
}
