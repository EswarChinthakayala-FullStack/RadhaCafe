import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { usePrinterSettings, useUpdatePrinterSettings } from '../../../hooks/useSettings';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
import { ROUTES } from '../../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  CheckmarkCircle02Icon,
  LinkSquare01Icon,
  PlayIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

export function PrinterSettingsSummary() {
  const navigate = useNavigate();
  const { data: settings, isLoading } = usePrinterSettings();
  const updateMutation = useUpdatePrinterSettings();

  const {
    isConnected,
    isConnecting,
    device,
    savedPrinterName,
    printTestReceipt,
  } = useBluetoothPrinter();

  const [paperWidth, setPaperWidth] = useState<number>(32);
  const [autoConnect, setAutoConnect] = useState<boolean>(true);
  const [isTestPrinting, setIsTestPrinting] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      if (settings.paper_width) setPaperWidth(settings.paper_width);
      if (settings.auto_connect !== undefined) setAutoConnect(settings.auto_connect);
    }
  }, [settings]);

  const handlePaperWidthChange = async (val: string | null) => {
    if (!val) return;
    const width = Number(val);
    setPaperWidth(width);
    try {
      await updateMutation.mutateAsync({ paper_width: width });
      toast.add({
        title: 'Paper Width Saved',
        description: `Receipt formatting updated to ${width === 48 ? '80 mm (48 cols)' : '58 mm (32 cols)'}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Paper Width',
        description: err.message || 'Failed to update printer paper width.',
        type: 'error',
      });
    }
  };

  const handleAutoConnectChange = async (checked: boolean) => {
    setAutoConnect(checked);
    try {
      await updateMutation.mutateAsync({ auto_connect: checked });
      toast.add({
        title: 'Auto-Connect Preference Saved',
        description: checked
          ? 'Application will attempt automatic reconnection when authorized printer is detected.'
          : 'Auto-connect disabled.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Preference',
        description: err.message || 'Failed to update auto-connect preference.',
        type: 'error',
      });
    }
  };

  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    try {
      const success = await printTestReceipt('RadhaCafe');
      if (success) {
        toast.add({
          title: 'Test Print Transmitted',
          description: 'ESC/POS test receipt transmitted to thermal printer.',
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Test Print Failed',
          description: 'Could not communicate with thermal printer. Check Bluetooth connection.',
          type: 'error',
        });
      }
    } finally {
      setIsTestPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const activeDeviceName = device?.name || settings?.printer_name || savedPrinterName || 'No printer paired';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold font-heading text-foreground">
            Printer Configuration
          </h3>
          <p className="text-xs text-muted-foreground">
            Thermal receipt hardware settings and Bluetooth communication status.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => navigate(ROUTES.ADMIN.PRINTER)}
          className="h-8 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <HugeiconsIcon icon={LinkSquare01Icon} size={13} />
          <span>Manage Printer Center</span>
        </Button>
      </div>

      {/* Hardware Status Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-secondary/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border shadow-2xs ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-secondary text-muted-foreground border-border/80'
            }`}>
              <HugeiconsIcon icon={PrinterIcon} size={22} />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-foreground font-heading">
                  {activeDeviceName}
                </span>
                {isConnected ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1 px-2 py-0.5 h-5">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                    <span>Connected</span>
                  </Badge>
                ) : isConnecting ? (
                  <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 border-amber-500/30 bg-amber-500/10 gap-1 px-2 py-0.5 h-5">
                    <HugeiconsIcon icon={Loading03Icon} size={11} className="animate-spin" />
                    <span>Connecting...</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground border-border/80 bg-background px-2 py-0.5 h-5">
                    Offline
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                {paperWidth === 48 ? '80 mm Roll (48 cols)' : '58 mm Roll (32 cols)'} • Web Bluetooth ESC/POS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestPrint}
              disabled={isTestPrinting}
              className="h-8 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
            >
              {isTestPrinting ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={12} className="animate-spin text-cinnamon" />
                  <span>Printing...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={PlayIcon} size={12} className="text-cinnamon" />
                  <span>Test Slip</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Section: Hardware Parameters */}
      <SettingsSection title="Paper & Communication" showSeparator={false}>
        {/* Paper Width Selection */}
        <SettingsRow
          title="Paper Roll Width"
          description="Controls line wrap limits and table formatting for standard receipt rolls."
        >
          <Select value={String(paperWidth)} onValueChange={handlePaperWidthChange}>
            <SelectTrigger className="h-9 w-full sm:w-56 text-xs rounded-xl border-border/80 bg-background font-mono font-semibold">
              <SelectValue placeholder="Select paper width" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs font-mono">
              <SelectItem value="32">58 mm (32 Characters / Line)</SelectItem>
              <SelectItem value="48">80 mm (48 Characters / Line)</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        {/* Auto Reconnect */}
        <SettingsRow
          id="auto-connect"
          title="Reconnect Automatically"
          description="Attempt silent background reconnection to the authorized Bluetooth printer on launch."
        >
          <Switch
            id="auto-connect"
            checked={autoConnect}
            onCheckedChange={handleAutoConnectChange}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Link to Full Diagnostics */}
      <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 text-xs text-muted-foreground flex items-center justify-between gap-3">
        <span className="text-[11px] leading-relaxed">
          Need to scan for new Bluetooth devices or run comprehensive hex diagnostics?
        </span>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => navigate(ROUTES.ADMIN.PRINTER)}
          className="text-xs font-bold text-cinnamon hover:text-cinnamon/90 h-auto p-0 shrink-0"
        >
          <span>Open Full Hardware Center →</span>
        </Button>
      </div>
    </div>
  );
}
