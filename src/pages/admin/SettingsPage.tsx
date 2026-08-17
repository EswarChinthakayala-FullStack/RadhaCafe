import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { usePrinterStore } from '../../store/printerStore';
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
import { ApplicationSettings } from '../../components/admin/settings/ApplicationSettings';
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

const VALID_SECTIONS = SETTINGS_CATEGORIES.map((category) => category.key);

type PendingNavigation =
  | { type: 'close' }
  | { type: 'section'; section: SettingsSectionKey }
  | null;

interface SettingsLocationState {
  from?: string;
}

function isSettingsSection(value: string | null): value is SettingsSectionKey {
  return value !== null && VALID_SECTIONS.includes(value as SettingsSectionKey);
}

interface SettingsContentProps {
  section: SettingsSectionKey;
  onDirtyChange: (isDirty: boolean) => void;
}

function SettingsContent({ section, onDirtyChange }: SettingsContentProps) {
  if (section === 'general') return <GeneralSettings onDirtyChange={onDirtyChange} />;
  if (section === 'profile') return <CafeProfileSettings onDirtyChange={onDirtyChange} />;
  if (section === 'orders') return <OrderPaymentSettings onDirtyChange={onDirtyChange} />;
  if (section === 'printer') return <PrinterSettingsSummary />;
  if (section === 'receipts') return <ReceiptSettingsSummary />;
  if (section === 'application') return <ApplicationSettings onDirtyChange={onDirtyChange} />;
  if (section === 'account') return <AccountSecuritySettings />;
  return <AboutSettings />;
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const printerConnected = usePrinterStore((state) => state.status === 'connected');
  const contentHeadingRef = useRef<HTMLDivElement>(null);

  const initialLocationState = location.state as SettingsLocationState | null;
  const initialReturnPath = initialLocationState?.from;
  const returnPathRef = useRef<string | null>(
    typeof initialReturnPath === 'string' &&
      initialReturnPath.startsWith('/admin/') &&
      !initialReturnPath.startsWith('/admin/settings')
      ? initialReturnPath
      : null,
  );

  const requestedSection = searchParams.get('section') ?? searchParams.get('tab');
  const activeSection: SettingsSectionKey = isSettingsSection(requestedSection)
    ? requestedSection
    : 'general';

  const [isCurrentCategoryDirty, setIsCurrentCategoryDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const currentCategory = useMemo(
    () => SETTINGS_CATEGORIES.find((category) => category.key === activeSection) ?? SETTINGS_CATEGORIES[0],
    [activeSection],
  );

  const returnToAdmin = useCallback(() => {
    navigate(returnPathRef.current ?? ROUTES.ADMIN.DASHBOARD, { replace: true });
  }, [navigate]);

  const completeNavigation = useCallback((target: Exclude<PendingNavigation, null>) => {
    setIsCurrentCategoryDirty(false);

    if (target.type === 'close') {
      returnToAdmin();
      return;
    }

    setSearchParams({ section: target.section }, { replace: true });
  }, [returnToAdmin, setSearchParams]);

  const requestNavigation = useCallback((target: Exclude<PendingNavigation, null>) => {
    if (target.type === 'section' && target.section === activeSection) return;

    if (isCurrentCategoryDirty) {
      setPendingNavigation(target);
      setShowDiscardDialog(true);
      return;
    }

    completeNavigation(target);
  }, [activeSection, completeNavigation, isCurrentCategoryDirty]);

  const handleConfirmDiscard = () => {
    const target = pendingNavigation;
    setShowDiscardDialog(false);
    setPendingNavigation(null);
    if (target) completeNavigation(target);
  };

  useEffect(() => {
    window.requestAnimationFrame(() => contentHeadingRef.current?.focus());
  }, [activeSection]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== 'Escape' ||
        document.querySelector('[role="dialog"]')
      ) {
        return;
      }
      requestNavigation({ type: 'close' });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestNavigation]);

  useEffect(() => {
    if (!isCurrentCategoryDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCurrentCategoryDirty]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-[2px] p-0 sm:p-4 md:p-6 lg:p-8 overflow-hidden select-none">
      {/* Centered Large Settings Dialog Shell (Strictly non-scrollable container) */}
      <section
        aria-label="RadhaCafe Settings Center"
        className="relative flex flex-col h-full w-full max-w-[1100px] overflow-hidden bg-card shadow-2xl rounded-none sm:rounded-3xl border-0 sm:border sm:border-border/80 md:h-[88svh] md:max-h-[850px] animate-in fade-in zoom-in-[0.99] duration-150"
      >
        {/* ========================================================================= */}
        {/* DESKTOP & TABLET VIEW (>= 768px)                                           */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] h-full w-full min-w-0 overflow-hidden">
          {/* Top Right Floating Close Button */}
          <button
            type="button"
            onClick={() => requestNavigation({ type: 'close' })}
            className="absolute right-4 top-4 z-30 flex h-8.5 w-8.5 items-center justify-center rounded-full border border-border/60 bg-secondary/80 text-muted-foreground shadow-2xs transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close Settings"
            title="Close Settings (Esc)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>

          {/* Left Column: Fixed Sidebar Navigation */}
          <div className="h-full overflow-hidden border-r border-border/80 bg-secondary/20">
            <SettingsSidebar
              activeKey={activeSection}
              onSelectKey={(section: SettingsSectionKey) => requestNavigation({ type: 'section', section })}
              printerConnected={printerConnected}
            />
          </div>

          {/* Right Column: Scrollable Settings Content */}
          <div className="h-full min-w-0 overflow-y-auto bg-card px-6 py-7 lg:px-10 lg:py-8">
            <div
              ref={contentHeadingRef}
              tabIndex={-1}
              className="mx-auto w-full max-w-3xl pb-16 outline-none"
            >
              <SettingsContent section={activeSection} onDirtyChange={setIsCurrentCategoryDirty} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE VIEW (< 768px): Header + Horizontal Tabs Slider + Content          */}
        {/* ========================================================================= */}
        <div className="md:hidden flex flex-col h-full w-full bg-card overflow-hidden">
          {/* Mobile Fixed Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-border/80 bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="min-w-0">
              <h2 className="text-base font-bold font-heading text-foreground truncate">
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
              onClick={() => requestNavigation({ type: 'close' })}
              className="h-8.5 w-8.5 rounded-full p-0 text-muted-foreground hover:bg-secondary"
              aria-label="Close Settings"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={17} />
            </Button>
          </header>

          {/* Mobile Horizontal Tabs with Slider Buttons and Smooth Drag/Wheel Scroll */}
          <div className="shrink-0">
            <SettingsMobileTabs
              activeKey={activeSection}
              onSelectKey={(section: SettingsSectionKey) => requestNavigation({ type: 'section', section })}
              printerConnected={printerConnected}
            />
          </div>

          {/* Mobile Scrollable Form Area */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 pb-24">
            <div ref={contentHeadingRef} tabIndex={-1} className="outline-none">
              <SettingsContent section={activeSection} onDirtyChange={setIsCurrentCategoryDirty} />
            </div>
          </div>
        </div>
      </section>

      {/* Unsaved Changes Confirmation Modal */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-foreground">
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              You have unsaved changes in <strong>{currentCategory.label}</strong>. Leaving this section will discard your modifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDiscardDialog(false);
                setPendingNavigation(null);
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
