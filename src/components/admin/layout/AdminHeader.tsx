import { useLocation, Link } from 'react-router-dom';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
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
import { HugeiconsIcon } from '@hugeicons/react';
import { PrinterIcon } from '@hugeicons/core-free-icons';
import { allNavItems } from '../../app-sidebar';
import { ROUTES } from '../../../constants/routes';

function usePageBreadcrumbs() {
  const location = useLocation();
  const currentItem = allNavItems.find((item) => item.url === location.pathname);
  return currentItem?.title ?? 'Dashboard';
}

export function AdminHeader() {
  const { status: printerStatus, device } = useBluetoothPrinter();
  const currentPage = usePageBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-2 px-4 shrink-0 border-b border-border bg-card/95 backdrop-blur-md shadow-xs">
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

      {/* Right side: printer status icon button linking to printer settings */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to={ROUTES.ADMIN.PRINTER}
          title={`Printer Status: ${printerStatus.toUpperCase()}${device?.name ? ` (${device.name})` : ''}`}
          className={`h-9 w-9 rounded-md flex items-center justify-center border transition-all shadow-2xs ${printerStatus === 'connected'
              ? 'bg-success text-white border-success/30 hover:bg-success/90'
              : printerStatus === 'connecting'
                ? 'bg-amber-500/20 text-amber-700 border-amber-500/40 animate-pulse'
                : printerStatus === 'error'
                  ? 'bg-destructive text-white border-destructive/30 hover:bg-destructive/90'
                  : 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25'
            }`}
        >
          <HugeiconsIcon icon={PrinterIcon} size={18} />
          <span className="sr-only">Printer Status: {printerStatus}</span>
        </Link>
      </div>
    </header>
  );
}
