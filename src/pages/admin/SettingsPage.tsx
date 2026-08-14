import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useBluetoothPrinter } from '../../hooks/useBluetoothPrinter';
import { useReceiptTemplates } from '../../hooks/useReceiptTemplates';
import {
  SettingsSidebar,
  SETTINGS_CATEGORIES,
  type SettingsSectionKey,
} from '../../components/admin/settings/SettingsSidebar';
import { SettingsMobileTabs } from '../../components/admin/settings/SettingsMobileTabs';
import { GeneralSettings } from '../../components/admin/settings/GeneralSettings';
import { CafeProfileSettings } from '../../components/admin/settings/CafeProfileSettings';
import { OrderPaymentSettings } from '../../components/admin/settings/OrderPaymentSettings';
import { PrinterSettingsSummary } from '../../components/admin/settings/PrinterSettingsSummary';
import { ReceiptSettingsSummary } from '../../components/admin/settings/ReceiptSettingsSummary';
import { AppearanceSettings } from '../../components/admin/settings/AppearanceSettings';
import { PreferencesSettings } from '../../components/admin/settings/PreferencesSettings';
import { AccountSecuritySettings } from '../../components/admin/settings/AccountSecuritySettings';
import { AboutSettings } from '../../components/admin/settings/AboutSettings';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

