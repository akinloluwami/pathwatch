import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';

interface ProjectStepProps {
  projectName: string;
  setProjectName: (name: string) => void;
  isCreating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProjectStep({
  projectName,
  setProjectName,
  isCreating,
  onSubmit,
}: ProjectStepProps) {
  return (
    <>
      {/* Title */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl uppercase tracking-[0.2em] font-mono">Create Your Project</h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">
          Add your first project to start monitoring
        </p>
      </div>

      {/* Project Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative">
          <label
            htmlFor="project-name"
            className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-mono"
          >
            Project Name
          </label>
          <div className="relative">
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My API"
              className="w-full h-12 px-4 bg-black border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600"
              required
              autoFocus
              disabled={isCreating}
            />
            <Brackets />
          </div>
          <p className="mt-2 text-xs text-gray-600 uppercase tracking-[0.15em]">
            Name the API or service you want to monitor
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={isCreating || !projectName.trim()}
            className="min-w-[200px]"
          >
            {isCreating ? 'Creating...' : 'Continue'}
          </Button>
        </div>
      </form>
    </>
  );
}
