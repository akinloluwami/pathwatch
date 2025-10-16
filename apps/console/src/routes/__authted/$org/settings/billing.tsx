import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__authted/$org/settings/billing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__authted/$org/settings/billing"!</div>
}
