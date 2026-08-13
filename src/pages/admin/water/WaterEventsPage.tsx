import { useState } from 'react';
import { useWaterEvents, useUpdateWaterEventStatus } from '../../../hooks/useWaterEvents';
import { formatDate } from '../../../lib/utils/formatDate';
import type { WaterEventStatus } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Calendar01Icon,
  SmartPhoneIcon,
  Location01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../../components/ui/toast';

export function WaterEventsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: events, isLoading, isError, error } = useWaterEvents(statusFilter);
  const updateStatusMutation = useUpdateWaterEventStatus();

  const handleUpdateStatus = async (id: string, newStatus: WaterEventStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.add({
        title: 'Status Updated',
        description: `Event request marked as ${newStatus}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Update Failed',
        description: err.message || 'Failed to update status.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={SparklesIcon} size={22} />
            </div>
            <span>Bulk Water Supply & Event Requests</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage incoming event inquiries from the public website for weddings, parties, corporate functions, and large gatherings.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60">
        {(['all', 'new', 'contacted', 'confirmed', 'completed', 'cancelled'] as const).map((st) => {
          const isSelected = statusFilter === st;
          const label = st === 'all' ? 'All Inquiries' : st.toUpperCase();
          return (
            <Button
              key={st}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              size="xs"
              className={
                isSelected
                  ? 'bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-8 rounded-lg shadow-2xs px-3 whitespace-nowrap'
                  : 'text-xs h-8 text-foreground/80 rounded-lg px-3 whitespace-nowrap'
              }
              onClick={() => setStatusFilter(st)}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-md" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-card rounded-md border border-destructive/20 text-destructive text-xs">
          <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-8 h-8 mb-2" />
          <p className="font-bold">Failed to load event requests</p>
          <p className="text-muted-foreground">{(error as any)?.message}</p>
        </div>
      ) : !events || events.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-md border border-dashed border-border/80 space-y-2">
          <HugeiconsIcon icon={SparklesIcon} className="mx-auto w-10 h-10 text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">No event requests in this category</p>
          <p className="text-xs text-muted-foreground">Inquiries submitted via the public /water page will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => {
            return (
              <Card key={evt.id} className="border border-border/80 bg-card rounded-md shadow-2xs space-y-3">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cinnamon/15 text-cinnamon border-cinnamon/30 text-xs font-bold">
                          {evt.event_type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            evt.status === 'new'
                              ? 'bg-amber-500/10 text-amber-700 border-amber-500/30 font-bold uppercase text-[10px]'
                              : evt.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-bold uppercase text-[10px]'
                              : 'uppercase text-[10px] font-bold'
                          }
                        >
                          {evt.status}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base text-foreground font-heading">{evt.customer_name}</h3>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Estimated Cans</p>
                      <p className="text-lg font-bold font-heading text-cinnamon">
                        {evt.estimated_quantity} Cans
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-secondary/40 p-3 rounded-md border border-border/40">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <HugeiconsIcon icon={SmartPhoneIcon} size={13} className="text-cinnamon" />
                        <span>Phone:</span>
                      </span>
                      <span className="font-bold font-mono text-foreground">{evt.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-cinnamon" />
                        <span>Event Date:</span>
                      </span>
                      <span className="font-bold text-foreground">{formatDate(evt.event_date)}</span>
                    </div>

                    <div className="flex items-start justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium shrink-0">
                        <HugeiconsIcon icon={Location01Icon} size={13} className="text-cinnamon" />
                        <span>Location:</span>
                      </span>
                      <span className="font-semibold text-foreground text-right">{evt.location}</span>
                    </div>

                    {evt.notes && (
                      <div className="pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground italic">
                        "{evt.notes}"
                      </div>
                    )}
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
                    <span className="text-[10px] text-muted-foreground">
                      Received {formatDate(evt.created_at)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {evt.status === 'new' && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleUpdateStatus(evt.id, 'contacted')}
                          className="h-7 text-[11px] font-semibold rounded-md"
                        >
                          Mark Contacted
                        </Button>
                      )}
                      {evt.status === 'contacted' && (
                        <Button
                          size="xs"
                          onClick={() => handleUpdateStatus(evt.id, 'confirmed')}
                          className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md"
                        >
                          Mark Confirmed
                        </Button>
                      )}
                      {evt.status === 'confirmed' && (
                        <Button
                          size="xs"
                          onClick={() => handleUpdateStatus(evt.id, 'completed')}
                          className="h-7 text-[11px] bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-md"
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
