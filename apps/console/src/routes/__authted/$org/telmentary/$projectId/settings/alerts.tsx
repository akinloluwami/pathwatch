import { WebhookSettingsModal } from '@/components/alert-channel-settings/webhook-settings-modal';
import { EmailSettingsModal } from '@/components/alert-channel-settings/email-settings-modal';
import { SlackSettingsModal } from '@/components/alert-channel-settings/slack-settings-modal';
import { DiscordSettingsModal } from '@/components/alert-channel-settings/discord-settings-modal';
import { WhatsAppSettingsModal } from '@/components/alert-channel-settings/whatsapp-settings-modal';
import Brackets from '@/components/ui/brackets';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { createFileRoute } from '@tanstack/react-router';
import { Settings } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { TbWebhook } from 'react-icons/tb';
import { SiDiscord, SiGmail, SiSlack, SiWhatsapp } from 'react-icons/si';

const CHANNELS = [
  {
    id: 'webhook',
    label: 'Generic Webhook',
    description: 'Send JSON payloads to an HTTP endpoint whenever an alert changes status.',
    placeholder: 'https://example.com/hooks/pathwatch',
    icon: <TbWebhook size={18} />,
    accentClass: 'text-emerald-300',
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Deliver alert summaries and recovery notices via email.',
    placeholder: 'alerts@acme.io',
    icon: <SiGmail size={16} />,
    accentClass: 'text-amber-300',
  },
  {
    id: 'slack',
    label: 'Slack',
    description: 'Connect your Slack workspace to stream alert events into a chosen channel.',
    placeholder: 'workspace connected',
    icon: <SiSlack size={16} />,
    accentClass: 'text-sky-300',
  },
  {
    id: 'discord',
    label: 'Discord',
    description: 'Authorize a Discord webhook to send alerts into your incident channel.',
    placeholder: 'server connected',
    icon: <SiDiscord size={16} />,
    accentClass: 'text-indigo-300',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Deliver high-severity alerts to on-call responders via WhatsApp.',
    placeholder: '+1 555 010 1234',
    icon: <SiWhatsapp size={16} />,
    accentClass: 'text-green-400',
  },
] as const;

type ChannelId = (typeof CHANNELS)[number]['id'];

type ChannelState = {
  enabled: boolean;
  target: string;
};

export const Route = createFileRoute('/__authted/$org/telmentary/$projectId/settings/alerts')({
  component: RouteComponent,
});

function RouteComponent() {
  const initialState = useMemo(() => {
    return CHANNELS.reduce<Record<ChannelId, ChannelState>>(
      (acc, channel) => {
        acc[channel.id] = {
          enabled: channel.id === 'email',
          target: channel.placeholder,
        };
        return acc;
      },
      {} as Record<ChannelId, ChannelState>
    );
  }, []);

  const [channelSettings, setChannelSettings] = useState(initialState);
  const [activeModal, setActiveModal] = useState<ChannelId | null>(null);

  const handleToggle = (id: ChannelId, enabled: boolean) => {
    setChannelSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled },
    }));
  };

  const handleTargetChange = (id: ChannelId, value: string) => {
    setChannelSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], target: value },
    }));
  };

  const handleOpenSettings = (id: ChannelId) => {
    setActiveModal(id);
  };

  const handleCloseSettings = () => {
    setActiveModal(null);
  };

  const activeChannels = CHANNELS.filter((channel) => channelSettings[channel.id].enabled).length;

  return (
    <div className="space-y-7">
      <header>
        <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">
          Alert Configuration
        </h2>
        <p className="mt-2 text-xs text-gray-400">
          Manage which notification targets are used by default when creating new alerts.
        </p>
      </header>

      <SettingsCard title="Connected Channels">
        <p className="text-xs text-gray-400">
          {activeChannels} of {CHANNELS.length} channels active. These defaults apply to new alert
          definitions; existing alerts keep their current settings.
        </p>
      </SettingsCard>

      <section className="grid gap-4 md:grid-cols-2">
        {CHANNELS.map((channel) => {
          const state = channelSettings[channel.id];
          return (
            <ChannelCard
              key={channel.id}
              channel={channel}
              state={state}
              onToggle={(value) => handleToggle(channel.id, value)}
              onTargetChange={(value) => handleTargetChange(channel.id, value)}
              onOpenSettings={() => handleOpenSettings(channel.id)}
            />
          );
        })}
      </section>

      <WebhookSettingsModal
        isOpen={activeModal === 'webhook'}
        onClose={handleCloseSettings}
        url={channelSettings.webhook.target}
        onUrlChange={(value: string) => handleTargetChange('webhook', value)}
      />
      <EmailSettingsModal
        isOpen={activeModal === 'email'}
        onClose={handleCloseSettings}
        addressList={channelSettings.email.target}
        onAddressListChange={(value: string) => handleTargetChange('email', value)}
      />
      <SlackSettingsModal isOpen={activeModal === 'slack'} onClose={handleCloseSettings} />
      <DiscordSettingsModal isOpen={activeModal === 'discord'} onClose={handleCloseSettings} />
      <WhatsAppSettingsModal
        isOpen={activeModal === 'whatsapp'}
        onClose={handleCloseSettings}
        phoneNumber={channelSettings.whatsapp.target}
        onPhoneNumberChange={(value: string) => handleTargetChange('whatsapp', value)}
      />
    </div>
  );
}

