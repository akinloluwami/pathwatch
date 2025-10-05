import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/__authed")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
