import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MoreVerticalIcon,
  SmartPhoneIcon,
  CallIcon,
  Copy01Icon,
  ShoppingBag01Icon,
  Edit02Icon,
  ArrowRight01Icon,
  EyeIcon,
  SquareLockCheckIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';
import type { Customer } from '../../../types';

interface CustomerTableProps {
  customers: Customer[];
  onReceivePayment: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function CustomerTable({
  customers,
  onReceivePayment,
  onEditCustomer,
}: CustomerTableProps) {
  const navigate = useNavigate();

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    toast.add({
      title: 'Copied to Clipboard',
      description: `Phone number ${phone} copied.`,
      type: 'success',
    });
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead className="font-bold text-xs text-foreground min-w-[200px]">Customer</TableHead>
            <TableHead className="font-bold text-xs text-foreground min-w-[140px]">Phone</TableHead>
            <TableHead className="font-bold text-xs text-foreground text-center min-w-[90px]">Orders</TableHead>
            <TableHead className="font-bold text-xs text-foreground text-right min-w-[120px]">Lifetime Spend</TableHead>
            <TableHead className="font-bold text-xs text-foreground text-right min-w-[130px]">Outstanding</TableHead>
            <TableHead className="font-bold text-xs text-foreground min-w-[120px]">Last Order</TableHead>
            <TableHead className="font-bold text-xs text-foreground text-right min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const due = Number(customer.total_due || 0);
            const hasDue = due > 0;
            const initials = getInitials(customer.name);
            const orderCount = customer.total_orders || 0;

            return (
              <TableRow
                key={customer.id}
                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                className="cursor-pointer border-border/60 hover:bg-secondary/40 transition-colors group"
              >
                {/* Customer Name & Avatar */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-foreground truncate group-hover:text-cinnamon transition-colors">
                        {customer.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Customer since {formatDate(customer.created_at, 'MMM yyyy')}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Phone & Quick Actions */}
                <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                    <a
                      href={`tel:${customer.phone}`}
                      className="hover:text-cinnamon hover:underline flex items-center gap-1"
                      title="Call customer"
                    >
                      <HugeiconsIcon icon={SmartPhoneIcon} size={13} className="text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={(e) => handleCopyPhone(customer.phone, e)}
                      className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                      title="Copy phone"
                      aria-label="Copy phone number"
                    >
                      <HugeiconsIcon icon={Copy01Icon} size={12} />
                    </button>
                  </div>
                </TableCell>

                {/* Order Count */}
                <TableCell className="py-3 text-center">
                  <Badge variant="outline" className="font-mono text-xs bg-secondary/40 font-semibold">
                    {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                  </Badge>
                </TableCell>

                {/* Lifetime Spend */}
                <TableCell className="py-3 text-right font-mono text-xs font-semibold text-foreground">
                  {formatCurrency(customer.total_spent || 0)}
                </TableCell>

                {/* Outstanding Balance */}
                <TableCell className="py-3 text-right font-mono text-xs">
                  {hasDue ? (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                      {formatCurrency(due)} due
                    </Badge>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      No dues
                    </span>
                  )}
                </TableCell>

                {/* Last Order Date */}
                <TableCell className="py-3 text-xs text-muted-foreground">
                  {customer.last_order_at ? formatDate(customer.last_order_at, 'dd MMM yyyy') : 'No orders yet'}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      className="h-8 text-xs font-semibold rounded-lg gap-1 border-border/80 hover:bg-secondary"
                    >
                      <span>View</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                            aria-label="More options"
                          />
                        }
                      >
                        <HugeiconsIcon icon={MoreVerticalIcon} size={15} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border border-border/80 text-xs">
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/customers/${customer.id}`)}
                          className="gap-2 cursor-pointer font-medium"
                        >
                          <HugeiconsIcon icon={EyeIcon} size={14} className="text-cinnamon" />
                          <span>View Details & Ledger</span>
                        </DropdownMenuItem>

                        {hasDue && (
                          <DropdownMenuItem
                            onClick={() => onReceivePayment(customer)}
                            className="gap-2 cursor-pointer font-bold text-amber-600 dark:text-amber-400"
                          >
                            <HugeiconsIcon icon={SquareLockCheckIcon} size={14} />
                            <span>Receive Payment</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/orders/new?customer=${customer.id}`)}
                          className="gap-2 cursor-pointer font-medium"
                        >
                          <HugeiconsIcon icon={ShoppingBag01Icon} size={14} className="text-primary" />
                          <span>New Cafe Order</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onEditCustomer(customer)}
                          className="gap-2 cursor-pointer font-medium"
                        >
                          <HugeiconsIcon icon={Edit02Icon} size={14} />
                          <span>Edit Customer Profile</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => {
                            window.location.href = `tel:${customer.phone}`;
                          }}
                          className="gap-2 cursor-pointer font-medium"
                        >
                          <HugeiconsIcon icon={CallIcon} size={14} className="text-muted-foreground" />
                          <span>Call Customer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
