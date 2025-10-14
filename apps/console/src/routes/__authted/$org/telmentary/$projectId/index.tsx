import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>pppp</div>;
}
