import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee01Icon, LinkSquare01Icon } from '@hugeicons/core-free-icons';

export function AboutSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-border/60">
        <h3 className="text-lg font-bold font-heading text-foreground">
          About RadhaCafe
        </h3>
        <p className="text-xs text-muted-foreground">
          System build specifications, application environment, and public links.
        </p>
      </div>

      {/* Brand Hero Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-secondary/20 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
          <HugeiconsIcon icon={Coffee01Icon} size={28} />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base font-heading text-foreground">
              RadhaCafe Suite
            </span>
            <Badge className="bg-cinnamon text-white font-mono text-[10px] font-bold px-2 py-0 h-4">
              v2.0
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Artisanal cafe Point-of-Sale, real-time kitchen billing, and Web Bluetooth thermal printing platform.
          </p>
        </div>
      </div>

      {/* Section: Application Specs */}
      <SettingsSection title="System Information" showSeparator={false}>
        <SettingsRow
          title="Software Release"
          description="Current client bundle version and engine release."
        >
          <span className="text-xs font-mono font-bold text-foreground bg-secondary/40 px-2.5 py-1 rounded-lg border border-border/60">
            v2.0-prod (Build 20260814)
          </span>
        </SettingsRow>

        <SettingsRow
          title="Core Architecture"
          description="Technology foundation powering the cafe register and print engine."
        >
          <span className="text-xs text-muted-foreground font-medium">
            React 18 • TypeScript • Tailwind CSS • Web Bluetooth ESC/POS
          </span>
        </SettingsRow>

        <SettingsRow
          title="Public Customer Portal"
          description="Access the live online menu, reviews, and cafe landing page."
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open('/', '_blank')}
            className="h-8 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
          >
            <HugeiconsIcon icon={LinkSquare01Icon} size={13} className="text-cinnamon" />
            <span>Open Landing Page</span>
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
