import { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from '../../ui/toast';

export function AppearanceSettings() {
  const [density, setDensity] = useState<string>(() => {
    return localStorage.getItem('radhacafe_ui_density') || 'standard';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('radhacafe_reduced_motion') === 'true';
  });

  const handleDensityChange = (val: string | null) => {
    if (!val) return;
    setDensity(val);
    localStorage.setItem('radhacafe_ui_density', val);
    toast.add({
      title: 'Interface Density Updated',
      description: val === 'compact' ? 'Compact POS mode enabled for high-density counter screens.' : 'Standard comfortable spacing restored.',
      type: 'success',
    });
  };

  const handleMotionToggle = (checked: boolean) => {
    setReducedMotion(checked);
    localStorage.setItem('radhacafe_reduced_motion', String(checked));
    toast.add({
      title: 'Motion Preference Updated',
      description: checked ? 'Animations and transitions minimized.' : 'Standard interface transitions enabled.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-border/60">
        <h3 className="text-lg font-bold font-heading text-foreground">
          Appearance & Density
        </h3>
        <p className="text-xs text-muted-foreground">
          Customize workspace layout density and visual accessibility for POS stations.
        </p>
      </div>

      {/* Section 1: Display Density */}
      <SettingsSection title="Display Density">
        <SettingsRow
          title="Admin Layout Density"
          description="Adjust padding and element scale across table rows, action toolbars, and counter cards."
        >
          <Select value={density} onValueChange={handleDensityChange}>
            <SelectTrigger className="h-9 w-full sm:w-56 text-xs rounded-xl border-border/80 bg-background">
              <SelectValue placeholder="Select density" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="standard">Standard (Comfortable)</SelectItem>
              <SelectItem value="compact">Compact (POS Counter View)</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow
          id="reduced-motion"
          title="Reduce Interface Motion"
          description="Disable non-essential slide animations and heavy UI transitions for faster low-power station performance."
        >
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={handleMotionToggle}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Section 2: Brand Theme Overview */}
      <SettingsSection title="Brand Palette" showSeparator={false}>
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-heading text-foreground">
              RadhaCafe Signature Warm Roast
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Active Design System
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The RadhaCafe theme features curated shades of freshly roasted coffee beans, warm cinnamon accents, and rich cream neutrals crafted specifically for artisanal coffee shops.
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-[#2A1810] text-white text-center">
              <span className="block text-[10px] font-bold">Dark Roast</span>
              <span className="text-[9px] font-mono opacity-70">#2A1810</span>
            </div>
            <div className="p-2 rounded-xl bg-[#D97706] text-white text-center">
              <span className="block text-[10px] font-bold">Cinnamon</span>
              <span className="text-[9px] font-mono opacity-80">#D97706</span>
            </div>
            <div className="p-2 rounded-xl bg-[#F5EBE1] text-[#2A1810] border border-border text-center">
              <span className="block text-[10px] font-bold">Latte</span>
              <span className="text-[9px] font-mono opacity-80">#F5EBE1</span>
            </div>
            <div className="p-2 rounded-xl bg-[#FDFBF7] text-[#2A1810] border border-border text-center">
              <span className="block text-[10px] font-bold">Cream</span>
              <span className="text-[9px] font-mono opacity-80">#FDFBF7</span>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
