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
        <h1 className="text-4xl">Login to {APP_NAME}</h1>
        <button className="bg-accent text-white rounded-full flex items-center p-2 gap-x-2 transition-shadow duration-200 hover:shadow-[0_0_16px_4px_rgba(244,88,23,0.6)]">
          <SiGithub />
          <span className="uppercase text-lg">Sign in with GitHub</span>
        </button>
      </div>
    </div>
  );
}
