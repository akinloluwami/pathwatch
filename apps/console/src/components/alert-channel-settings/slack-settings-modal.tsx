import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useState } from 'react';

type SlackSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
};

export function SlackSettingsModal({ isOpen, onClose, workspaceName }: SlackSettingsModalProps) {
  const [postThreaded, setPostThreaded] = useState(true);
  const [channel, setChannel] = useState('#on-call');
  const [includeLogs, setIncludeLogs] = useState(false);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[calc(100vh-4rem)] w-full max-w-lg flex-col border border-gray-800 bg-black shadow-2xl">
        <Brackets />

        <div className="flex items-center justify-between border-b border-gray-800 bg-black/60 px-6 py-4">
          <div>
            <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">Slack Settings</p>
            <p className="mt-1 text-sm text-gray-300">
              Configure delivery for {workspaceName ? workspaceName : 'your workspace'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">Channel</label>
            <input
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              placeholder="#incident-response"
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#f45817]"
            />
            <p className="text-[11px] text-gray-500">
              Alerts send as bot messages into this channel. Use private channels by inviting the
              PathWatch app first.
            </p>
          </div>

          <PreferenceToggle
            label="Thread follow ups"
            description="Post resolution updates and new violations as threaded replies."
            checked={postThreaded}
            onCheckedChange={setPostThreaded}
          />

          <PreferenceToggle
            label="Attach log excerpts"
            description="Include the five most recent log lines for the impacted service."
            checked={includeLogs}
            onCheckedChange={setIncludeLogs}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-800 bg-black/60 px-6 py-4">
          <Button intent="ghost" showBrackets={false} className="w-auto px-4" onClick={onClose}>
            Close
          </Button>
          <Button showBrackets={false} className="w-auto px-4">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

type PreferenceToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
};

function PreferenceToggle({ label, description, checked, onCheckedChange }: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-white">{label}</p>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
