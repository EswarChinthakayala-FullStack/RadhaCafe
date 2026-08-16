import { useState, useEffect } from 'react';
import { useBluetoothPrinter } from '../../hooks/useBluetoothPrinter';
import { usePrinterSettings, useUpdatePrinterSettings } from '../../hooks/useSettings';
import { usePreferredPrinter } from '../../hooks/useSavedPrinters';
import { useActiveReceiptTemplate } from '../../hooks/useReceiptTemplates';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { PrinterStatusHero } from '../../components/admin/printer/PrinterStatusHero';
import { SavedPrintersList } from '../../components/admin/printer/SavedPrintersList';
import { PrinterConnectionWizard } from '../../components/admin/printer/PrinterConnectionWizard';
import { PrinterTestPanel } from '../../components/admin/printer/PrinterTestPanel';
import { PrinterReceiptSettings } from '../../components/admin/printer/PrinterReceiptSettings';
import { PrinterDiagnostics } from '../../components/admin/printer/PrinterDiagnostics';
import { PrinterTroubleshooting } from '../../components/admin/printer/PrinterTroubleshooting';
import { PrinterAdvancedSettings } from '../../components/admin/printer/PrinterAdvancedSettings';
import { Skeleton } from '../../components/ui/skeleton';

export function PrinterPage() {
  const { data: settings, isLoading: isSettingsLoading } = usePrinterSettings();
  const { data: preferredPrinter } = usePreferredPrinter();
  const updateSettingsMutation = useUpdatePrinterSettings();
  const { data: activeTemplate } = useActiveReceiptTemplate();
  const { data: cafeSettings } = useCafeSettings();

  const {
    status,
    connectionStage,
    device,
    connectedPrinter,
    isSupported,
    isSecure,
    isConnected,
    isConnecting,
    isPrinting,
    scanAndConnect,
    reconnectPreferred,
    disconnect,
    forgetPrinter,
    printTestReceipt,
    printTemplateTest,
  } = useBluetoothPrinter();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [paperWidth, setPaperWidth] = useState<number>(32);
  const [autoConnect, setAutoConnect] = useState<boolean>(true);

  // Sync persisted settings with local state
  useEffect(() => {
    if (settings) {
      if (settings.paper_width) setPaperWidth(settings.paper_width);
      if (settings.auto_connect !== undefined) setAutoConnect(settings.auto_connect);
    }
  }, [settings]);

  // Handle Paper Width Change
  const handlePaperWidthChange = async (newWidth: number) => {
    setPaperWidth(newWidth);
    await updateSettingsMutation.mutateAsync({ paper_width: newWidth });
  };

  // Handle Auto-Connect Change
  const handleAutoConnectChange = async (enabled: boolean) => {
    setAutoConnect(enabled);
    await updateSettingsMutation.mutateAsync({ auto_connect: enabled });
  };

  if (isSettingsLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <Skeleton className="h-36 w-full rounded-2xl bg-card border border-border/60" />
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-64 rounded-2xl bg-card border border-border/60" />
            <Skeleton className="h-48 rounded-2xl bg-card border border-border/60" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-96 rounded-2xl bg-card border border-border/60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl w-full min-w-0 mx-auto pb-12 overflow-x-hidden">
      {/* 1. Operational Status Hero Panel */}
      <PrinterStatusHero
        status={status}
        connectionStage={connectionStage}
        device={device}
        connectedPrinter={connectedPrinter}
        preferredPrinter={preferredPrinter ?? null}
        paperWidth={paperWidth}
        activeTemplateName={activeTemplate?.name || 'Classic Receipt'}
        isSupported={isSupported}
        onOpenWizard={() => setIsWizardOpen(true)}
        onReconnectPreferred={reconnectPreferred}
        onDisconnect={disconnect}
        onTestPrint={() => printTestReceipt(cafeSettings?.cafe_name || 'RadhaCafe')}
        isTestPrinting={isPrinting}
      />

      {/* 2. Saved Printers Management List */}
      <SavedPrintersList onAddNewPrinter={() => setIsWizardOpen(true)} />

      {/* 3. Responsive 2-Column Desktop / Stacked Mobile Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left Column (~60-65%): Testing, Diagnostics, Troubleshooting & Technical */}
        <div className="lg:col-span-7 space-y-6 w-full min-w-0">
          {/* Test Printing Center */}
          <PrinterTestPanel
            onPrintTestReceipt={() => printTestReceipt(cafeSettings?.cafe_name || 'RadhaCafe')}
            onPrintTemplateTest={() => printTemplateTest(cafeSettings?.cafe_name || 'RadhaCafe')}
          />

          {/* Connection Diagnostics */}
          <PrinterDiagnostics
            isSupported={isSupported}
            isSecure={isSecure}
            isConnected={isConnected}
            deviceName={connectedPrinter?.friendly_name || connectedPrinter?.device_name || device?.name || settings?.printer_name}
            paperWidth={paperWidth}
          />

          {/* Troubleshooting Accordion */}
          <PrinterTroubleshooting />

          {/* Advanced Hardware Parameters & Event Logs */}
          <PrinterAdvancedSettings
            savedPrinterName={connectedPrinter?.friendly_name || settings?.printer_name}
            savedDeviceId={connectedPrinter?.device_id || settings?.device_id}
            onForgetPrinter={async () => {
              if (connectedPrinter) {
                await forgetPrinter(connectedPrinter.id, connectedPrinter.device_id);
              }
            }}
          />
        </div>

        {/* Right Column (~35-40%): Receipt Configuration & Live Sample Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-6 w-full min-w-0">
          <PrinterReceiptSettings
            paperWidth={paperWidth}
            autoConnect={autoConnect}
            onPaperWidthChange={handlePaperWidthChange}
            onAutoConnectChange={handleAutoConnectChange}
            activeTemplateConfig={activeTemplate?.template_config}
            activeTemplateName={activeTemplate?.name || 'Classic Receipt'}
            cafeSettings={cafeSettings}
          />
        </div>
      </div>

      {/* 4. Custom RadhaCafe Connection Wizard Modal */}
      <PrinterConnectionWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onScanForPrinter={scanAndConnect}
        savedPrinterName={preferredPrinter?.friendly_name || preferredPrinter?.device_name || settings?.printer_name}
        isConnecting={isConnecting}
      />
    </div>
  );
}
