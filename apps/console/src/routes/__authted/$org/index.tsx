import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__authted/$org/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/authted/$org/"!</div>
}
