import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, type PaymentFormData } from '../../../validators/paymentSchema';
import { useRecordPayment } from '../../../hooks/usePayments';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import type { Customer, Order } from '../../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SquareLockCheckIcon,
  InvoiceIcon,
  UserIcon,
  Wallet01Icon,
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

  // Sync default amount when customer/order changes or dialog opens
  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      reset({
        amount: currentDue > 0 ? currentDue : 0,
        payment_method: 'cash',
        notes: '',
      });
    }
  }, [open, currentDue, reset]);

  const enteredAmount = watch('amount') || 0;
  const remainingDue = Math.max(0, currentDue - enteredAmount);

  const onSubmit = async (data: PaymentFormData) => {
    setErrorMsg(null);

    if (data.amount > currentDue) {
      setErrorMsg(
        `Payment amount (${formatCurrency(data.amount)}) cannot exceed outstanding balance (${formatCurrency(currentDue)}).`
      );
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
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl md:max-w-3xl bg-card border border-border/80 rounded-2xl p-0 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Responsive Side-by-Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-0 flex-1 overflow-y-auto">
          {/* Left Column: Account & Live Calculation Panel */}
          <div className="md:col-span-5 bg-secondary/30 p-5 sm:p-6 border-b md:border-b-0 md:border-r border-border/80 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Header */}
              <DialogHeader className="space-y-1 text-left p-0">
                <div className="w-10 h-10 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center mb-1 shadow-2xs">
                  <HugeiconsIcon icon={SquareLockCheckIcon} size={20} />
                </div>
                <DialogTitle className="text-xl font-bold font-heading text-foreground">
                  Receive Payment
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Collect payment against outstanding customer balance.
                </DialogDescription>
              </DialogHeader>

              {/* Live Calculation Summary Card */}
              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2.5 text-xs shadow-2xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <HugeiconsIcon icon={UserIcon} size={14} className="text-cinnamon shrink-0" />
                    <span>Customer</span>
                  </span>
                  <span className="font-bold text-foreground truncate max-w-[130px]">{customer.name}</span>
                </div>

                {order && (
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <HugeiconsIcon icon={InvoiceIcon} size={14} className="text-cinnamon shrink-0" />
                      <span>Order #</span>
                    </span>
                    <span className="font-mono font-bold text-cinnamon">{order.order_number}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-muted-foreground border-t border-border/60 pt-2">
                  <span>Current Outstanding</span>
                  <span className="font-mono font-bold text-base text-cinnamon">
                    {formatCurrency(currentDue)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Payment Amount</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(enteredAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center font-bold text-xs pt-2 border-t border-border/60 text-foreground">
                  <span>Remaining Due</span>
                  <span
                    className={`font-mono font-extrabold text-sm ${
                      remainingDue === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {formatCurrency(remainingDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Helpful Helper Guidance */}
            <div className="p-3 rounded-lg bg-cinnamon/5 border border-cinnamon/15 text-[11px] text-muted-foreground flex items-start gap-2">
              <HugeiconsIcon icon={Wallet01Icon} size={14} className="text-cinnamon shrink-0 mt-0.5" />
              <span>
                Payment will be automatically credited to this customer's account and updated in the credit ledger.
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Collection Form */}
          <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Payment Amount Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="pay-amount" className="text-xs font-semibold text-foreground">
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
                    className="h-10 text-sm bg-background rounded-lg font-bold font-mono text-foreground"
                    placeholder="Enter amount..."
                  />
                  {errors.amount && (
                    <p className="text-[11px] text-destructive font-medium">{errors.amount.message}</p>
                  )}
                </div>

                {/* Collection Payment Method Selector (Cash, UPI, Card, Other) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Payment Method *</Label>
                  <div className="grid grid-cols-4 gap-2">
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
                              ? 'bg-cinnamon hover:bg-cinnamon/90 text-white uppercase font-bold text-xs h-10 rounded-lg shadow-xs'
                              : 'uppercase text-xs h-10 text-foreground/80 rounded-lg border-border/80 hover:bg-secondary'
                          }
                          onClick={() => setValue('payment_method', method)}
                        >
                          {method}
                        </Button>
                      );
                    })}
                  </div>
                  {errors.payment_method && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.payment_method.message}
                    </p>
                  )}
                </div>

                {/* Optional Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="pay-notes" className="text-xs font-semibold text-foreground">
                    Payment Notes (Optional)
                  </Label>
                  <Textarea
                    id="pay-notes"
                    placeholder="e.g. Received via PhonePe / Cash handed over at counter"
                    rows={3}
                    {...register('notes')}
                    className="text-xs bg-background rounded-lg resize-none"
                  />
                </div>
              </div>

              {/* Form Footer Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-10 text-xs rounded-lg px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || recordPaymentMutation.isPending || enteredAmount <= 0}
                  className="h-10 text-xs bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-lg px-5 shadow-xs"
                >
                  {isSubmitting || recordPaymentMutation.isPending
                    ? 'Recording...'
                    : `Record ${formatCurrency(enteredAmount)}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
