import Brackets from '@/components/ui/brackets';
import { ReactNode } from 'react';

type TelemetryLayoutProps = {
  org: string;
  projectId: string;
  section: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

export function TelemetryLayout({
  org,
  projectId,
  section,
  headerAction,
  children,
}: TelemetryLayoutProps) {
  return (
    <div className="flex-1 h-[calc(100vh-2.5rem)] border border-gray-800 bg-black/40 relative flex flex-col overflow-hidden">
      <Brackets />
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60 flex-shrink-0">
        <div>
          <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">
            Telemetry // {section}
          </p>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-300">
            <span className="font-medium text-white">{projectId}</span>
            <span className="text-gray-600">/</span>
            <span className="uppercase text-xs tracking-[0.3em] text-gray-500">Org {org}</span>
          </div>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );
}
