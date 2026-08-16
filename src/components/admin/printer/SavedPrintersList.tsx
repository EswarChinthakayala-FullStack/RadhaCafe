import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
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
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  BluetoothIcon,
  StarIcon,
  MoreVerticalIcon,
  Edit02Icon,
  Delete02Icon,
  RefreshIcon,
  PlusSignIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import {
  useSavedPrinters,
  useUpdateSavedPrinter,
  useSetPreferredPrinter,
} from '../../../hooks/useSavedPrinters';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import type { SavedPrinter } from '../../../types';

interface SavedPrintersListProps {
  onAddNewPrinter: () => void;
}

export function SavedPrintersList({ onAddNewPrinter }: SavedPrintersListProps) {
  const { data: savedPrinters, isLoading } = useSavedPrinters();
  const updatePrinterMutation = useUpdateSavedPrinter();
  const setPreferredMutation = useSetPreferredPrinter();

  const {
    device,
    connectedPrinter,
    isConnected,
    isConnecting,
    isPrinting,
    connectSaved,
    disconnect,
    printTestReceipt,
    forgetPrinter,
  } = useBluetoothPrinter();

  // Rename Dialog State
  const [editingPrinter, setEditingPrinter] = useState<SavedPrinter | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [isRenameSubmitting, setIsRenameSubmitting] = useState(false);

  // Remove Alert Dialog State
  const [deletingPrinter, setDeletingPrinter] = useState<SavedPrinter | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Connecting State per printer card
  const [connectingPrinterId, setConnectingPrinterId] = useState<string | null>(null);

  const handleOpenRename = (printer: SavedPrinter) => {
    setEditingPrinter(printer);
    setRenameInput(printer.friendly_name || printer.device_name || '');
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrinter || !renameInput.trim()) return;

    setIsRenameSubmitting(true);
    try {
      await updatePrinterMutation.mutateAsync({
        id: editingPrinter.id,
        updates: { friendly_name: renameInput.trim() },
      });
      toast.add({
        title: 'Printer Renamed',
        description: `Printer label updated to "${renameInput.trim()}".`,
        type: 'success',
      });
      setEditingPrinter(null);
    } catch (err: any) {
      toast.add({
        title: 'Rename Failed',
        description: err.message || 'Unable to update printer name.',
        type: 'error',
      });
    } finally {
      setIsRenameSubmitting(false);
    }
  };

  const handleSetPreferred = async (printer: SavedPrinter) => {
    try {
      await setPreferredMutation.mutateAsync(printer.id);
      toast.add({
        title: 'Preferred Printer Updated',
        description: `"${printer.friendly_name || printer.device_name}" is now the primary receipt printer.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Update Preferred Printer',
        description: err.message || 'Failed to update preferred printer setting.',
        type: 'error',
      });
    }
  };

  const handleConnectPrinter = async (printer: SavedPrinter) => {
    setConnectingPrinterId(printer.id);
    try {
      const success = await connectSaved(printer);
      if (success) {
        toast.add({
          title: 'Printer Connected',
          description: `Connected to ${printer.friendly_name || printer.device_name}. Ready to print!`,
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Connection Notice',
          description: 'Unable to auto-connect. If browser permission was reset, use Scan & Connect.',
          type: 'error',
        });
      }
    } catch (err: any) {
      toast.add({
        title: 'Connection Error',
        description: err.message || 'Failed to connect to printer.',
        type: 'error',
      });
    } finally {
      setConnectingPrinterId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!deletingPrinter) return;
    setIsRemoving(true);
    try {
      await forgetPrinter(deletingPrinter.id, deletingPrinter.device_id);
      toast.add({
        title: 'Printer Removed',
        description: `"${deletingPrinter.friendly_name || deletingPrinter.device_name}" removed from saved printers.`,
        type: 'success',
      });
      setDeletingPrinter(null);
    } catch (err: any) {
      toast.add({
        title: 'Removal Failed',
        description: err.message || 'Unable to remove printer.',
        type: 'error',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const formatLastConnected = (isoDate: string | null | undefined) => {
    if (!isoDate) return 'Never connected';
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/60">
          <Skeleton className="h-6 w-44 rounded-lg" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const printers = savedPrinters || [];

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
              <HugeiconsIcon icon={PrinterIcon} size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-bold font-heading text-foreground break-words leading-tight flex items-center gap-2">
                <span>Saved Bluetooth Printers</span>
                {printers.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] font-mono font-bold px-1.5 py-0 rounded-md">
                    {printers.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 leading-relaxed">
                Remembered thermal printers. RadhaCafe automatically reconnects to your preferred printer.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={onAddNewPrinter}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-9 px-3.5 shadow-2xs gap-1.5 self-start sm:self-auto shrink-0"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={15} />
            <span>Add Printer</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-3">
        {printers.length === 0 ? (
          <div className="p-8 sm:p-10 text-center rounded-xl border border-dashed border-border/80 bg-secondary/20 space-y-3">
            <div className="w-12 h-12 rounded-full bg-cinnamon/10 text-cinnamon flex items-center justify-center mx-auto border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={BluetoothIcon} size={22} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-sm text-foreground font-heading">
                No Saved Printers Yet
              </h3>
              <p className="text-xs text-muted-foreground">
                Connect your Bluetooth thermal receipt printer once. RadhaCafe will verify, remember, and auto-reconnect it.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={onAddNewPrinter}
              className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm gap-1.5"
            >
              <HugeiconsIcon icon={BluetoothIcon} size={14} />
              <span>Connect First Printer</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {printers.map((printer) => {
              const isCurrentConnected =
                (isConnected && connectedPrinter?.id === printer.id) ||
                (isConnected && device?.id === printer.device_id);
              const isCurrentConnecting = connectingPrinterId === printer.id || (isConnecting && device?.id === printer.device_id);
              const isPreferred = Boolean(printer.is_preferred);

              return (
                <div
                  key={printer.id}
                  className={`rounded-xl border p-3 sm:p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrentConnected
                      ? 'border-emerald-500/50 bg-emerald-500/[0.03] shadow-xs'
                      : isPreferred
                      ? 'border-cinnamon/40 bg-card shadow-2xs'
                      : 'border-border/70 bg-card/60 hover:bg-card'
                  }`}
                >
                  {/* Left: Printer Identity + Badges + Metadata */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 border mt-0.5 sm:mt-0 ${
                        isCurrentConnected
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : 'bg-secondary/60 text-muted-foreground border-border/60'
                      }`}
                    >
                      <HugeiconsIcon icon={PrinterIcon} size={18} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-bold text-sm text-foreground truncate max-w-[220px] sm:max-w-[300px]">
                          {printer.friendly_name || printer.device_name || 'Thermal Printer'}
                        </span>

                        {/* Preferred Badge */}
                        {isPreferred && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-1.5 py-0 rounded gap-1 flex items-center shrink-0"
                            title="RadhaCafe tries this preferred printer first"
                          >
                            <HugeiconsIcon icon={StarIcon} size={10} className="fill-current" />
                            <span>Preferred</span>
                          </Badge>
                        )}

                        {/* Connection Status Badge */}
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-1.5 py-0 rounded shrink-0 ${
                            isCurrentConnected
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-secondary/80 text-muted-foreground border-border/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 shrink-0 ${
                              isCurrentConnected ? 'bg-emerald-500' : 'bg-muted-foreground/60'
                            }`}
                          />
                          <span>{isCurrentConnected ? 'Connected' : 'Offline'}</span>
                        </Badge>
                      </div>

                      {/* Subtitle Details: Bluetooth Device Name + Paper Width + Last Used */}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                        {printer.device_name && (
                          <span className="font-mono text-foreground/80 truncate max-w-[140px]">
                            {printer.device_name}
                          </span>
                        )}
                        <span className="text-border">•</span>
                        <span className="font-mono">
                          {printer.paper_width === 48 ? '80mm (48 col)' : '58mm (32 col)'}
                        </span>
                        <span className="text-border">•</span>
                        <span>Last used {formatLastConnected(printer.last_connected_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/40 justify-end">
                    {isCurrentConnected ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => printTestReceipt('RadhaCafe')}
                          disabled={isPrinting}
                          className="h-8 text-xs font-semibold rounded-lg border-border/80 px-2.5"
                        >
                          {isPrinting ? (
                            <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin mr-1" />
                          ) : (
                            <HugeiconsIcon icon={PrinterIcon} size={13} className="mr-1" />
                          )}
                          <span>Test</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={disconnect}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg border-border/80 px-2.5"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnectPrinter(printer)}
                        disabled={isCurrentConnecting}
                        className="h-8 text-xs font-bold rounded-lg border-cinnamon/30 bg-cinnamon/5 hover:bg-cinnamon/10 text-cinnamon px-3 gap-1 shadow-2xs"
                      >
                        {isCurrentConnecting ? (
                          <>
                            <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon icon={RefreshIcon} size={13} />
                            <span>Connect</span>
                          </>
                        )}
                      </Button>
                    )}

                    {/* More Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        type="button"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                        aria-label="Printer options"
                      >
                        <HugeiconsIcon icon={MoreVerticalIcon} size={15} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border-border/80 rounded-xl shadow-lg">
                        {!isPreferred && (
                          <DropdownMenuItem
                            onClick={() => handleSetPreferred(printer)}
                            className="text-xs font-medium cursor-pointer gap-2 py-2"
                          >
                            <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-600" />
                            <span>Set as Preferred</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => handleOpenRename(printer)}
                          className="text-xs font-medium cursor-pointer gap-2 py-2"
                        >
                          <HugeiconsIcon icon={Edit02Icon} size={14} />
                          <span>Rename Printer</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            if (isCurrentConnected) {
                              printTestReceipt('RadhaCafe');
                            } else {
                              handleConnectPrinter(printer);
                            }
                          }}
                          className="text-xs font-medium cursor-pointer gap-2 py-2"
                        >
                          <HugeiconsIcon icon={PrinterIcon} size={14} />
                          <span>{isCurrentConnected ? 'Print Test Receipt' : 'Connect & Test'}</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeletingPrinter(printer)}
                          className="text-xs font-medium text-destructive focus:text-destructive cursor-pointer gap-2 py-2"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                          <span>Remove from RadhaCafe</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Rename Printer Dialog */}
      <Dialog open={Boolean(editingPrinter)} onOpenChange={(open) => !open && setEditingPrinter(null)}>
        <DialogContent className="bg-card border-border/90 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-base text-foreground">
              Rename Saved Printer
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Give this printer a custom label like "Main Counter", "Kitchen", or "Barista Desk".
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRename} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="friendly-name" className="text-xs font-bold text-foreground">
                Printer Label
              </Label>
              <Input
                id="friendly-name"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="e.g. Counter Printer"
                className="h-10 text-xs rounded-xl bg-background border-border/80"
                maxLength={40}
                required
                autoFocus
              />
              {editingPrinter?.device_name && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  Hardware Bluetooth Name: {editingPrinter.device_name}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingPrinter(null)}
                className="text-xs rounded-xl h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isRenameSubmitting || !renameInput.trim()}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-xs"
              >
                {isRenameSubmitting ? 'Saving...' : 'Save Label'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingPrinter)} onOpenChange={(open) => !open && setDeletingPrinter(null)}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-destructive">
              Remove Saved Printer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-1.5">
              <p>
                Are you sure you want to remove{' '}
                <strong>{deletingPrinter?.friendly_name || deletingPrinter?.device_name}</strong> from RadhaCafe?
              </p>
              <p className="text-[11px]">
                RadhaCafe will no longer remember this device for automatic connection. You can pair it again at any time.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-xl h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-xl h-9"
            >
              {isRemoving ? 'Removing...' : 'Remove Printer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