type ChannelDefinition = (typeof CHANNELS)[number];

type ChannelCardProps = {
  channel: ChannelDefinition;
  state: ChannelState;
  onToggle: (enabled: boolean) => void;
  onTargetChange: (value: string) => void;
  onOpenSettings: () => void;
};

function ChannelCard({
  channel,
  state,
  onToggle,
  onTargetChange,
  onOpenSettings,
}: ChannelCardProps) {
  const isConnectFlow = channel.id === 'slack' || channel.id === 'discord';
  const settingsTrigger = (
    <Button
      icon={<Settings size={14} />}
      iconOnly
      size="sm"
      ariaLabel={`${channel.label} settings`}
      intent="ghost"
      showBrackets={false}
      className="border-gray-700 text-gray-400 hover:text-white"
      onClick={onOpenSettings}
    >
      {null}
    </Button>
  );

  return (
    <div className="relative border border-gray-800 bg-black/30 p-5">
      <Brackets />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-gray-700 ${channel.accentClass}`}
          >
            {channel.icon}
          </span>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-white">
              {channel.label}
            </p>
            <p className="mt-1 text-[11px] text-gray-500 max-w-xs">{channel.description}</p>
          </div>
        </div>
        <Switch checked={state.enabled} onCheckedChange={onToggle} />
      </div>

      {isConnectFlow ? (
        <div className="mt-4 flex items-center justify-between gap-2">
          {settingsTrigger}
          <Button
            size="sm"
            intent={state.enabled ? 'ghost' : 'primary'}
            showBrackets={false}
            className="w-auto"
            onClick={() => onToggle(!state.enabled)}
          >
            {state.enabled ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500">
              Default Target
            </label>
            <input
              value={state.target}
              onChange={(event) => onTargetChange(event.target.value)}
              className="w-full border border-gray-800 bg-black/40 px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#f45817]"
              placeholder={channel.placeholder}
              disabled={!state.enabled}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            {settingsTrigger}
            <div className="flex gap-2">
              <Button
                intent="ghost"
                size="sm"
                showBrackets={false}
                className="w-auto"
                disabled={!state.enabled}
              >
                Send Test
              </Button>
              <Button size="sm" showBrackets={false} className="w-auto" disabled={!state.enabled}>
                Apply to Alerts
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type SettingsCardProps = {
  title: string;
  children: ReactNode;
};

function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <div className="relative border border-gray-800 bg-black/30 p-5">
      <Brackets />
      <p className="uppercase text-[11px] tracking-[0.3em] text-gray-500">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