const VALID_SECTIONS: SettingsSectionKey[] = [
  'general',
  'profile',
  'orders',
  'printer',
  'receipts',
  'appearance',
  'preferences',
  'account',
  'about',
];

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { isConnected: printerConnected } = useBluetoothPrinter();
  const { data: dbTemplates } = useReceiptTemplates();

  // Find active template name for sidebar status pill
  const activeTemplateName = useMemo(() => {
    return dbTemplates?.find((t) => t.is_active)?.name || 'Classic';
  }, [dbTemplates]);

  // Read section param from URL (?section=profile or legacy ?tab=...)
  const rawSection = (searchParams.get('section') || searchParams.get('tab')) as SettingsSectionKey | null;
  const activeSection: SettingsSectionKey = useMemo(() => {
    if (rawSection && VALID_SECTIONS.includes(rawSection)) {
      return rawSection;
    }
    return 'general';
  }, [rawSection]);

  // Dirty tracking for active category
  const [isCurrentCategoryDirty, setIsCurrentCategoryDirty] = useState<boolean>(false);
  const [pendingTargetSection, setPendingTargetSection] = useState<SettingsSectionKey | null>(null);
  const [isPendingClose, setIsPendingClose] = useState<boolean>(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState<boolean>(false);

  // Close Settings safely
  const handleClose = useCallback(() => {
    if (isCurrentCategoryDirty) {
      setIsPendingClose(true);
      setShowDiscardDialog(true);
      return;
    }

    // Navigate back to previous route if from admin, otherwise fallback to dashboard
    if (location.key !== 'default' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTES.ADMIN.DASHBOARD);
    }
  }, [isCurrentCategoryDirty, location.key, navigate]);

  // Handle section switching with unsaved changes guard
  const handleSelectSection = (key: SettingsSectionKey) => {
    if (key === activeSection) {
      return;
    }

    if (isCurrentCategoryDirty) {
      setPendingTargetSection(key);
      setShowDiscardDialog(true);
      return;
    }

    setIsCurrentCategoryDirty(false);
    setSearchParams({ section: key }, { replace: true });
  };

  // Confirm discarding changes
  const handleConfirmDiscard = () => {
    setIsCurrentCategoryDirty(false);
    setShowDiscardDialog(false);

    if (isPendingClose) {
      setIsPendingClose(false);
      if (location.key !== 'default' && window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(ROUTES.ADMIN.DASHBOARD);
      }
      return;
    }

    if (pendingTargetSection) {
      setSearchParams({ section: pendingTargetSection }, { replace: true });
      setPendingTargetSection(null);
    }
  };

  // Desktop Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDiscardDialog) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, showDiscardDialog]);

  // Find active category label for headers
  const currentCategoryDef = SETTINGS_CATEGORIES.find((c) => c.key === activeSection) || SETTINGS_CATEGORIES[0];

  return (
    <div className="w-full h-[calc(100svh-4rem)] md:h-[calc(100svh-4.5rem)] flex items-center justify-center p-0 sm:p-3 md:p-4 overflow-hidden">
      {/* Centered Large Settings Dialog Surface (Desktop & Tablet) */}
      <div className="w-full max-w-5xl h-full max-h-full md:max-h-[820px] bg-card border-0 sm:border border-border/80 rounded-none sm:rounded-3xl shadow-xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-[0.99] duration-150">
        
        {/* Desktop Top Close Floating Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 hidden md:flex h-8.5 w-8.5 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border/60 shadow-2xs"
          aria-label="Close Settings"
          title="Close Settings (Esc)"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>

        {/* 1. DESKTOP & TABLET TWO-COLUMN WORKSPACE (>= 768px) */}
        <div className="hidden md:grid md:grid-cols-12 h-full w-full min-w-0 overflow-hidden">
          {/* Left Column (Sidebar ~28%): Category Navigation */}
          <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
            <SettingsSidebar
              activeKey={activeSection}
              onSelectKey={handleSelectSection}
              printerConnected={printerConnected}
              activeTemplateName={activeTemplateName}
            />
          </div>

          {/* Right Column (Content ~72%): Active Category Settings Content */}
          <div className="md:col-span-8 lg:col-span-9 h-full overflow-y-auto p-6 lg:p-8 bg-card flex flex-col justify-between">
            <div className="space-y-6 w-full max-w-3xl min-w-0 pb-8">
              {activeSection === 'general' && (
                <GeneralSettings onDirtyChange={setIsCurrentCategoryDirty} />
              )}
              {activeSection === 'profile' && (
                <CafeProfileSettings onDirtyChange={setIsCurrentCategoryDirty} />
              )}
              {activeSection === 'orders' && (
                <OrderPaymentSettings onDirtyChange={setIsCurrentCategoryDirty} />
              )}
              {activeSection === 'printer' && <PrinterSettingsSummary />}
              {activeSection === 'receipts' && <ReceiptSettingsSummary />}
              {activeSection === 'appearance' && <AppearanceSettings />}
              {activeSection === 'preferences' && <PreferencesSettings />}
              {activeSection === 'account' && <AccountSecuritySettings />}
              {activeSection === 'about' && <AboutSettings />}
            </div>
          </div>
        </div>

        {/* 2. MOBILE SCROLLABLE TABS LAYOUT (< 768px) */}
        <div className="md:hidden flex flex-col h-full w-full bg-card overflow-hidden">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-card shrink-0">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground">
                Settings
              </h2>
              <p className="text-[11px] text-muted-foreground">
                RadhaCafe Admin Center
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8.5 w-8.5 p-0 rounded-full hover:bg-secondary text-muted-foreground"
              aria-label="Close Settings"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={17} />
            </Button>
          </div>

          {/* Horizontal Scroll Tabs with Slider Buttons */}
          <div className="shrink-0">
            <SettingsMobileTabs
              activeKey={activeSection}
              onSelectKey={handleSelectSection}
              printerConnected={printerConnected}
            />
          </div>

          {/* Scrollable Content for Selected Category */}
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            {activeSection === 'general' && (
              <GeneralSettings onDirtyChange={setIsCurrentCategoryDirty} />
            )}
            {activeSection === 'profile' && (
              <CafeProfileSettings onDirtyChange={setIsCurrentCategoryDirty} />
            )}
            {activeSection === 'orders' && (
              <OrderPaymentSettings onDirtyChange={setIsCurrentCategoryDirty} />
            )}
            {activeSection === 'printer' && <PrinterSettingsSummary />}
            {activeSection === 'receipts' && <ReceiptSettingsSummary />}
            {activeSection === 'appearance' && <AppearanceSettings />}
            {activeSection === 'preferences' && <PreferencesSettings />}
            {activeSection === 'account' && <AccountSecuritySettings />}
            {activeSection === 'about' && <AboutSettings />}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Alert Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-foreground">
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              You have unsaved changes in <strong>{currentCategoryDef.label}</strong>. Leaving this section will discard your modifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDiscardDialog(false);
                setPendingTargetSection(null);
                setIsPendingClose(false);
              }}
              className="text-xs rounded-lg h-9"
            >
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscard}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg h-9"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
