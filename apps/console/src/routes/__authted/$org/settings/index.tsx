import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/settings/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { org } = Route.useParams();

  return <Navigate to="/$org/settings/general" params={{ org }} />;
}
