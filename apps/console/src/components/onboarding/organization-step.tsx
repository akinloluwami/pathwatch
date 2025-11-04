import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';

interface OrganizationStepProps {
  organizationName: string;
  setOrganizationName: (name: string) => void;
  isCreating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function OrganizationStep({
  organizationName,
  setOrganizationName,
  isCreating,
  onSubmit,
}: OrganizationStepProps) {
  const slug = organizationName.toLowerCase().replace(/\s+/g, '-') || 'your-org';

  return (
    <>
      {/* Title */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl uppercase tracking-[0.2em] font-mono">Create Your Organization</h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">
          Let's get started by setting up your workspace
        </p>
      </div>

      {/* Organization Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative">
          <label
            htmlFor="org-name"
            className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-mono"
          >
            Organization Name
          </label>
          <div className="relative">
            <input
              id="org-name"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="My Company"
              className="w-full h-12 px-4 bg-black border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600"
              required
              autoFocus
              disabled={isCreating}
            />
            <Brackets />
          </div>
          <p className="mt-2 text-xs text-gray-600 tracking-[0.15em]">pathwatch.co/{slug}</p>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={isCreating || !organizationName.trim()}
            className="min-w-[200px]"
          >
            {isCreating ? 'Creating...' : 'Continue'}
          </Button>
        </div>
      </form>
    </>
  );
}
