import { APP_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { SiGithub } from "react-icons/si";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-y-6 items-center">
        {/* <h1 className="text-xl uppercase">{APP_NAME}</h1> */}
        <Button icon={<SiGithub />}>Sign in with GitHub</Button>
      </div>
    </div>
  );
}
