import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { toast } from '../../ui/toast';
import { ReceiptPreview } from './ReceiptPreview';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings01Icon,
  FileAttachmentIcon,
  ArrowRight01Icon,
  Coffee02Icon,
} from '@hugeicons/core-free-icons';
import type { ReceiptTemplateConfig } from '../../../types';

interface PrinterReceiptSettingsProps {
  paperWidth: number;
  autoConnect: boolean;
  onPaperWidthChange: (width: number) => Promise<void>;
  onAutoConnectChange: (enabled: boolean) => Promise<void>;
  activeTemplateConfig?: ReceiptTemplateConfig | null;
  activeTemplateName?: string;
  cafeSettings?: any;
}

export function PrinterReceiptSettings({
  paperWidth,
  autoConnect,
  onPaperWidthChange,
  onAutoConnectChange,
  activeTemplateConfig,
  activeTemplateName = 'Classic Receipt',
  cafeSettings,
}: PrinterReceiptSettingsProps) {
  const navigate = useNavigate();
  const [localWidth, setLocalWidth] = useState(paperWidth);
  const [localAutoConnect, setLocalAutoConnect] = useState(autoConnect);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalWidth(paperWidth);
  }, [paperWidth]);

  useEffect(() => {
    setLocalAutoConnect(autoConnect);
  }, [autoConnect]);

  const handleWidthSelect = async (width: number) => {
    setLocalWidth(width);
    setIsSaving(true);
    try {
      await onPaperWidthChange(width);
      toast.add({
        title: 'Paper Width Saved',
        description: `Receipt printing set to ${width === 48 ? '80mm (48 columns)' : '58mm (32 columns)'}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Paper Width',
        description: err.message || 'Failed to update settings.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutoConnect = async (checked: boolean) => {
    setLocalAutoConnect(checked);
    try {
      await onAutoConnectChange(checked);
      toast.add({
        title: 'Preference Saved',
        description: checked
          ? 'RadhaCafe will automatically attempt to reconnect to preferred printer.'
          : 'Auto-connect disabled.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Preference',
        description: err.message || 'Failed to update settings.',
        type: 'error',
      });
    }
  };

  // Sample order data for live preview
  const sampleOrder = {
    id: 'sample-001',
    order_number: 'RC-1042',
    customer_name: 'Aditya Sharma',
    customer_phone: '9845012345',
    status: 'completed',
    subtotal: 290,
    tax: 14.5,
    discount: 0,
    total: 304.5,
    payment_method: 'upi',
    created_at: new Date().toISOString(),
    items: [
      { name: 'Special Masala Chai', quantity: 2, unit_price: 35, total_price: 70 },
      { name: 'Paneer Tikka Sandwich', quantity: 1, unit_price: 130, total_price: 130 },
      { name: 'Cold Coffee with Ice Cream', quantity: 1, unit_price: 90, total_price: 90 },
    ],
  };

  return (
    <div className="space-y-4">
      {/* 1. Configuration Controls Card */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Settings01Icon} size={18} />
            </div>
            <div>
              <CardTitle className="text-base font-bold font-heading text-foreground">
                Receipt & Paper Setup
              </CardTitle>
              <CardDescription className="text-xs">
                Configure thermal roll width, auto-reconnect, and active receipt template.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Paper Width Selection (Segmented UI) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground block">
              Paper Roll Width
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Select the paper roll size loaded in your thermal receipt printer.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleWidthSelect(32)}
                disabled={isSaving}
                className={`p-3 rounded-xl border text-left transition-all ${
                  localWidth === 32
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">58 mm Roll</span>
                  <Badge variant={localWidth === 32 ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0 h-4">
                    32 Cols
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Standard compact receipt width</p>
              </button>

              <button
                type="button"
                onClick={() => handleWidthSelect(48)}
                disabled={isSaving}
                className={`p-3 rounded-xl border text-left transition-all ${
                  localWidth === 48
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">80 mm Roll</span>
                  <Badge variant={localWidth === 48 ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0 h-4">
                    48 Cols
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Wide receipt width</p>
              </button>
            </div>
          </div>

          {/* Auto-Connect Toggle */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
            <div className="space-y-0.5 pr-2">
              <Label htmlFor="printer-auto-conn" className="text-xs font-bold text-foreground block">
                Auto-Reconnect
              </Label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Attempt to reconnect to preferred printer automatically when available.
              </p>
            </div>
            <Switch
              id="printer-auto-conn"
              checked={localAutoConnect}
              onCheckedChange={handleToggleAutoConnect}
            />
          </div>

          {/* Active Receipt Template Banner */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/60">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
                <HugeiconsIcon icon={FileAttachmentIcon} size={14} className="text-cinnamon" />
                <span>Active Template:</span>
                <span className="font-bold font-mono text-cinnamon truncate">{activeTemplateName}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Headers, footers, and font styling configured in Template Builder.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => navigate('/admin/settings/receipts')}
              className="h-8 text-xs font-semibold rounded-lg border-border/80 bg-card hover:bg-secondary gap-1 shrink-0"
            >
              <span>Edit Template</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Interactive Receipt Preview Card */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <HugeiconsIcon icon={Coffee02Icon} size={15} className="text-cinnamon" />
              <CardTitle className="text-xs font-bold font-heading">Sample Receipt Preview</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {localWidth === 48 ? '80mm Preview' : '58mm Preview'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-3">
          <ReceiptPreview
            order={sampleOrder}
            templateConfig={
              activeTemplateConfig
                ? { ...activeTemplateConfig, paperWidth: localWidth }
                : ({ paperWidth: localWidth } as any)
            }
            cafeSettings={cafeSettings}
          />
        </CardContent>
      </Card>
    </div>
  );
}
