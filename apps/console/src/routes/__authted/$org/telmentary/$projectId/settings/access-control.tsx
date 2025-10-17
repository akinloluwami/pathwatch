import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/__authted/$org/telmentary/$projectId/settings/access-control',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/__authted/$org/telmentary/$projectId/settings/access-control"!
    </div>
  )
}
