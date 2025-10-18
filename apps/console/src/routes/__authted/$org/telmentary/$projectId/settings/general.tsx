import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/settings/general')({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();

  const [projectName, setProjectName] = useState('PathWatch Project');
  const [projectSlug, setProjectSlug] = useState(projectId ?? '');

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">
          General Settings
        </h2>
        <p className="mt-2 text-xs text-gray-400">
          Configure how telemetry flows into this project and the defaults applied at ingest time.
        </p>
      </div>

      <div className="grid gap-4">
        <SettingsCard title="Project Identity">
          <form className="space-y-4">
            <Field label="Project Name">
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#f45817]"
                placeholder="Enter project name"
              />
            </Field>
            <Field label="Project Slug" hint="Used in API requests and routing">
              <input
                value={projectSlug}
                onChange={(event) => setProjectSlug(event.target.value)}
                className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#f45817]"
                placeholder="project-slug"
              />
            </Field>
            <div className="flex justify-end">
              <Button className="w-auto px-4">Save Changes</Button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard title="Transfer Project">
          <p className="text-xs text-gray-400">
            Move ownership of this project to another organization. Current API keys and settings
            remain intact until accepted by the receiving org.
          </p>
          <div className="mt-4 flex justify-end">
            <Button intent="ghost" className="w-auto px-4">
              Initiate Transfer
            </Button>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard tone="danger" title="Delete Project">
        <p className="text-xs text-red-300">
          This action permanently removes telemetry data, alert history, and access tokens. The
          operation cannot be undone.
        </p>
        <div className="mt-4 flex justify-end">
          <Button
            showBrackets={false}
            className="w-auto border-red-500 text-red-300 hover:bg-red-500/10"
          >
            Delete Project
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
}

type SettingsCardProps = {
  title: string;
  children: ReactNode;
  tone?: 'default' | 'danger';
};

function SettingsCard({ title, children, tone = 'default' }: SettingsCardProps) {
  const borderClass = tone === 'danger' ? 'border-red-600' : 'border-gray-800';

  return (
    <div className={`relative border ${borderClass} bg-black/30 p-5`}>
      <Brackets />
      <p
        className={`uppercase text-[11px] tracking-[0.3em] ${
          tone === 'danger' ? 'text-red-300' : 'text-gray-500'
        }`}
      >
        {title}
      </p>
      <div className="mt-3 space-y-4 text-xs text-gray-300">{children}</div>
    </div>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">{label}</p>
        {hint ? <p className="text-[11px] text-gray-500/80">{hint}</p> : null}
      </div>
      {children}
    </label>
  );
}
