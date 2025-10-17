import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/__authted/$org/telmentary/$projectId/settings/data-retention',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/__authted/$org/telmentary/$projectId/settings/data-retention"!
    </div>
  )
}
