import { useNavigate } from 'react-router-dom';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { ROUTES } from '../../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee01Icon, LinkSquare01Icon, SparklesIcon } from '@hugeicons/core-free-icons';

export function AboutSettings() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-border/60">
        <h3 className="text-lg font-bold font-heading text-foreground">
          About RadhaCafe
        </h3>
        <p className="text-xs text-muted-foreground">
          Application information and public links.
        </p>
      </div>

      {/* Brand Hero Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-secondary/20 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
          <HugeiconsIcon icon={Coffee01Icon} size={28} />
        </div>

        <div className="space-y-1 min-w-0">
          <span className="font-bold text-base font-heading text-foreground">
            RadhaCafe Admin
          </span>
          <p className="text-xs text-muted-foreground">
            Cafe ordering, customer management, reporting, and thermal receipt tools.
          </p>
        </div>
      </div>

      {/* Section: Application Specs */}
      <SettingsSection title="System Information" showSeparator={false}>
        <SettingsRow
          title="Application"
          description="The administration workspace currently in use."
        >
          <span className="text-xs text-foreground font-medium">
            RadhaCafe Admin
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
        <SettingsRow
          title="What's New & Release History"
          description="View recent improvements, bug fixes, and feature updates."
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.CHANGELOG)}
            className="h-8 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
          >
            <HugeiconsIcon icon={SparklesIcon} size={13} className="text-cinnamon" />
            <span>View Changelog</span>
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
