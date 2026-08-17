import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { toast } from '../../ui/toast';
import { useDisplayMode } from '../../../hooks/useDisplayMode';
import { useAppScaleGuard, type InterfaceDensity, type PosStartScreen } from '../../../hooks/useAppScaleGuard';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ComputerIcon,
  SmartPhone01Icon,
  Download04Icon,
  Maximize01Icon,
  Minimize01Icon,
  Shield01Icon,
  CheckmarkCircle02Icon,
  PrinterIcon,
  Store01Icon,
  Layout01Icon,
} from '@hugeicons/core-free-icons';

interface ApplicationSettingsProps {
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ApplicationSettings({ onDirtyChange: _onDirtyChange }: ApplicationSettingsProps) {
  const { isStandalone, isFullscreen, canInstall, isInstalled, installApp, toggleFullscreen } =
    useDisplayMode();

  const { density, setDensity, lockAppScale, setLockAppScale, startScreen, setStartScreen } =
    useAppScaleGuard();

  const handleInstallClick = async () => {
    const installed = await installApp();
    if (installed) {
      toast.add({
        title: 'RadhaCafe Installed',
        description: 'RadhaCafe is now installed. You can launch it from your Desktop or Start Menu.',
        type: 'success',
      });
    }
  };

  const handleToggleFullscreen = async () => {
    await toggleFullscreen();
  };

  const handleDensityChange = (newDensity: InterfaceDensity) => {
    setDensity(newDensity);
    toast.add({
      title: 'Interface Density Updated',
      description:
        newDensity === 'compact'
          ? 'Compact POS mode enabled for high-density counter screens.'
          : newDensity === 'large-touch'
          ? 'Large Touch mode enabled with 48px+ touch targets for tablets & touch POS.'
          : 'Comfortable spacing enabled.',
      type: 'success',
    });
  };

  const handleToggleLockScale = (checked: boolean) => {
    setLockAppScale(checked);
    toast.add({
      title: checked ? 'App Scale Locked' : 'App Scale Unlocked',
      description: checked
        ? 'Accidental keyboard and mouse-wheel zoom shortcuts are now blocked.'
        : 'Browser zoom shortcuts restored for accessibility.',
      type: 'info',
    });
  };

  const handleStartScreenChange = (screen: PosStartScreen) => {
    setStartScreen(screen);
    toast.add({
      title: 'Startup Screen Saved',
      description:
        screen === 'new-order'
          ? 'Installed RadhaCafe POS will open directly to New Order.'
          : 'Installed RadhaCafe POS will open to Dashboard overview.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-border/60">
        <h3 className="text-lg font-bold font-heading text-foreground">
          Application & POS Mode
        </h3>
        <p className="text-xs text-muted-foreground">
          Manage standalone PWA installation, counter interface density, accidental zoom protection, and startup preferences.
        </p>
      </div>

      {/* 1. Installation & Display Mode Card */}
      <SettingsSection title="Application Mode & Installation">
        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-secondary/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`p-2.5 rounded-xl shrink-0 border ${
                  isStandalone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-cinnamon/10 border-cinnamon/30 text-cinnamon'
                }`}
              >
                <HugeiconsIcon
                  icon={isStandalone ? ComputerIcon : SmartPhone01Icon}
                  size={22}
                />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold font-heading text-foreground">
                    {isStandalone
                      ? 'Installed Standalone POS App'
                      : isInstalled
                      ? 'RadhaCafe App Installed'
                      : 'Running in Web Browser Tab'}
                  </h4>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isStandalone
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isStandalone ? 'App Window' : 'Browser Mode'}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isStandalone
                    ? 'RadhaCafe is running in its dedicated full-window POS environment without browser address bars, bookmarks, or tabs.'
                    : 'For the best counter experience, install RadhaCafe on this computer to launch as a standalone application directly from your taskbar or start menu.'}
                </p>
              </div>
            </div>

            {/* Actions: Install or Fullscreen */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
              {canInstall && !isStandalone && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleInstallClick}
                  className="bg-cinnamon hover:bg-cinnamon/90 text-white text-xs font-bold rounded-xl h-9 px-3.5 shadow-2xs gap-1.5 cursor-pointer"
                >
                  <HugeiconsIcon icon={Download04Icon} size={15} />
                  <span>Install RadhaCafe POS</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleFullscreen}
                className="text-xs font-semibold rounded-xl h-9 px-3 border-border/80 bg-card hover:bg-secondary text-foreground gap-1.5 cursor-pointer"
              >
                <HugeiconsIcon icon={isFullscreen ? Minimize01Icon : Maximize01Icon} size={14} />
                <span>{isFullscreen ? 'Exit Focus Mode' : 'Enter Focus Mode'}</span>
              </Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* 2. Interface Density & Sizing */}
      <SettingsSection title="Interface Density">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Choose how compactly order items, product cards, and table rows are displayed on your counter workstation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Compact */}
            <button
              type="button"
              onClick={() => handleDensityChange('compact')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                density === 'compact'
                  ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                  : 'bg-card border-border/80 text-foreground hover:bg-secondary/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Compact</span>
                <span className="text-[10px] font-mono opacity-80">Rush Hours</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Dense padding for maximum items on screen. Ideal for fast order processing.
              </p>
            </button>

            {/* Comfortable (Default) */}
            <button
              type="button"
              onClick={() => handleDensityChange('comfortable')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                density === 'comfortable'
                  ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                  : 'bg-card border-border/80 text-foreground hover:bg-secondary/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Comfortable</span>
                <Badge className="bg-cinnamon/20 text-cinnamon font-bold text-[9px] px-1.5 py-0 h-4 rounded">
                  Default
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Balanced spacing with optimal legibility for standard desktop workstations.
              </p>
            </button>

            {/* Large Touch */}
            <button
              type="button"
              onClick={() => handleDensityChange('large-touch')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                density === 'large-touch'
                  ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                  : 'bg-card border-border/80 text-foreground hover:bg-secondary/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Large Touch</span>
                <span className="text-[10px] font-mono opacity-80">Tablets</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Generous 48px+ touch targets and enlarged action buttons for touchscreens.
              </p>
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* 3. Accidental Zoom Protection */}
      <SettingsSection title="Scale Protection & Accessibility">
        <SettingsRow
          id="lock-app-scale"
          title="Lock Interface Scale"
          description="Prevents accidental keyboard (Ctrl +/-/0) and mouse-wheel zoom scaling while using the counter POS. Turn off if you require browser zoom for accessibility."
        >
          <Switch
            id="lock-app-scale"
            checked={lockAppScale}
            onCheckedChange={handleToggleLockScale}
          />
        </SettingsRow>
      </SettingsSection>

      {/* 4. Startup Route Preference */}
      <SettingsSection title="POS Startup Route">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Select which screen opens automatically when RadhaCafe launches.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleStartScreenChange('new-order')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                startScreen === 'new-order'
                  ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                  : 'bg-card border-border/80 text-foreground hover:bg-secondary/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <HugeiconsIcon icon={Store01Icon} size={15} />
                  <span>New Order POS (Direct Counter)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Opens directly to the counter product grid for instant order entry.
                </p>
              </div>
              {startScreen === 'new-order' && (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-cinnamon shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleStartScreenChange('dashboard')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                startScreen === 'dashboard'
                  ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                  : 'bg-card border-border/80 text-foreground hover:bg-secondary/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <HugeiconsIcon icon={Layout01Icon} size={15} />
                  <span>Admin Dashboard (Overview)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Opens to sales charts, top items, and daily financial summary.
                </p>
              </div>
              {startScreen === 'dashboard' && (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-cinnamon shrink-0" />
              )}
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* 5. Offline POS Readiness & Runtime Summary */}
      <SettingsSection title="Offline Readiness & Hardware Runtime" showSeparator={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={Shield01Icon} size={14} className="text-emerald-600" />
                <span>Offline Continuity</span>
              </span>
              <Badge className="bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0 h-4 rounded">
                Active
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Order catalog, tax rules, and local queues are cached locally in IndexedDB for seamless power/internet outages.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={PrinterIcon} size={14} className="text-cinnamon" />
                <span>Printer Session Runtime</span>
              </span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold border-cinnamon/30 text-cinnamon">
                Persistent
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Bluetooth thermal printer connects through granted browser origins and automatically restores on startup.
            </p>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
