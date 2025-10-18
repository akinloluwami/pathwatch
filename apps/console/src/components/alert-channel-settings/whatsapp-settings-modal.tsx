import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useState } from 'react';

type WhatsAppSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
};

export function WhatsAppSettingsModal({
  isOpen,
  onClose,
  phoneNumber,
  onPhoneNumberChange,
}: WhatsAppSettingsModalProps) {
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState({ start: '22:00', end: '07:00' });
  const [shareRunbook, setShareRunbook] = useState(false);

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
            <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">
              WhatsApp Settings
            </p>
            <p className="mt-1 text-sm text-gray-300">
              Configure mobile escalation for your on-call team
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
            <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
              Primary number
            </label>
            <input
              value={phoneNumber}
              onChange={(event) => onPhoneNumberChange(event.target.value)}
              placeholder="+14155552671"
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#f45817]"
            />
            <p className="text-[11px] text-gray-500">
              Use E.164 format. This number receives alerts via WhatsApp Business messaging.
            </p>
          </div>

          <PreferenceToggle
            label="Enable quiet hours"
            description="Pause WhatsApp alerts overnight while email and Slack remain active."
            checked={quietHoursEnabled}
            onCheckedChange={setQuietHoursEnabled}
          />

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                  Quiet start (UTC)
                </label>
                <input
                  value={quietHours.start}
                  onChange={(event) =>
                    setQuietHours((prev) => ({ ...prev, start: event.target.value }))
                  }
                  placeholder="22:00"
                  className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#f45817]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                  Quiet end (UTC)
                </label>
                <input
                  value={quietHours.end}
                  onChange={(event) =>
                    setQuietHours((prev) => ({ ...prev, end: event.target.value }))
                  }
                  placeholder="07:00"
                  className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#f45817]"
                />
              </div>
            </div>
          )}

          <PreferenceToggle
            label="Send runbook link"
            description="Append the incident runbook URL in each WhatsApp alert."
            checked={shareRunbook}
            onCheckedChange={setShareRunbook}
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
