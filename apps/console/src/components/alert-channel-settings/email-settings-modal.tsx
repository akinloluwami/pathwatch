import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useState } from 'react';

type EmailSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  addressList: string;
  onAddressListChange: (value: string) => void;
};

export function EmailSettingsModal({
  isOpen,
  onClose,
  addressList,
  onAddressListChange,
}: EmailSettingsModalProps) {
  const [includeDigest, setIncludeDigest] = useState(true);
  const [includeRecovery, setIncludeRecovery] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg border border-gray-800 bg-black shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]">
        <Brackets />

        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60 flex-shrink-0">
          <div>
            <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">Email Settings</p>
            <p className="mt-1 text-sm text-gray-300">
              Manage delivery preferences for email alerts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
              Recipients
            </label>
            <textarea
              value={addressList}
              onChange={(event) => onAddressListChange(event.target.value)}
              placeholder="alerts@acme.io, oncall@acme.io"
              rows={3}
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#f45817]"
            />
            <p className="text-[11px] text-gray-500">
              Separate multiple addresses with commas. These recipients receive alert triggers and
              recoveries.
            </p>
          </div>

          <div className="space-y-3">
            <PreferenceToggle
              label="Send recovery emails"
              description="Notify recipients when an alert returns to a healthy state."
              checked={includeRecovery}
              onCheckedChange={setIncludeRecovery}
            />
            <PreferenceToggle
              label="Include daily digest"
              description="Add this channel to the 09:00 UTC daily incident digest."
              checked={includeDigest}
              onCheckedChange={setIncludeDigest}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-800 px-6 py-4 bg-black/60">
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
