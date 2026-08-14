import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { toast } from '../../ui/toast';
import { getPrinterEventLog, DEFAULT_PRINTER_SERVICE_UUIDS } from '../../../lib/printer/bluetoothPrinter';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CodeIcon,
  Delete02Icon,
  RefreshIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from '@hugeicons/core-free-icons';

interface PrinterAdvancedSettingsProps {
  savedPrinterName?: string | null;
  savedDeviceId?: string | null;
  onForgetPrinter: () => Promise<void>;
}

export function PrinterAdvancedSettings({
  savedPrinterName,
  savedDeviceId,
  onForgetPrinter,
}: PrinterAdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isForgetAlertOpen, setIsForgetAlertOpen] = useState(false);
  const [logs, setLogs] = useState<{ timestamp: string; message: string }[]>([]);

  useEffect(() => {
    if (isExpanded) {
      setLogs(getPrinterEventLog());
    }
  }, [isExpanded]);

  const handleRefreshLogs = () => {
    setLogs(getPrinterEventLog());
  };

  const handleConfirmForget = async () => {
    setIsForgetAlertOpen(false);
    try {
      await onForgetPrinter();
      toast.add({
        title: 'Printer Forgotten',
        description: 'Saved printer metadata cleared from RadhaCafe database.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Clear Settings',
        description: err.message || 'Failed to forget printer.',
        type: 'error',
      });
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
              <HugeiconsIcon icon={CodeIcon} size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground break-words leading-tight">
                Technical Details & Logs
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 leading-relaxed">
                GATT service parameters, BLE transmission configurations, and live event history.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl px-2.5 self-start sm:self-auto shrink-0"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
            <HugeiconsIcon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} size={13} />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 sm:p-6 space-y-5 text-xs">
          {/* Hardware Parameters Grid */}
          <div className="grid sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1.5">
              <span className="font-bold text-foreground block">BLE Chunk Transmission</span>
              <p className="text-[11px] text-muted-foreground">
                Chunk Size: <strong className="font-mono text-foreground">20 Bytes</strong> (Standard BLE MTU payload)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Flow Delay: <strong className="font-mono text-foreground">15 ms</strong> per chunk
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1.5">
              <span className="font-bold text-foreground block">Saved Hardware Identity</span>
              <p className="text-[11px] text-muted-foreground">
                Device Name: <strong className="font-mono text-foreground">{savedPrinterName || 'None'}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Device ID: <strong className="font-mono text-foreground">{savedDeviceId || 'None'}</strong>
              </p>
            </div>
          </div>

          {/* Supported GATT Services */}
          <div className="space-y-1.5">
            <span className="font-bold text-foreground block">Configured Thermal Printer Service UUIDs</span>
            <div className="p-3 rounded-xl bg-background border border-border/60 font-mono text-[10px] space-y-1 text-muted-foreground">
              {DEFAULT_PRINTER_SERVICE_UUIDS.map((uuid, i) => (
                <div key={i} className="truncate">
                  {uuid}
                </div>
              ))}
            </div>
          </div>

          {/* Live In-Memory Event Log */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Session Event Log</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleRefreshLogs}
                className="h-6 text-[11px] text-muted-foreground gap-1 px-2"
              >
                <HugeiconsIcon icon={RefreshIcon} size={11} />
                <span>Refresh Log</span>
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border/60 font-mono text-[11px] max-h-40 overflow-y-auto space-y-1 text-muted-foreground">
              {logs.length === 0 ? (
                <span className="italic text-muted-foreground/60">No printer events recorded in this session.</span>
              ) : (
                logs.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-cinnamon/80 font-bold shrink-0">{item.timestamp}</span>
                    <span className="text-foreground/90">{item.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Forget Printer Danger Zone */}
          {savedPrinterName && (
            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Forget Saved Printer</span>
                <p className="text-[11px] text-muted-foreground">
                  Clears the saved printer name and ID from RadhaCafe database.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsForgetAlertOpen(true)}
                className="h-8.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl gap-1.5 font-semibold"
              >
                <HugeiconsIcon icon={Delete02Icon} size={13} />
                <span>Forget Printer</span>
              </Button>
            </div>
          )}
        </CardContent>
      )}

      {/* Forget Confirmation Alert Dialog */}
      <AlertDialog open={isForgetAlertOpen} onOpenChange={setIsForgetAlertOpen}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-destructive">
              Forget saved printer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will remove <strong>{savedPrinterName}</strong> as the preferred printer. You will need to scan and select the printer again next time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-lg h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmForget}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg h-9"
            >
              Forget Printer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
