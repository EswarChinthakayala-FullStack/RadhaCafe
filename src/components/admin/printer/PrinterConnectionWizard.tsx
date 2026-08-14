import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  BluetoothIcon,
  Loading03Icon,
  Shield01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';

interface PrinterConnectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanForPrinter: () => Promise<boolean>;
  savedPrinterName?: string | null;
  isConnecting?: boolean;
}

export function PrinterConnectionWizard({
  open,
  onOpenChange,
  onScanForPrinter,
  savedPrinterName,
  isConnecting = false,
}: PrinterConnectionWizardProps) {
  const handleScanClick = async () => {
    const success = await onScanForPrinter();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/90 rounded-2xl shadow-2xl max-w-lg p-0 overflow-hidden text-foreground">
        {/* Top Header Banner */}
        <div className="p-6 pb-4 bg-gradient-to-b from-cinnamon/10 to-transparent border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/20 text-cinnamon border border-cinnamon/30 shadow-2xs">
              <HugeiconsIcon icon={PrinterIcon} size={22} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                Connect Thermal Printer
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Pair your 58mm or 80mm Bluetooth ESC/POS receipt printer with RadhaCafe POS.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Step-by-Step Setup Guide */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Before Scanning
            </span>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <span className="w-5 h-5 rounded-full bg-cinnamon/15 text-cinnamon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Turn on your printer</p>
                  <p className="text-[11px] text-muted-foreground">
                    Ensure paper roll is loaded and power light is steady.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <span className="w-5 h-5 rounded-full bg-cinnamon/15 text-cinnamon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Enable device Bluetooth</p>
                  <p className="text-[11px] text-muted-foreground">
                    Make sure Bluetooth is active on this computer or tablet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <span className="w-5 h-5 rounded-full bg-cinnamon/15 text-cinnamon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Keep printer nearby</p>
                  <p className="text-[11px] text-muted-foreground">
                    Ensure the printer is within 5 meters and not connected to another device.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What Device to Select Guidance */}
          {savedPrinterName ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <HugeiconsIcon icon={InformationCircleIcon} size={15} />
                <span>Previously Paired Device</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your previously saved printer is <strong className="font-mono font-bold">{savedPrinterName}</strong>. Look for this device name in the browser window.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <HugeiconsIcon icon={InformationCircleIcon} size={15} className="text-cinnamon" />
                <span>What name should I select?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Look for the model code or Bluetooth name printed on your printer manual or sticker (for example: <code className="font-mono bg-background px-1 py-0.5 rounded text-foreground">LT14409632</code>, <code className="font-mono bg-background px-1 py-0.5 rounded text-foreground">MTP-II</code>, or <code className="font-mono bg-background px-1 py-0.5 rounded text-foreground">POS-58</code>).
              </p>
            </div>
          )}

          {/* Browser Notice */}
          <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Shield01Icon} size={15} className="text-muted-foreground shrink-0" />
            <span>
              Chrome or Edge will present a secure device chooser window to grant Bluetooth permission.
            </span>
          </div>

          {/* Bottom Action Trigger (MUST be direct user gesture click) */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isConnecting}
              className="h-10 text-xs rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleScanClick}
              disabled={isConnecting}
              className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-2xs gap-2"
            >
              {isConnecting ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={BluetoothIcon} size={16} />
                  <span>Scan for Printer</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
