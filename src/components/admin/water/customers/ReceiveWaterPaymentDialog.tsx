import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waterPaymentSchema, type WaterPaymentFormData } from '../../../../validators/waterSchema';
import { useRecordWaterPayment } from '../../../../hooks/useWaterPayments';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import type { WaterCustomer, WaterOrder } from '../../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { SquareLockCheckIcon, InvoiceIcon, UserIcon } from '@hugeicons/core-free-icons';
import { toast } from '../../../ui/toast';

interface ReceiveWaterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: WaterCustomer;
  order?: WaterOrder | null;
  onSuccess?: () => void;
}

export function ReceiveWaterPaymentDialog({
  open,
  onOpenChange,
  customer,
  order,
  onSuccess,
}: ReceiveWaterPaymentDialogProps) {
  const recordPaymentMutation = useRecordWaterPayment();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentDue = order ? Number(order.amount_due || 0) : Number(customer.total_due || 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WaterPaymentFormData>({
    resolver: zodResolver(waterPaymentSchema),
    defaultValues: {
      amount: currentDue > 0 ? currentDue : 0,
      payment_method: 'cash',
      notes: '',
    },
  });

  const enteredAmount = watch('amount') || 0;
  const remainingDue = Math.max(0, currentDue - enteredAmount);

  const onSubmit = async (data: WaterPaymentFormData) => {
    setErrorMsg(null);

    if (data.amount > currentDue) {
      setErrorMsg(`Payment amount (${formatCurrency(data.amount)}) cannot exceed outstanding balance (${formatCurrency(currentDue)}).`);
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        customer_id: customer.id,
        water_order_id: order?.id || null,
        amount: data.amount,
        payment_method: data.payment_method,
        notes: data.notes?.trim() || null,
      });

      toast.add({
        title: 'Water Payment Recorded',
        description: `Successfully collected ${formatCurrency(data.amount)} for ${customer.name}.`,
        type: 'success',
      });

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record water payment transaction.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border/80 rounded-md p-6 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center mb-2 shadow-2xs">
            <HugeiconsIcon icon={SquareLockCheckIcon} size={20} />
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-foreground">
            Receive Water Payment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Collect payment against outstanding water balance for{' '}
            <span className="font-semibold text-foreground">{customer.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Live Calculation Header Card */}
        <div className="p-3.5 rounded-lg bg-secondary/50 border border-border/60 space-y-2 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={UserIcon} size={14} className="text-sky-500" />
              <span>Customer</span>
            </span>
            <span className="font-bold text-foreground">{customer.name}</span>
          </div>

          {order && (
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={InvoiceIcon} size={14} className="text-sky-500" />
                <span>Water Order #</span>
              </span>
              <span className="font-bold font-mono text-sky-600 dark:text-sky-400">{order.order_number}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-muted-foreground border-t border-border/40 pt-2">
            <span>Current Water Due</span>
            <span className="font-bold text-base text-amber-600 dark:text-amber-400">{formatCurrency(currentDue)}</span>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span>Collection Amount</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              -{formatCurrency(enteredAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center font-bold text-xs pt-1.5 border-t border-border/40 text-foreground">
            <span>Remaining Water Due</span>
            <span className={remainingDue === 0 ? 'text-emerald-500 font-extrabold' : 'text-amber-500 font-extrabold'}>
              {formatCurrency(remainingDue)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="w-pay-amount" className="text-xs font-semibold">
                Amount Received (₹) *
              </Label>
              <button
                type="button"
                onClick={() => setValue('amount', currentDue)}
                className="text-[11px] font-bold text-sky-600 hover:underline"
              >
                Pay Full ({formatCurrency(currentDue)})
              </button>
            </div>
            <Input
              id="w-pay-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={currentDue}
              {...register('amount', { valueAsNumber: true })}
              className="h-10 text-xs bg-background rounded-md font-bold text-foreground"
            />
            {errors.amount && (
              <p className="text-[11px] text-destructive font-medium">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Collection Method *</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['cash', 'upi', 'card', 'other'] as const).map((method) => {
                const currentMethod = watch('payment_method');
                const isSelected = currentMethod === method;
                return (
                  <Button
                    key={method}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="xs"
                    className={
                      isSelected
                        ? 'bg-sky-600 text-white uppercase font-bold text-[10px] h-9 rounded-lg shadow-xs'
                        : 'uppercase text-[10px] h-9 text-foreground/80 rounded-lg'
                    }
                    onClick={() => setValue('payment_method', method)}
                  >
                    {method}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="w-pay-notes" className="text-xs font-semibold">
              Payment Notes (Optional)
            </Label>
            <Textarea
              id="w-pay-notes"
              placeholder="e.g. Received via GPay for 20L cans delivery"
              rows={2}
              {...register('notes')}
              className="text-xs bg-background rounded-md resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || recordPaymentMutation.isPending || enteredAmount <= 0}
              className="h-9 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-md shadow-xs"
            >
              {isSubmitting || recordPaymentMutation.isPending ? 'Recording...' : `Record ${formatCurrency(enteredAmount)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
