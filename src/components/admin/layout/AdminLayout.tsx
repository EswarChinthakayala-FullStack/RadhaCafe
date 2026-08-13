import type { ReactNode } from 'react';
import { TooltipProvider } from '../../ui/tooltip';
import { SidebarProvider, SidebarInset } from '../../ui/sidebar';
import { AppSidebar } from '../../app-sidebar';
import { AdminHeader } from './AdminHeader';
import { useRealtimeOrders } from '../../../hooks/useRealtimeOrders';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useRealtimeOrders();

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-svh min-w-0 w-full overflow-x-hidden">
          {/* Sticky top nav — same h-14 as sidebar header for border alignment */}
          <AdminHeader />

          {/* Scrollable main content area */}
          <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
