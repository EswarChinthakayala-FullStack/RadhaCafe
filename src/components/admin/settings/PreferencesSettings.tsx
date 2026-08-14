import { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { VolumeHighIcon } from '@hugeicons/core-free-icons';

export function PreferencesSettings() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('radhacafe_sound_notifications') !== 'false';
  });

  const [analyticsRange, setAnalyticsRange] = useState<string>(() => {
    return localStorage.getItem('radhacafe_analytics_range') || '7d';
  });

  const [menuLayout, setMenuLayout] = useState<string>(() => {
    return localStorage.getItem('radhacafe_menu_layout') || 'grid';
  });

  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem('radhacafe_sound_notifications', String(checked));
    toast.add({
      title: 'Audio Alerts Updated',
      description: checked ? 'Sound notifications enabled for incoming orders.' : 'Audio notifications muted.',
      type: 'success',
    });
  };

  const handlePlayTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);

      toast.add({
        title: 'Chime Played',
        description: 'Audio chime signal sounded through active output device.',
        type: 'info',
      });
    } catch {
      toast.add({
        title: 'Audio Device Blocked',
        description: 'Please interact with the page or check speaker settings.',
        type: 'error',
      });
    }
  };

  const handleAnalyticsRangeChange = (val: string | null) => {
    if (!val) return;
    setAnalyticsRange(val);
    localStorage.setItem('radhacafe_analytics_range', val);
    toast.add({
      title: 'Analytics Default Saved',
      description: 'Analytics dashboards will default to this date window.',
      type: 'success',
    });
  };

  const handleMenuLayoutChange = (val: string | null) => {
    if (!val) return;
    setMenuLayout(val);
    localStorage.setItem('radhacafe_menu_layout', val);
    toast.add({
      title: 'Menu View Preference Saved',
      description: 'POS item selector will default to your chosen layout.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-border/60">
        <h3 className="text-lg font-bold font-heading text-foreground">
          System Preferences
        </h3>
        <p className="text-xs text-muted-foreground">
          Configure audio alerts, analytics defaults, and counter interaction presets.
        </p>
      </div>

      {/* Section 1: Sound & Alerts */}
      <SettingsSection title="Audio Alerts & Chimes">
        <SettingsRow
          id="sound-alert"
          title="Incoming Order Chime"
          description="Play a clear two-tone audio alert when a new POS or online customer order is recorded."
        >
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handlePlayTestChime}
              className="h-8 px-2.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1 shadow-2xs"
            >
              <HugeiconsIcon icon={VolumeHighIcon} size={12} className="text-cinnamon" />
              <span>Test Chime</span>
            </Button>

            <Switch
              id="sound-alert"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Section 2: Dashboard & Register Presets */}
      <SettingsSection title="Dashboard Presets" showSeparator={false}>
        <SettingsRow
          title="Default Analytics Window"
          description="Initial time window loaded when opening the sales analytics and revenue dashboard."
        >
          <Select value={analyticsRange} onValueChange={handleAnalyticsRangeChange}>
            <SelectTrigger className="h-9 w-full sm:w-56 text-xs rounded-xl border-border/80 bg-background">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="today">Today (Realtime)</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="month">This Calendar Month</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow
          title="Menu Ordering View"
          description="Default visual layout when opening the New Order product picker."
        >
          <Select value={menuLayout} onValueChange={handleMenuLayoutChange}>
            <SelectTrigger className="h-9 w-full sm:w-56 text-xs rounded-xl border-border/80 bg-background">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="grid">Visual Product Cards (Grid)</SelectItem>
              <SelectItem value="list">High-Density Rows (List)</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
