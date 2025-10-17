import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/settings/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Navigate
      to="/$org/telmentary/$projectId/settings/general"
      params={{ org: 'logbase', projectId: 'logbase' }}
    />
  );
}
