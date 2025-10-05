import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { Logs, Bolt } from "lucide-react";

export const Route = createFileRoute("/__authted/$org")({
  component: RouteComponent,
});

function RouteComponent() {
  const routes = [
    { name: "Telemetry", icon: Logs, path: "/$org/telmentary" },
    { name: "Settings", icon: Bolt, path: "/$org/settings" },
  ];

  const { pathname } = useLocation();

  return (
    <div className="p-5 flex space-x-5 h-screen">
      <div className="space-y-2">
        {routes.map((route) => {
          const isActive = pathname.includes(route.path.split("$org/")[1]);
          return (
            <div key={route.name} className="relative">
              <Link
                to={route.path}
                className="flex items-center justify-center h-8 w-8 hover:bg-white/10 border border-gray-800"
              >
                <route.icon size={16} className="text-gray-400" />
              </Link>
              {isActive && (
                <>
                  <span className="absolute -top-[3px] -left-[3px] text-white text-[10px] leading-none pointer-events-none">
                    +
                  </span>
                  <span className="absolute -top-[3px] -right-[3px] text-white text-[10px] leading-none pointer-events-none">
                    +
                  </span>
                  <span className="absolute -bottom-[3px] -left-[3px] text-white text-[10px] leading-none pointer-events-none">
                    +
                  </span>
                  <span className="absolute -bottom-[3px] -right-[3px] text-white text-[10px] leading-none pointer-events-none">
                    +
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="h-full">
        <Outlet />
      </div>
    </div>
  );
}
