import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useState } from 'react';

type WebhookSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onUrlChange: (value: string) => void;
};

export function WebhookSettingsModal({
  isOpen,
  onClose,
  url,
  onUrlChange,
}: WebhookSettingsModalProps) {
  const [signingEnabled, setSigningEnabled] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl border border-gray-800 bg-black shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]">
        <Brackets />

        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60 flex-shrink-0">
          <div>
            <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">Webhook Settings</p>
            <p className="mt-1 text-sm text-gray-300">
              Configure delivery details for webhook alerts
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
              Endpoint URL
            </label>
            <input
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
              placeholder="https://example.com/hooks/pathwatch"
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#f45817]"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-white">Sign requests</p>
              <p className="text-[11px] text-gray-500">
                Attach `PathWatch-Signature` header for replay protection
              </p>
            </div>
            <Switch checked={signingEnabled} onCheckedChange={setSigningEnabled} />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
              Preview Payload
            </label>
            <textarea
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 font-mono outline-none focus:border-[#f45817]"
              rows={6}
              defaultValue={`{"event":"alert.triggered","project":"demo","severity":"critical"}`}
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
