import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCafeSettings } from '../../hooks/useSettings';
import { SettingsNavigation, type SettingsCategory } from '../../components/admin/settings/SettingsNavigation';
import { CafeProfileForm } from '../../components/admin/settings/CafeProfileForm';
import { BrandingSettings } from '../../components/admin/settings/BrandingSettings';
import { TaxCurrencySettings } from '../../components/admin/settings/TaxCurrencySettings';
import { PrinterSettings } from '../../components/admin/printer/PrinterSettings';
import { GeneralPreferences } from '../../components/admin/settings/GeneralPreferences';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, Clock01Icon } from '@hugeicons/core-free-icons';

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: settings } = useCafeSettings();

  const tabParam = searchParams.get('tab') as SettingsCategory | null;
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(
    tabParam && ['profile', 'branding', 'tax', 'printer', 'preferences'].includes(tabParam)
      ? tabParam
      : 'profile'
  );

  useEffect(() => {
    if (tabParam && ['profile', 'branding', 'tax', 'printer', 'preferences'].includes(tabParam)) {
      setActiveCategory(tabParam);
    }
  }, [tabParam]);

  const handleSelectCategory = (category: SettingsCategory) => {
    setActiveCategory(category);
    setSearchParams({ tab: category });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Settings01Icon} size={22} />
            </div>
            <span>Settings</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage RadhaCafe information, ordering preferences, branding and thermal printer configuration.
          </p>
        </div>

        {settings?.updated_at && (
          <Badge variant="outline" className="self-start sm:self-auto gap-1.5 text-[11px] py-1 px-3 rounded-md border-border/80 text-muted-foreground font-medium">
            <HugeiconsIcon icon={Clock01Icon} size={13} className="text-cinnamon" />
            <span>Last updated: {formatDate(settings.updated_at)}</span>
          </Badge>
        )}
      </div>

      {/* Main Responsive Settings Layout */}
      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Navigation / Category List */}
        <div className="lg:col-span-1 min-w-0 w-full">
          <SettingsNavigation
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* Right Column: Active Settings Section Content */}
        <div className="lg:col-span-3">
          {activeCategory === 'profile' && <CafeProfileForm />}
          {activeCategory === 'branding' && <BrandingSettings />}
          {activeCategory === 'tax' && <TaxCurrencySettings />}
          {activeCategory === 'printer' && <PrinterSettings />}
          {activeCategory === 'preferences' && <GeneralPreferences />}
        </div>
      </div>
    </div>
  );
}
