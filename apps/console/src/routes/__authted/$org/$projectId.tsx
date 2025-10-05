import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/__authted/$org/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
