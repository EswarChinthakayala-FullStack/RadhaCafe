import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, type PaymentFormData } from '../../../validators/paymentSchema';
import { useRecordPayment } from '../../../hooks/usePayments';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import type { Customer, Order } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SquareLockCheckIcon,
  InvoiceIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';

interface ReceivePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  order?: Order | null;
  onSuccess?: () => void;
}

export function ReceivePaymentDialog({
  open,
  onOpenChange,
  customer,
  order,
  onSuccess,
}: ReceivePaymentDialogProps) {
  const recordPaymentMutation = useRecordPayment();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentDue = order ? Number(order.due_amount || 0) : Number(customer.total_due || 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: currentDue > 0 ? currentDue : 0,
      payment_method: 'cash',
      notes: '',
    },
  });

  const enteredAmount = watch('amount') || 0;
  const remainingDue = Math.max(0, currentDue - enteredAmount);

  const onSubmit = async (data: PaymentFormData) => {
    setErrorMsg(null);

    if (data.amount > currentDue) {
      setErrorMsg(`Payment amount (${formatCurrency(data.amount)}) cannot exceed outstanding balance (${formatCurrency(currentDue)}).`);
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        customer_id: customer.id,
        order_id: order?.id || null,
        amount: data.amount,
        payment_method: data.payment_method,
        notes: data.notes?.trim() || null,
      });

      toast.add({
        title: 'Payment Recorded',
        description: `Successfully collected ${formatCurrency(data.amount)} for ${customer.name}.`,
        type: 'success',
      });

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record payment transaction.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border/80 rounded-md p-6 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="w-10 h-10 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center mb-2 shadow-2xs">
            <HugeiconsIcon icon={SquareLockCheckIcon} size={20} />
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-foreground">
            Receive Payment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Collect payment against outstanding balance for{' '}
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
              <HugeiconsIcon icon={UserIcon} size={14} className="text-cinnamon" />
              <span>Customer</span>
            </span>
            <span className="font-bold text-foreground">{customer.name}</span>
          </div>

          {order && (
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={InvoiceIcon} size={14} className="text-cinnamon" />
                <span>Order #</span>
              </span>
              <span className="font-bold font-mono text-cinnamon">{order.order_number}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-muted-foreground border-t border-border/40 pt-2">
            <span>Current Outstanding</span>
            <span className="font-bold text-base text-cinnamon">{formatCurrency(currentDue)}</span>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span>Payment Amount</span>
            <span className="font-bold text-emerald-6-00 dark:text-emerald-400">
              -{formatCurrency(enteredAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center font-bold text-xs pt-1.5 border-t border-border/40 text-foreground">
            <span>Remaining Due</span>
            <span className={remainingDue === 0 ? 'text-emerald-500 font-extrabold' : 'text-amber-500 font-extrabold'}>
              {formatCurrency(remainingDue)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Payment Amount Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="pay-amount" className="text-xs font-semibold">
                Amount Received (₹) *
              </Label>
              <button
                type="button"
                onClick={() => setValue('amount', currentDue)}
                className="text-[11px] font-bold text-cinnamon hover:underline"
              >
                Pay Full ({formatCurrency(currentDue)})
              </button>
            </div>
            <Input
              id="pay-amount"
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

          {/* Payment Method Selector (Cash, UPI, Card, Other) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Collection Payment Method *</Label>
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
                        ? 'bg-cinnamon text-white uppercase font-bold text-[10px] h-9 rounded-lg shadow-xs'
                        : 'uppercase text-[10px] h-9 text-foreground/80 rounded-lg'
                    }
                    onClick={() => setValue('payment_method', method)}
                  >
                    {method}
                  </Button>
                );
              })}
            </div>
            {errors.payment_method && (
              <p className="text-[11px] text-destructive font-medium">{errors.payment_method.message}</p>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="pay-notes" className="text-xs font-semibold">
              Payment Notes (Optional)
            </Label>
            <Textarea
              id="pay-notes"
              placeholder="e.g. Received via GPay / Cash handed at counter"
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
              className="h-9 text-xs bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-md shadow-xs"
            >
              {isSubmitting || recordPaymentMutation.isPending ? 'Recording...' : `Record ${formatCurrency(enteredAmount)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
