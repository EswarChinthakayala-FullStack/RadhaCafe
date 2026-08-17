import { useState, useEffect } from 'react';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { usePrinterSettings, useUpdatePrinterSettings } from '../../../hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  BluetoothIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Settings01Icon,
  Delete02Icon,
  WifiIcon,
} from '@hugeicons/core-free-icons';

export function PrinterSettings() {
  const { data: settings, isLoading } = usePrinterSettings();
  const updateMutation = useUpdatePrinterSettings();

  const {
    status,
    device,
    lastError,
    isSupported,
    isSecure,
    connect,
    disconnect,
    forgetPrinter,
    printTestReceipt,
  } = useBluetoothPrinter();

  const [paperWidth, setPaperWidth] = useState<number>(32);
  const [autoConnect, setAutoConnect] = useState<boolean>(true);
  const [isTestPrinting, setIsTestPrinting] = useState(false);

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
        description: `Receipt line truncation updated to ${width} columns.`,
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
          ? 'Application will attempt automatic reconnection when Bluetooth device is available.'
          : 'Auto-connect disabled.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Auto-Connect Preference',
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
          description: 'ESC/POS test receipt byte stream transmitted successfully to printer.',
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Test Print Failed',
          description: 'Printer not connected or Bluetooth transmission failed. Check connection.',
          type: 'error',
        });
      }
    } catch (err: any) {
      toast.add({
        title: 'Test Print Error',
        description: err.message || 'An error occurred while printing test receipt.',
        type: 'error',
      });
    } finally {
      setIsTestPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch w-full">
          <Card className="border-border/80 bg-card shadow-xs rounded-md h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border/60">
              <Skeleton className="h-6 w-48 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4 flex-1">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6 h-full justify-between">
            <Card className="border-border/80 bg-card shadow-xs rounded-md flex-1">
              <CardHeader className="pb-3 border-b border-border/60">
                <Skeleton className="h-6 w-48 rounded-lg" />
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-card shadow-xs rounded-md flex-1">
              <CardHeader className="pb-3 border-b border-border/60">
                <Skeleton className="h-6 w-48 rounded-lg" />
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Skeleton className="h-12 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Section Header with Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={PrinterIcon} size={22} />
            </div>
            <span>Bluetooth Thermal Printer Settings</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pair, test, and manage Web Bluetooth ESC/POS thermal printers.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch w-full">
        {/* Column 1: Bluetooth Connection & Operations */}
        <Card className="border-border/80 bg-card shadow-xs rounded-md h-full flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
                  <HugeiconsIcon icon={PrinterIcon} size={20} />
                </div>
                <div>
                  <CardTitle className="text-base font-bold font-heading text-foreground">
                    Thermal Printer Connection
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pair and manage Web Bluetooth ESC/POS receipt printers for counter operation.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs pt-4 pb-6">
              {/* Status Display Box */}
              <div className="p-4 rounded-md bg-secondary/30 border border-border/60 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-xs">Connection Status</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={status === 'connected' || status === 'ready' ? 'default' : 'outline'}
                        className={
                          status === 'connected' || status === 'ready'
                            ? 'bg-success text-white font-bold capitalize rounded-lg px-2.5 py-0.5'
                            : status === 'connecting'
                              ? 'bg-cinnamon/10 text-cinnamon font-bold capitalize rounded-lg px-2.5 py-0.5 border-cinnamon/30'
                              : 'capitalize text-muted-foreground border-border/80 rounded-lg px-2.5 py-0.5'
                        }
                      >
                        {status === 'ready' ? 'Connected' : status}
                      </Badge>
                      {device?.name && (
                        <span className="font-mono text-cinnamon font-bold truncate max-w-[160px]">
                          {device.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'connected' || status === 'ready' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={disconnect}
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-md h-8 text-xs font-semibold"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={connect}
                        disabled={status === 'connecting' || !isSupported}
                        className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold gap-1.5 rounded-md h-9 text-xs px-3.5 shadow-xs"
                      >
                        <HugeiconsIcon icon={BluetoothIcon} size={15} />
                        <span>{status === 'connecting' ? 'Connecting...' : 'Connect Printer'}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Saved / Forget Printer Action */}
                {settings?.printer_name && (
                  <div className="pt-2 border-t border-border/50 flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground truncate max-w-[180px]">
                      Saved Printer: <strong className="text-foreground">{settings.printer_name}</strong>
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        if (settings?.preferred_printer_id) {
                          forgetPrinter(settings.preferred_printer_id, settings.device_id || undefined);
                        }
                      }}
                      className="text-destructive hover:bg-destructive/10 h-7 px-2 rounded-lg gap-1 font-semibold"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={13} />
                      <span>Forget Printer</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Last Error Notice */}
              {lastError && (
                <div className="p-3.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <HugeiconsIcon icon={AlertCircleIcon} size={15} />
                    <span>Printer Connection Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-5">{lastError}</p>
                </div>
              )}
            </CardContent>
          </div>

          {/* Bottom Section: Test Print Operation pinned to bottom */}
          <CardContent className="pt-0 pb-6">
            <div className="p-4 rounded-md border border-border/80 bg-secondary/20 space-y-3">
              <div>
                <h4 className="font-bold text-foreground text-xs">Test Printer Operation</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Transmits an ESC/POS test receipt byte stream to verify branding, column alignment, bold text, and paper cut.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleTestPrint}
                disabled={isTestPrinting}
                className="gap-2 text-xs font-semibold rounded-md h-9 border-border/80"
              >
                <HugeiconsIcon icon={PrinterIcon} size={14} />
                <span>{isTestPrinting ? 'Transmitting Bytes...' : 'Print Test Receipt'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Paper Configuration & Compatibility (Stretched to match Left Column) */}
        <div className="flex flex-col gap-6 h-full justify-between">
          <Card className="border-border/80 bg-card shadow-xs rounded-md flex-1 flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
                  <HugeiconsIcon icon={Settings01Icon} size={20} />
                </div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Paper Width & Auto-Connect
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 text-xs pt-4 pb-6 flex-1 flex flex-col justify-between">
              {/* Paper Width Column Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 pr-2">
                    <Label htmlFor="paper-width" className="font-bold text-foreground block">
                      Paper Width (Columns)
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Controls character width when formatting ESC/POS receipts.
                    </p>
                  </div>

                  <Select value={String(paperWidth)} onValueChange={handlePaperWidthChange}>
                    <SelectTrigger id="paper-width" size="sm" className="bg-background text-xs h-9 w-28 rounded-md border-border/80 font-medium shrink-0 shadow-xs">
                      <SelectValue placeholder="Select width" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="32">32 Columns (58mm)</SelectItem>
                      <SelectItem value="48">48 Columns (80mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto Connect Toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="auto-conn" className="font-bold text-foreground block">
                    Auto-Connect Printer
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Automatically reconnect to saved Bluetooth printer when available.
                  </p>
                </div>
                <Switch id="auto-conn" checked={autoConnect} onCheckedChange={handleAutoConnectChange} />
              </div>
            </CardContent>
          </Card>

          {/* Environment & Compatibility Checklist */}
          <Card className="border-border/80 bg-card shadow-xs rounded-md flex-1 flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
                  <HugeiconsIcon icon={WifiIcon} size={18} />
                </div>
                <CardTitle className="text-sm font-bold font-heading text-foreground">
                  Environment Compatibility Checklist
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs pt-4 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/30 border border-border/50">
                <span className="font-medium text-foreground">Web Bluetooth API Support</span>
                {isSupported ? (
                  <span className="text-success font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} /> Supported
                  </span>
                ) : (
                  <span className="text-destructive font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={AlertCircleIcon} size={15} /> Unsupported Browser
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/30 border border-border/50">
                <span className="font-medium text-foreground">Secure Context (HTTPS / localhost)</span>
                {isSecure ? (
                  <span className="text-success font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} /> Secure Context
                  </span>
                ) : (
                  <span className="text-warning font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={AlertCircleIcon} size={15} /> HTTPS Required
                  </span>
                )}
              </div>

              {!isSupported && (
                <div className="p-3 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[11px] leading-relaxed">
                  Direct Web Bluetooth printing requires Google Chrome, Microsoft Edge, or Opera. If using Safari or Firefox, RadhaCafe will automatically use browser print fallback dialogs.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
