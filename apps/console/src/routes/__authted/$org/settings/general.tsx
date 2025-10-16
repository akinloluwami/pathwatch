import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/settings/general')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/__authted/$org/settings/general"!</div>;
}
