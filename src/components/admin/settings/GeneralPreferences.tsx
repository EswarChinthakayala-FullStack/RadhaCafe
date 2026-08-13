import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, Notification01Icon, PrinterIcon } from '@hugeicons/core-free-icons';

export function GeneralPreferences() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('radhacafe_sound_notifications') !== 'false';
  });

  const [autoPrintOrder, setAutoPrintOrder] = useState<boolean>(() => {
    return localStorage.getItem('radhacafe_autoprint_completion') === 'true';
  });

  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem('radhacafe_sound_notifications', String(checked));
    toast.add({
      title: 'Sound Notification Preference',
      description: checked ? 'Audio notifications enabled for incoming orders.' : 'Audio notifications muted.',
      type: 'success',
    });
  };

  const handleAutoPrintToggle = (checked: boolean) => {
    setAutoPrintOrder(checked);
    localStorage.setItem('radhacafe_autoprint_completion', String(checked));
    toast.add({
      title: 'Auto-Print Preference',
      description: checked
        ? 'Thermal receipts will print automatically upon completing orders.'
        : 'Auto-print disabled.',
      type: 'success',
    });
  };

  return (
    <Card className="border-border/80 bg-card shadow-xs rounded-md w-full">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={Settings01Icon} size={20} />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              General System Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Configure counter notifications and operational order automation preferences.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6 space-y-5 text-xs">
        {/* Sound Notifications Toggle */}
        <div className="flex items-center justify-between p-4 rounded-md border border-border/60 bg-secondary/20">
          <div className="flex items-start gap-3 pr-4">
            <div className="p-2 rounded-lg bg-background text-cinnamon shrink-0 mt-0.5 border border-border/50">
              <HugeiconsIcon icon={Notification01Icon} size={18} />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="sound-notif" className="font-bold text-foreground block">
                Incoming Order Audio Notifications
              </Label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Play an audible alert chime when a new online or POS order is received.
              </p>
            </div>
          </div>
          <Switch id="sound-notif" checked={soundEnabled} onCheckedChange={handleSoundToggle} />
        </div>

        {/* Auto Print Toggle */}
        <div className="flex items-center justify-between p-4 rounded-md border border-border/60 bg-secondary/20">
          <div className="flex items-start gap-3 pr-4">
            <div className="p-2 rounded-lg bg-background text-cinnamon shrink-0 mt-0.5 border border-border/50">
              <HugeiconsIcon icon={PrinterIcon} size={18} />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="auto-print-order" className="font-bold text-foreground block">
                Auto-Print Receipt on Order Creation
              </Label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automatically generate and print thermal receipts immediately upon placing POS orders for 1-click rapid crowd checkout.
              </p>
            </div>
          </div>
          <Switch id="auto-print-order" checked={autoPrintOrder} onCheckedChange={handleAutoPrintToggle} />
        </div>
      </CardContent>
    </Card>
  );
}
