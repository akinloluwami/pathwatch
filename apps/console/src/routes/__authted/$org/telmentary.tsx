import Brackets from "@/components/ui/brackets";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  BetweenHorizonalStart,
  ChevronDown,
  Settings2,
  TriangleAlert,
} from "lucide-react";
import path from "path";

export const Route = createFileRoute("/__authted/$org/telmentary")({
  component: RouteComponent,
});

function RouteComponent() {
  const links = [
    {
      name: "Logs",
      path: "/__authted/$org/telmentary/logs",
      icon: <BetweenHorizonalStart size={16} />,
    },
    {
      name: "Alerts",
      path: "/__authted/$org/telmentary/alerts",
      icon: <TriangleAlert size={16} />,
    },
    {
      name: "Settings",
      path: "/__authted/$org/telmentary/settings",
      icon: <Settings2 size={16} />,
    },
  ];

  return (
    <div className="flex h-full">
      <div className="w-72 h-full border border-gray-800 relative">
        <div className="bg-gray-400/10 py-2 border-b border-gray-800">
          <button className="w-full flex items-center justify-between px-4 py-2">
            <span className="text-sm">Plaything</span>
            <span>
              <ChevronDown size={24} className="inline-block ml-2" />
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-y-5 p-2">
          {links.map((link) => (
            <Link key={link.name} to={link.path}>
              <Button icon={link.icon}>{link.name}</Button>
            </Link>
          ))}
        </div>

        <Brackets />
      </div>
      <Outlet />
    </div>
  );
}
