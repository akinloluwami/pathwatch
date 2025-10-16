import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/settings/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/$org/settings/general" params={{ org: 'logbase' }} />;
}
