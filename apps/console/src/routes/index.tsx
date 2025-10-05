import { APP_NAME } from "@/constants";
import { createFileRoute } from "@tanstack/react-router";
import { SiGithub } from "react-icons/si";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-y-6 items-center">
        <h1 className="text-xl uppercase">{APP_NAME}</h1>
        <button className="flex items-center border border-gray-400 h-8 gap-x-2">
          <span className="bg-white/10 h-full aspect-square flex items-center justify-center px-2">
            <SiGithub />
          </span>
          <span className="uppercase text-xs pr-2">Sign in with GitHub</span>
        </button>
      </div>
    </div>
  );
}
