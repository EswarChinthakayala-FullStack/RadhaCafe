import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { useReceiptPrintQueue } from '../../../providers/ReceiptPrintQueueProvider';
import { Separator } from '../../ui/separator';
import { SidebarTrigger } from '../../ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../ui/breadcrumb';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../../ui/popover';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { useOfflinePOS } from '../../../providers/OfflineProvider';
import { useDisplayMode } from '../../../hooks/useDisplayMode';
import {
  PrinterIcon,
  RefreshIcon,
  Settings01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
  WifiDisconnected01Icon,
  InvoiceIcon,
  Maximize01Icon,
  Minimize01Icon,
  Download04Icon,
} from '@hugeicons/core-free-icons';
import { allNavItems } from '../../app-sidebar';
import { ROUTES } from '../../../constants/routes';
import { useEffect } from 'react';

function usePageBreadcrumbs() {
  const location = useLocation();
  const currentItem = allNavItems.find((item) => item.url === location.pathname);
  return currentItem?.title ?? 'Dashboard';
}

export function AdminHeader() {
  const navigate = useNavigate();
  const { isOffline: isNetworkOffline, isSyncing, pendingCount } = useOfflinePOS();
  const { totalActiveCount, needsAttentionCount, toggleQueue } = useReceiptPrintQueue();
  const { isFullscreen, toggleFullscreen, canInstall, isStandalone, installApp } = useDisplayMode();
  const {
    status: printerStatus,
    savedPrinterName,
    isConnected,
    isConnecting,
    isReconnecting,
    isOffline: isPrinterOffline,
    isPermissionRequired,
    isPrinting,
    paperWidth,
    reconnectNow,
    printTestReceipt,
  } = useBluetoothPrinter();

  const currentPage = usePageBreadcrumbs();

  // Dynamic window title for native desktop application feel
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${currentPage} — RadhaCafe`;
    }
  }, [currentPage]);

  const getStatusBadge = () => {
    if (isConnected) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0 h-4.5 gap-1 rounded-md">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={10} />
          <span>Ready to print</span>
        </Badge>
      );
    }
    if (isConnecting || isReconnecting) {
      return (
        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0 h-4.5 gap-1 rounded-md animate-pulse">
          <HugeiconsIcon icon={Loading03Icon} size={10} className="animate-spin" />
          <span>Reconnecting...</span>
        </Badge>
      );
    }
    if (isPermissionRequired) {
      return (
        <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0 h-4.5 gap-1 rounded-md">
          <HugeiconsIcon icon={AlertCircleIcon} size={10} />
          <span>Permission Required</span>
        </Badge>
      );
    }
    if (isPrinterOffline) {
      return (
        <Badge variant="outline" className="border-border text-muted-foreground text-[10px] font-medium px-1.5 py-0 h-4.5 gap-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
          <span>Printer Offline</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-border text-muted-foreground text-[10px] px-1.5 py-0 h-4.5 rounded-md">
        <span>Disconnected</span>
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center gap-2 px-4 shrink-0 border-b border-border bg-card/95 backdrop-blur-md shadow-xs">
      {/* Toggle + Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator orientation="vertical" className="h-4 mx-1" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink render={<Link to={ROUTES.ADMIN.DASHBOARD} />}>
                RadhaCafe
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side: persistent network, printer, and app control indicators */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* PWA Install Button (When in browser & install prompt available) */}
        {canInstall && !isStandalone && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={installApp}
            className="h-9 px-2.5 rounded-xl text-xs font-bold border-cinnamon/40 text-cinnamon hover:bg-cinnamon/10 shadow-2xs gap-1.5 hidden md:inline-flex cursor-pointer"
            title="Install RadhaCafe POS Application on this device"
          >
            <HugeiconsIcon icon={Download04Icon} size={14} />
            <span>Install App</span>
          </Button>
        )}

        {/* Focus Mode (Fullscreen Toggle) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 cursor-pointer"
          title={isFullscreen ? 'Exit Focus Mode' : 'Enter Focus Mode (Full Screen)'}
          aria-label={isFullscreen ? 'Exit Focus Mode' : 'Enter Focus Mode'}
        >
          <HugeiconsIcon icon={isFullscreen ? Minimize01Icon : Maximize01Icon} size={16} />
        </Button>

        {/* Network Connectivity Indicator */}
        {isNetworkOffline ? (
          <div className="h-9 px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 border text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-2xs">
            <HugeiconsIcon icon={WifiDisconnected01Icon} size={15} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline font-bold text-[11px]">Offline</span>
            {pendingCount > 0 && (
              <span className="h-4 px-1 rounded bg-amber-600/20 text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </div>
        ) : isSyncing ? (
          <div className="h-9 px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 border text-xs font-semibold bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/40 animate-pulse shadow-2xs">
            <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin text-blue-600" />
            <span className="hidden sm:inline font-bold text-[11px]">Syncing...</span>
          </div>
        ) : null}

        {/* Printer Status Popover */}
        <Popover>
          <PopoverTrigger
            type="button"
            title={`Printer: ${printerStatus.toUpperCase()}${savedPrinterName ? ` (${savedPrinterName})` : ''}`}
            className={`h-9 px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 border text-xs font-semibold transition-all shadow-2xs ${
              needsAttentionCount > 0
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 ring-2 ring-amber-500/20'
                : totalActiveCount > 0
                ? 'bg-cinnamon/15 text-cinnamon border-cinnamon/35 ring-2 ring-cinnamon/15'
                : isConnected
                ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/15'
                : isConnecting || isReconnecting
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
                : printerStatus === 'error' || isPermissionRequired
                ? 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25'
                : 'bg-secondary/60 text-muted-foreground border-border/80 hover:text-foreground hover:bg-secondary'
            }`}
          >
            <HugeiconsIcon
              icon={PrinterIcon}
              size={16}
              className={isConnecting || isReconnecting ? 'animate-pulse text-amber-600' : ''}
            />
            <span className="hidden md:inline font-mono text-[11px] max-w-[120px] truncate">
              {savedPrinterName || (isConnected ? 'Ready' : 'Printer')}
            </span>
            {totalActiveCount > 0 ? (
              <Badge className="bg-cinnamon text-white font-bold text-[9px] px-1.5 py-0 h-4 rounded-full">
                {totalActiveCount}
              </Badge>
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isConnected
                    ? 'bg-emerald-500'
                    : isConnecting || isReconnecting
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-muted-foreground/60'
                }`}
              />
            )}
          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 p-4 bg-card border-border/90 rounded-2xl shadow-xl space-y-3.5">
            {/* Header info */}
            <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-bold text-xs text-foreground truncate">
                  {savedPrinterName || 'Thermal POS Printer'}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {getStatusBadge()}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {paperWidth === 48 ? '80mm' : '58mm'}
                  </span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl border shrink-0 ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-secondary text-muted-foreground border-border/60'
                }`}
              >
                <HugeiconsIcon icon={PrinterIcon} size={18} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={toggleQueue}
                className="w-full text-xs font-bold rounded-xl h-8.5 justify-center gap-1.5 border-cinnamon/40 text-cinnamon hover:bg-cinnamon/10"
              >
                <HugeiconsIcon icon={InvoiceIcon} size={14} />
                <span>View Print Queue ({totalActiveCount})</span>
              </Button>

              {isConnected ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => printTestReceipt('RadhaCafe')}
                  disabled={isPrinting}
                  className="w-full text-xs font-semibold rounded-xl h-8.5 justify-center gap-1.5"
                >
                  {isPrinting ? (
                    <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                  ) : (
                    <HugeiconsIcon icon={PrinterIcon} size={13} />
                  )}
                  <span>{isPrinting ? 'Printing...' : 'Print Test Receipt'}</span>
                </Button>
              ) : isPermissionRequired ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => navigate(ROUTES.ADMIN.PRINTER)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl h-8.5 justify-center gap-1.5 shadow-2xs"
                >
                  <HugeiconsIcon icon={AlertCircleIcon} size={13} />
                  <span>Authorize Printer</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => reconnectNow()}
                  disabled={isConnecting || isReconnecting}
                  className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white text-xs font-bold rounded-xl h-8.5 justify-center gap-1.5 shadow-2xs"
                >
                  <HugeiconsIcon
                    icon={RefreshIcon}
                    size={13}
                    className={isConnecting || isReconnecting ? 'animate-spin' : ''}
                  />
                  <span>{isConnecting || isReconnecting ? 'Reconnecting...' : 'Reconnect Now'}</span>
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.ADMIN.PRINTER)}
                className="w-full text-xs text-muted-foreground hover:text-foreground rounded-xl h-8 justify-center gap-1.5"
              >
                <HugeiconsIcon icon={Settings01Icon} size={13} />
                <span>Printer Settings & Management</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
