import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertCondition = 'error_rate' | 'latency' | 'status_code' | 'request_volume';

type CreateAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alert: AlertFormData) => void;
};

export type AlertFormData = {
  name: string;
  condition: AlertCondition;
  threshold: string;
  severity: AlertSeverity;
  channels: string[];
  // Advanced options
  description?: string;
  windowDuration?: string;
  cooldownPeriod?: string;
  evaluationPeriod?: string;
  autoResolve?: boolean;
  routeFilter?: string;
  statusCodeFilter?: string;
};

const CONDITION_OPTIONS: Array<{ value: AlertCondition; label: string; unit: string }> = [
  { value: 'error_rate', label: 'Error Rate', unit: '%' },
  { value: 'latency', label: 'Latency', unit: 'ms' },
  { value: 'status_code', label: '5xx Status Code', unit: 'count' },
  { value: 'request_volume', label: 'Request Volume', unit: '/min' },
];

const SEVERITY_OPTIONS: Array<{ value: AlertSeverity; label: string }> = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

const CHANNEL_OPTIONS = ['Email', 'Slack', 'PagerDuty', 'Webhook'];

type Tab = 'standard' | 'advanced';

export function CreateAlertModal({ isOpen, onClose, onSubmit }: CreateAlertModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('standard');
  const [formData, setFormData] = useState<AlertFormData>({
    name: '',
    condition: 'error_rate',
    threshold: '',
    severity: 'warning',
    channels: ['Email'],
    // Advanced defaults
    description: '',
    windowDuration: '5',
    cooldownPeriod: '15',
    evaluationPeriod: '1',
    autoResolve: true,
    routeFilter: '',
    statusCodeFilter: '',
  });
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const conditionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConditionOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        conditionDropdownRef.current &&
        !conditionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsConditionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isConditionOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setActiveTab('standard');
    setFormData({
      name: '',
      condition: 'error_rate',
      threshold: '',
      severity: 'warning',
      channels: ['Email'],
      description: '',
      windowDuration: '5',
      cooldownPeriod: '15',
      evaluationPeriod: '1',
      autoResolve: true,
      routeFilter: '',
      statusCodeFilter: '',
    });
  };

  const handleChannelToggle = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const selectedCondition = CONDITION_OPTIONS.find((opt) => opt.value === formData.condition);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl border border-gray-800 bg-black shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]">
        <Brackets />

        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/60 flex-shrink-0">
          <div>
            <p className="uppercase text-[11px] tracking-[0.3em] text-gray-400">Create Alert</p>
            <p className="mt-1 text-sm text-gray-300">Configure a new monitoring alert</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-gray-800 flex flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`flex-1 px-6 py-3 text-[11px] uppercase tracking-[0.3em] transition-colors ${
              activeTab === 'standard'
                ? 'bg-white/10 text-white border-b-2 border-[#f45817]'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 px-6 py-3 text-[11px] uppercase tracking-[0.3em] transition-colors ${
              activeTab === 'advanced'
                ? 'bg-white/10 text-white border-b-2 border-[#f45817]'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            Advanced
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {activeTab === 'standard' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                    Alert Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., High Error Rate API"
                    required
                    className="w-full h-10 border border-gray-800 bg-black/40 px-3 text-sm text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                      Condition
                    </label>
                    <div ref={conditionDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsConditionOpen(!isConditionOpen)}
                        className="relative w-full h-10 border border-gray-800 bg-black/40 px-3 flex items-center justify-between text-sm text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <Brackets />
                        <span>{selectedCondition?.label}</span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${isConditionOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isConditionOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-700 bg-black z-30">
                          <Brackets />
                          {CONDITION_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, condition: option.value });
                                setIsConditionOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                formData.condition === option.value
                                  ? 'bg-white/10 text-white'
                                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                      Threshold {selectedCondition && `(${selectedCondition.unit})`}
                    </label>
                    <input
                      type="text"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                      placeholder={
                        selectedCondition?.value === 'error_rate'
                          ? '> 5'
                          : selectedCondition?.value === 'latency'
                            ? '> 1000'
                            : selectedCondition?.value === 'status_code'
                              ? '> 10'
                              : '> 5000'
                      }
                      required
                      className="w-full h-10 border border-gray-800 bg-black/40 px-3 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                    Severity
                  </label>
                  <div className="flex gap-3">
                    {SEVERITY_OPTIONS.map((option) => {
                      const isSelected = formData.severity === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, severity: option.value })}
                          className={`relative flex-1 h-10 border ${isSelected ? 'border-gray-700 bg-white/10 text-white' : 'border-gray-800 bg-black/20 text-gray-400'} px-3 flex items-center justify-center uppercase tracking-[0.2em] text-[11px] transition-colors hover:bg-white/5`}
                        >
                          {isSelected && <Brackets />}
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                    Notification Channels
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CHANNEL_OPTIONS.map((channel) => {
                      const isSelected = formData.channels.includes(channel);
                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => handleChannelToggle(channel)}
                          className={`relative h-10 border ${isSelected ? 'border-gray-700 bg-white/10 text-white' : 'border-gray-800 bg-black/20 text-gray-400'} px-3 flex items-center justify-center uppercase tracking-[0.2em] text-[11px] transition-colors hover:bg-white/5`}
                        >
                          {isSelected && <Brackets />}
                          {channel}
                        </button>
                      );
                    })}
                  </div>
                  {formData.channels.length === 0 && (
                    <p className="mt-2 text-xs text-red-400">
                      Select at least one notification channel
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add additional context about this alert..."
                    rows={3}
                    className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                      Window Duration (min)
                    </label>
                    <input
                      type="number"
                      value={formData.windowDuration}
                      onChange={(e) => setFormData({ ...formData, windowDuration: e.target.value })}
                      placeholder="5"
                      min="1"
                      className="w-full h-10 border border-gray-800 bg-black/40 px-3 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-gray-600">Time window for evaluation</p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                      Cooldown Period (min)
                    </label>
                    <input
                      type="number"
                      value={formData.cooldownPeriod}
                      onChange={(e) => setFormData({ ...formData, cooldownPeriod: e.target.value })}
                      placeholder="15"
                      min="1"
                      className="w-full h-10 border border-gray-800 bg-black/40 px-3 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-gray-600">Time before re-triggering</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                    Evaluation Period (min)
                  </label>
                  <input
                    type="number"
                    value={formData.evaluationPeriod}
                    onChange={(e) => setFormData({ ...formData, evaluationPeriod: e.target.value })}
                    placeholder="1"
                    min="1"
                    className="w-full h-10 border border-gray-800 bg-black/40 px-3 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-gray-600">How often to check the condition</p>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                    Route Filter (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.routeFilter}
                    onChange={(e) => setFormData({ ...formData, routeFilter: e.target.value })}
                    placeholder="/api/v1/* or /auth/*"
                    className="w-full h-10 border border-gray-800 bg-black/40 px-3 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-gray-600">
                    Apply alert only to matching routes
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                    Status Code Filter (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.statusCodeFilter}
                    onChange={(e) => setFormData({ ...formData, statusCodeFilter: e.target.value })}
                    placeholder="5xx, 4xx, or specific codes (500, 502)"
                    className="w-full h-10 border border-gray-800 bg-black/40 px-3 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-[#f45817] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-gray-600">Filter by HTTP status codes</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, autoResolve: !formData.autoResolve })}
                    className={`relative h-10 w-10 border ${formData.autoResolve ? 'border-gray-700 bg-white/10' : 'border-gray-800 bg-black/20'} flex items-center justify-center transition-colors`}
                  >
                    {formData.autoResolve && (
                      <>
                        <Brackets />
                        <span className="text-white text-sm">✓</span>
                      </>
                    )}
                  </button>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                      Auto-Resolve
                    </label>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      Automatically resolve when condition clears
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-black/60 flex-shrink-0">
            <Button
              onClick={onClose}
              showBrackets={false}
              className="border-gray-700 text-gray-400 hover:bg-white/5"
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={!formData.name || !formData.threshold || formData.channels.length === 0}
              className="h-10 border border-gray-700 bg-white/10 text-white px-4 uppercase text-xs tracking-[0.15em] hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
