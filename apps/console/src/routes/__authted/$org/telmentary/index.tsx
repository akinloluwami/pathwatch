import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/telmentary/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Navigate
      to="/$org/telmentary/$projectId/logs"
      params={{ org: 'logbase', projectId: 'plaything' }}
    />
  );
}
