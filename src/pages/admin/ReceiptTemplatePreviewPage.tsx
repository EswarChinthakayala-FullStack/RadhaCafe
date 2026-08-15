import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useReceiptTemplates,
  useReceiptTemplateMutations,
} from '../../hooks/useReceiptTemplates';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { useBluetoothPrinter } from '../../hooks/useBluetoothPrinter';
import {
  BUILT_IN_PRESETS,
  SAMPLE_DATASETS,
  presetToReceiptTemplate,
} from '../../lib/printer/presetTemplates';
import type { Order } from '../../types';
import { ROUTES } from '../../constants/routes';
import { ReceiptPreviewHeader } from '../../components/admin/receipts/ReceiptPreviewHeader';
import { ReceiptPreviewToolbar, type DatasetMode } from '../../components/admin/receipts/ReceiptPreviewToolbar';
import { ReceiptTemplateInfoPanel } from '../../components/admin/receipts/ReceiptTemplateInfoPanel';
import { ReceiptPreviewMobileInfo } from '../../components/admin/receipts/ReceiptPreviewMobileInfo';
import { ReceiptPreview } from '../../components/admin/printer/ReceiptPreview';
import { printOrderViaBrowser } from '../../lib/printer/browserPrint';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
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
import { toast } from '../../components/ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  AlertCircleIcon,
  PrinterIcon,
  Edit02Icon,
  StarIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

export function ReceiptTemplatePreviewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const { data: dbTemplates, isLoading: isTemplatesLoading } = useReceiptTemplates();
  const { data: cafeSettings } = useCafeSettings();
  const {
    isConnected: printerConnected,
    connect: connectPrinter,
    printCustomReceipt,
  } = useBluetoothPrinter();

  const {
    activateMutation,
    createMutation,
    duplicateMutation,
    deleteMutation,
  } = useReceiptTemplateMutations();

  // Resolve template from DB or built-in presets
  const { template, isPreset, isFound } = useMemo(() => {
    if (!templateId) return { template: null, isPreset: false, isFound: false };

    // 1. Check database templates
    const dbMatch = dbTemplates?.find((t) => t.id === templateId);
    if (dbMatch) {
      return { template: dbMatch, isPreset: false, isFound: true };
    }

    // 2. Check built-in presets
    const presetMatch = BUILT_IN_PRESETS.find((p) => p.id === templateId);
    if (presetMatch) {
      // Check if there is an active matching template in the database
      const activeMatch = dbTemplates?.find((t) => t.name === presetMatch.name && t.is_active);
      return {
        template: presetToReceiptTemplate(presetMatch, Boolean(activeMatch)),
        isPreset: true,
        isFound: true,
      };
    }

    return { template: null, isPreset: false, isFound: false };
  }, [templateId, dbTemplates]);

  const isActive = Boolean(template?.is_active);

  // Local Preview Controls State
  const [datasetMode, setDatasetMode] = useState<DatasetMode>('paid');
  const [selectedRealOrder, setSelectedRealOrder] = useState<Order | null>(null);
  const [simulatedWidth, setSimulatedWidth] = useState<number>(32);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(true);

  // Operational states
  const [isTestPrinting, setIsTestPrinting] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [showPrinterPrompt, setShowPrinterPrompt] = useState<boolean>(false);

  // Sync initial simulated width with template definition
  useEffect(() => {
    if (template) {
      const defaultCols = template.paper_width || template.template_config?.paperWidth || 32;
      setSimulatedWidth(defaultCols >= 42 ? 48 : 32);
    }
  }, [template]);

  // Determine effective order data for preview
  const effectiveOrder = useMemo(() => {
    if (selectedRealOrder) return selectedRealOrder;
    return SAMPLE_DATASETS[datasetMode] || SAMPLE_DATASETS.paid;
  }, [selectedRealOrder, datasetMode]);

  // Effective template config combining saved config with simulated width
  const effectiveTemplateConfig = useMemo(() => {
    if (!template) return undefined;
    return {
      ...template.template_config,
      paperWidth: simulatedWidth,
    };
  }, [template, simulatedWidth]);

  // Handler: Test Print via connected Bluetooth printer
  const transmitTestPrint = async () => {
    if (!template || !effectiveTemplateConfig) return;
    setIsTestPrinting(true);
    try {
      const success = await printCustomReceipt(
        effectiveOrder,
        effectiveTemplateConfig,
        cafeSettings?.cafe_name || 'RadhaCafe'
      );
      if (success) {
        toast.add({
          title: 'Test Receipt Transmitted',
          description: `Preview byte stream sent to printer for "${template.name}".`,
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Print Test Failed',
          description: 'Unable to transmit test receipt. Check thermal printer connection.',
          type: 'error',
        });
      }
    } catch (err: any) {
      toast.add({
        title: 'Print Error',
        description: err.message || 'Failed to print test receipt.',
        type: 'error',
      });
    } finally {
      setIsTestPrinting(false);
    }
  };

  const handleTestPrint = async () => {
    if (!printerConnected) {
      setShowPrinterPrompt(true);
      return;
    }
    await transmitTestPrint();
  };

  const handleConnectAndPrint = async () => {
    setIsTestPrinting(true);
    const connected = await connectPrinter();
    setIsTestPrinting(false);
    if (!connected) return;
    setShowPrinterPrompt(false);
    await transmitTestPrint();
  };

  // Handler: Activate Template
  const handleActivate = async () => {
    if (!template) return;
    setIsActivating(true);
    try {
      if (isPreset) {
        // If activating a preset baseline, check if duplicate exists or create one as active
        const existingMatch = dbTemplates?.find((t) => t.name === template.name);
        if (existingMatch) {
          await activateMutation.mutateAsync(existingMatch.id);
        } else {
          await createMutation.mutateAsync({
            name: template.name,
            description: template.description || 'Active preset receipt layout',
            is_active: true,
            paper_width: template.paper_width,
            template_config: template.template_config,
          });
        }
      } else {
        await activateMutation.mutateAsync(template.id);
      }

      toast.add({
        title: 'Receipt Template Activated',
        description: `"${template.name}" is now the active default format.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Failed to Activate Template',
        description: err.message || 'Unable to switch active template.',
        type: 'error',
      });
    } finally {
      setIsActivating(false);
    }
  };

  // Handler: Customize in Editor
  const handleCustomize = () => {
    if (!template) return;
    navigate(`/admin/settings/receipts/${template.id}/edit`);
  };

  // Handler: Duplicate Template
  const handleDuplicate = async () => {
    if (!template) return;
    try {
      if (isPreset) {
        const created = await createMutation.mutateAsync({
          name: `${template.name} (Custom Copy)`,
          description: `Customized version based on ${template.name}`,
          is_active: false,
          paper_width: template.paper_width,
          template_config: template.template_config,
        });
        toast.add({
          title: 'Template Duplicated',
          description: `Created custom copy "${created.name}".`,
          type: 'success',
        });
        navigate(`/admin/settings/receipts/${created.id}/preview`);
      } else {
        const duplicated = await duplicateMutation.mutateAsync(template.id);
        toast.add({
          title: 'Template Duplicated',
          description: `Created copy "${duplicated.name}".`,
          type: 'success',
        });
        navigate(`/admin/settings/receipts/${duplicated.id}/preview`);
      }
    } catch (err: any) {
      toast.add({
        title: 'Duplication Failed',
        description: err.message || 'Unable to duplicate template.',
        type: 'error',
      });
    }
  };

  // Handler: Delete Custom Template
  const handleDelete = async () => {
    if (!template || isPreset || isActive) return;
    setShowDeleteAlert(false);
    try {
      await deleteMutation.mutateAsync(template.id);
      toast.add({
        title: 'Template Deleted',
        description: `"${template.name}" has been removed.`,
        type: 'success',
      });
      navigate(ROUTES.ADMIN.RECEIPTS);
    } catch (err: any) {
      toast.add({
        title: 'Deletion Failed',
        description: err.message || 'Unable to delete template.',
        type: 'error',
      });
    }
  };

  // Handler: Browser Print Fallback
  const handleBrowserPrint = () => {
    if (!template || !effectiveTemplateConfig) return;
    printOrderViaBrowser(effectiveOrder, cafeSettings, effectiveTemplateConfig);
  };

  // Loading State Skeleton
  if (isTemplatesLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        <Skeleton className="h-16 w-full rounded-2xl bg-card border border-border/60" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-12 w-full rounded-2xl bg-card border border-border/60" />
            <Skeleton className="h-[520px] w-full rounded-2xl bg-card border border-border/60" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl bg-card border border-border/60" />
            <Skeleton className="h-48 w-full rounded-2xl bg-card border border-border/60" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!isFound || !template) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto border border-destructive/20 shadow-xs">
          <HugeiconsIcon icon={AlertCircleIcon} size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold font-heading text-foreground">
            Receipt Template Not Found
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested template ID does not exist or has been deleted.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN.RECEIPTS)}
          className="bg-cinnamon hover:bg-cinnamon/90 text-white text-xs font-bold rounded-xl h-10 px-5 gap-2 shadow-2xs"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
          <span>Back to Templates Gallery</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 sm:pb-16 w-full min-w-0">
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <ReceiptPreviewHeader
        template={template}
        isPreset={isPreset}
        isActive={isActive}
        onCustomize={handleCustomize}
        onTestPrint={handleTestPrint}
        onActivate={handleActivate}
        onDuplicate={handleDuplicate}
        onDelete={() => setShowDeleteAlert(true)}
        onBrowserPrint={handleBrowserPrint}
        isActivating={isActivating}
        isTestPrinting={isTestPrinting}
        printerConnected={printerConnected}
      />

      {/* 2. MAIN PREVIEW WORKSPACE (68% Left Central Canvas / 32% Right Info Panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start w-full min-w-0">
        {/* Left Column (~68%): Toolbar + Central Realistic Slip Workspace */}
        <div className="space-y-4 w-full min-w-0">
          {/* Interactive Preview Toolbar */}
          <ReceiptPreviewToolbar
            datasetMode={datasetMode}
            onDatasetModeChange={setDatasetMode}
            selectedOrder={selectedRealOrder}
            onSelectOrder={setSelectedRealOrder}
            simulatedWidth={simulatedWidth}
            onSimulatedWidthChange={setSimulatedWidth}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            isFitWidth={isFitWidth}
            onToggleFitWidth={() => {
              setIsFitWidth(!isFitWidth);
              if (!isFitWidth) setZoomLevel(1.0);
            }}
          />

          {/* Neutral Background Canvas Container */}
          <section className="overflow-hidden rounded-2xl border border-border/80 bg-[#eee9e1] shadow-inner dark:bg-[#171512]">
            <div className="flex min-h-11 items-center justify-between gap-3 border-b border-black/10 bg-white/55 px-3.5 py-2 text-[10px] font-semibold text-neutral-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 sm:px-5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex h-2 w-2 rounded-full bg-cinnamon" />
                <span className="truncate">{selectedRealOrder ? `Order ${selectedRealOrder.order_number}` : 'Sample receipt data'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span>Configured: {(template.paper_width || template.template_config.paperWidth) >= 42 ? '80 mm' : '58 mm'}</span>
                <span className="text-neutral-400">/</span>
                <span>Viewing: {simulatedWidth === 48 ? '80 mm' : '58 mm'}</span>
              </div>
            </div>

            <div className="relative flex min-h-[600px] flex-col items-center justify-start overflow-x-auto p-4 sm:p-8 lg:p-10 bg-[radial-gradient(circle_at_1px_1px,rgba(91,72,52,0.12)_1px,transparent_0)] bg-size-[22px_22px]">
            {/* Real Order Banner (When Active) */}
            {selectedRealOrder && (
              <div className="w-full max-w-md mb-5 p-2.5 rounded-xl bg-white/85 border border-cinnamon/30 text-cinnamon text-xs flex items-center justify-between gap-2 shadow-sm dark:bg-neutral-900/90">
                <span className="font-semibold text-[11px] truncate">
                  Previewing Real Order: <strong>{selectedRealOrder.order_number}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRealOrder(null)}
                  className="text-[10px] underline font-bold hover:text-foreground shrink-0"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Scaled Receipt Slip */}
            <div
              style={{
                zoom: !isFitWidth ? zoomLevel : undefined,
                transition: 'zoom 0.15s ease-out',
                maxWidth: simulatedWidth === 48 ? '420px' : '320px',
                width: '100%',
              }}
              className="flex justify-center min-w-0"
            >
              <ReceiptPreview
                order={effectiveOrder}
                templateConfig={effectiveTemplateConfig}
                cafeSettings={cafeSettings}
              />
            </div>
            </div>
          </section>

          {/* Mobile Collapsible Specifications Accordion */}
          <div className="block xl:hidden">
            <ReceiptPreviewMobileInfo
              template={template}
              isPreset={isPreset}
              isActive={isActive}
            />
          </div>
        </div>

        {/* Right Column (~32%): Sticky Read-Only Specifications & Action Cards (Desktop Only) */}
        <div className="hidden xl:block xl:sticky xl:top-20 space-y-4 w-full min-w-0">
          <ReceiptTemplateInfoPanel
            template={template}
            isPreset={isPreset}
            isActive={isActive}
            onCustomize={handleCustomize}
            onTestPrint={handleTestPrint}
            onActivate={handleActivate}
            isActivating={isActivating}
            isTestPrinting={isTestPrinting}
          />
        </div>
      </div>

      {/* 3. MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-card/95 backdrop-blur-md border-t border-border/80 xl:hidden shadow-lg flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCustomize}
          className="flex-1 h-9 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs justify-center"
        >
          <HugeiconsIcon icon={Edit02Icon} size={14} className="text-cinnamon" />
          <span>Customize</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTestPrint}
          disabled={isTestPrinting}
          className="h-9 px-3 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs justify-center shrink-0"
        >
          <HugeiconsIcon icon={PrinterIcon} size={14} className="text-cinnamon" />
          <span className="hidden sm:inline">Test Print</span>
        </Button>

        {isActive ? (
          <Button
            type="button"
            disabled
            size="sm"
            className="flex-1 h-9 text-xs font-bold rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 gap-1.5 opacity-100 justify-center"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>Active</span>
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleActivate}
            disabled={isActivating}
            className="flex-1 h-9 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs justify-center"
          >
            <HugeiconsIcon icon={StarIcon} size={14} />
            <span>{isActivating ? 'Activating...' : 'Use Template'}</span>
          </Button>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-destructive">
              Delete receipt template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete <strong>{template.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-lg h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg h-9"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPrinterPrompt} onOpenChange={setShowPrinterPrompt}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-foreground">
              Connect a thermal printer
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Connect your Bluetooth thermal printer to send this exact preview as an ESC/POS test receipt. Testing does not activate the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-lg h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleConnectAndPrint();
              }}
              disabled={isTestPrinting}
              className="bg-cinnamon hover:bg-cinnamon/90 text-white text-xs font-bold rounded-lg h-9 gap-2"
            >
              <HugeiconsIcon icon={PrinterIcon} size={14} />
              {isTestPrinting ? 'Connecting...' : 'Connect & Test Print'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
