import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useState } from 'react';

type DiscordSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DiscordSettingsModal({ isOpen, onClose }: DiscordSettingsModalProps) {
  const [channelId, setChannelId] = useState('');
  const [mentionRole, setMentionRole] = useState('@incident');
  const [includeEmbeds, setIncludeEmbeds] = useState(true);

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
            <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">Discord Settings</p>
            <p className="mt-1 text-sm text-gray-300">Direct incidents to your Discord guild</p>
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
            <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
              Channel ID
            </label>
            <input
              value={channelId}
              onChange={(event) => setChannelId(event.target.value)}
              placeholder="123456789012345678"
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#f45817]"
            />
            <p className="text-[11px] text-gray-500">
              Paste the numeric channel ID where alerts should post. Enable Developer Mode in
              Discord to copy this value.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
              Mention role
            </label>
            <input
              value={mentionRole}
              onChange={(event) => setMentionRole(event.target.value)}
              placeholder="@incident-response"
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#f45817]"
            />
            <p className="text-[11px] text-gray-500">
              Provide a role mention for escalations. Leave blank to post without mentions.
            </p>
          </div>

          <PreferenceToggle
            label="Include rich embeds"
            description="Send alerts using Discord embeds with metrics and quick links."
            checked={includeEmbeds}
            onCheckedChange={setIncludeEmbeds}
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
