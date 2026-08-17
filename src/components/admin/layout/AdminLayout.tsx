import type { ReactNode } from 'react';
import { TooltipProvider } from '../../ui/tooltip';
import { SidebarProvider, SidebarInset } from '../../ui/sidebar';
import { AppSidebar } from '../../app-sidebar';
import { AdminHeader } from './AdminHeader';
import { useRealtimeOrders } from '../../../hooks/useRealtimeOrders';
import { PrinterSessionProvider } from '../../../providers/PrinterSessionProvider';
import { ReceiptPrintQueueProvider } from '../../../providers/ReceiptPrintQueueProvider';
import { OfflineProvider } from '../../../providers/OfflineProvider';
import { OfflineStatusBar } from '../offline/OfflineStatusBar';
import { useAppScaleGuard } from '../../../hooks/useAppScaleGuard';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useRealtimeOrders();
  useAppScaleGuard();

  return (
    <OfflineProvider>
      <PrinterSessionProvider>
        <ReceiptPrintQueueProvider>
          <TooltipProvider>
            <SidebarProvider defaultOpen={true}>
              <AppSidebar />
              <SidebarInset className="flex flex-col h-svh max-h-svh min-w-0 w-full overflow-hidden">
                {/* Fixed top nav — same h-14 as sidebar header for border alignment */}
                <AdminHeader />

                {/* Non-blocking offline & sync status bar */}
                <OfflineStatusBar />

                {/* Scrollable main content area */}
                <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </ReceiptPrintQueueProvider>
      </PrinterSessionProvider>
    </OfflineProvider>
  );
}
