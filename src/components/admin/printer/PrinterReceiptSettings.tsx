import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { toast } from '../../ui/toast';
import { ReceiptPreview } from './ReceiptPreview';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings01Icon,
  FileAttachmentIcon,
  ArrowRight01Icon,
  Coffee02Icon,
  PrinterIcon,
} from '@hugeicons/core-free-icons';
import {
  getPrintQueueSettings,
  savePrintQueueSettings,
} from '../../../lib/printer/printQueueSettings';
import type { ReceiptTemplateConfig } from '../../../types';
import type { PrintTearGap, PrintTearMode } from '../../../types/printQueue.types';

interface PrinterReceiptSettingsProps {
  paperWidth: number;
  autoConnect: boolean;
  onPaperWidthChange: (width: number) => Promise<void>;
  onAutoConnectChange: (enabled: boolean) => Promise<void>;
  activeTemplateConfig?: ReceiptTemplateConfig | null;
  activeTemplateName?: string;
  cafeSettings?: any;
}

const TEAR_TIME_PRESETS = [
  { label: 'No Delay', valueMs: 0 },
  { label: '1s', valueMs: 1000 },
  { label: '2s', valueMs: 2000 },
  { label: '3s', valueMs: 3000, isDefault: true },
  { label: '5s', valueMs: 5000 },
];

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

  // Queue & Finishing settings
  const [queueSettings, setQueueSettings] = useState(getPrintQueueSettings);
  const [isCustomTearTime, setIsCustomTearTime] = useState(false);
  const [customTearSec, setCustomTearSec] = useState<string>('3');

  useEffect(() => {
    setLocalWidth(paperWidth);
  }, [paperWidth]);

  useEffect(() => {
    setLocalAutoConnect(autoConnect);
  }, [autoConnect]);

  useEffect(() => {
    const isPreset = TEAR_TIME_PRESETS.some((p) => p.valueMs === queueSettings.tearDelayMs);
    setIsCustomTearTime(!isPreset && queueSettings.tearDelayMs > 0);
    if (!isPreset && queueSettings.tearDelayMs > 0) {
      setCustomTearSec(String(Math.round(queueSettings.tearDelayMs / 1000)));
    }
  }, [queueSettings.tearDelayMs]);

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
          ? 'RadhaCafe will automatically restore the preferred printer on startup.'
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

  const handleTearModeChange = (mode: PrintTearMode) => {
    const updated = savePrintQueueSettings({ tearMode: mode });
    setQueueSettings(updated);
    toast.add({
      title: mode === 'continuous' ? 'Continuous Mode Enabled' : 'Wait for Me Mode Enabled',
      description:
        mode === 'continuous'
          ? 'Next queued receipts will print automatically after the tear interval.'
          : 'Queue will pause after each slip until you manually confirm.',
      type: 'success',
    });
  };

  const handleTearDelayPreset = (ms: number) => {
    setIsCustomTearTime(false);
    const updated = savePrintQueueSettings({ tearDelayMs: ms });
    setQueueSettings(updated);
    toast.add({
      title: 'Tear Time Saved',
      description:
        ms === 0
          ? 'Next receipt begins immediately.'
          : `Wait ${ms / 1000} second${ms === 1000 ? '' : 's'} before starting the next receipt.`,
      type: 'success',
    });
  };

  const handleCustomTearDelayCommit = () => {
    let sec = parseInt(customTearSec, 10);
    if (isNaN(sec) || sec < 1) sec = 1;
    if (sec > 10) sec = 10;
    setCustomTearSec(String(sec));

    const updated = savePrintQueueSettings({ tearDelayMs: sec * 1000 });
    setQueueSettings(updated);
    toast.add({
      title: 'Custom Tear Time Saved',
      description: `Wait ${sec} seconds before starting the next receipt.`,
      type: 'success',
    });
  };

  const handleTearGapChange = (gap: PrintTearGap) => {
    const updated = savePrintQueueSettings({ tearGap: gap });
    setQueueSettings(updated);
    const lines = gap === 'compact' ? 2 : gap === 'normal' ? 3 : 5;
    toast.add({
      title: 'Paper Gap Saved',
      description: `${lines} blank lines fed after each receipt for manual tearing.`,
      type: 'success',
    });
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
    paidAmount: 304.5,
    dueAmount: 0,
    paymentMethod: 'CASH',
    paymentStatus: 'paid',
    dateTime: new Date().toLocaleString(),
    cashierName: 'Counter Admin',
    items: [
      { name: 'Cold Coffee Classic', quantity: 2, unitPrice: 90, totalPrice: 180 },
      { name: 'Grilled Cheese Sandwich', quantity: 1, unitPrice: 110, totalPrice: 110 },
    ],
  };

  const tearTimeDisplay =
    queueSettings.tearDelayMs === 0
      ? '0s'
      : `${Math.round(queueSettings.tearDelayMs / 1000)}s`;

  const paperLinesDisplay =
    queueSettings.tearGap === 'compact'
      ? '2 lines'
      : queueSettings.tearGap === 'normal'
      ? '3 lines'
      : '5 lines';

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── 1. Hardware & Paper Settings Card ── */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <HugeiconsIcon icon={Settings01Icon} size={15} className="text-cinnamon" />
            <CardTitle className="text-sm font-bold font-heading">Hardware & Roll Settings</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Configure thermal paper roll width and startup Bluetooth connection behavior.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Paper Width Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">Default Paper Roll Width</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleWidthSelect(32)}
                disabled={isSaving}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  localWidth === 32
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">58 mm Roll</span>
                  <Badge
                    variant={localWidth === 32 ? 'default' : 'outline'}
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    32 Cols
                  </Badge>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleWidthSelect(48)}
                disabled={isSaving}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  localWidth === 48
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">80 mm Roll</span>
                  <Badge
                    variant={localWidth === 48 ? 'default' : 'outline'}
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    48 Cols
                  </Badge>
                </div>
              </button>
            </div>
          </div>

          {/* Connection Reliability & Refresh Recovery */}
          <div className="pt-3 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 pr-2">
                <Label htmlFor="printer-auto-conn" className="text-xs font-bold text-foreground block">
                  Keep printer connected
                </Label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatically restore the preferred printer while the RadhaCafe admin is signed in.
                </p>
              </div>
              <Switch
                id="printer-auto-conn"
                checked={localAutoConnect}
                onCheckedChange={handleToggleAutoConnect}
              />
            </div>

            {/* Refresh Recovery Status Note */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground text-[11px] block">Refresh Recovery</span>
                <p className="text-[10px] text-muted-foreground">
                  Previously authorized printers are restored automatically via browser grants after RadhaCafe reloads.
                </p>
              </div>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0 h-4 rounded shrink-0">
                Enabled
              </Badge>
            </div>
          </div>

          {/* Active Receipt Template Banner */}
          <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/60">
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs flex-wrap">
                <HugeiconsIcon icon={FileAttachmentIcon} size={14} className="text-cinnamon shrink-0" />
                <span>Active Template:</span>
                <span className="font-bold font-mono text-cinnamon break-words">
                  {activeTemplateName}
                </span>
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
              className="h-8 text-xs font-semibold rounded-lg border-border/80 bg-card hover:bg-secondary gap-1 self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <span>Edit Template</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Receipt Queue: Tear Time & Rush-Hour Flow Card ── */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <HugeiconsIcon icon={PrinterIcon} size={15} className="text-cinnamon" />
            <CardTitle className="text-sm font-bold font-heading">Receipt Queue & Tear Flow</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Configure paper gaps and tear intervals so taking the next customer order is never blocked.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-5">
          {/* 1. Queue Mode Selection: Choice Cards */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">Queue Mode</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Continuous (Recommended) */}
              <button
                type="button"
                onClick={() => handleTearModeChange('continuous')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  queueSettings.tearMode === 'continuous'
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Continuous</span>
                  <Badge className="bg-cinnamon/20 text-cinnamon font-bold text-[9px] px-1.5 py-0 h-4 rounded">
                    Recommended
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  Automatically print the next queued receipt after the tear timer.
                </p>
              </button>

              {/* Wait for Me */}
              <button
                type="button"
                onClick={() => handleTearModeChange('manual-confirm')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  queueSettings.tearMode === 'manual-confirm'
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <span className="font-bold text-xs block">Wait for Me</span>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  Pause after each receipt until you manually click to continue.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Time Between Receipts (Tear Time) */}
          <div className="pt-4 border-t border-border/60 space-y-2">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">Time Between Receipts</Label>
              <p className="text-[11px] text-muted-foreground">
                Give yourself time to tear each receipt before the next one starts printing.
              </p>
            </div>

            {/* Segmented Preset Bar */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {TEAR_TIME_PRESETS.map((preset) => {
                const isSelected = !isCustomTearTime && queueSettings.tearDelayMs === preset.valueMs;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleTearDelayPreset(preset.valueMs)}
                    className={`h-8 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cinnamon text-white border-cinnamon shadow-2xs'
                        : 'bg-secondary/50 text-foreground border-border/80 hover:bg-secondary'
                    }`}
                  >
                    {preset.label}
                    {preset.isDefault && <span className="text-[9px] font-normal opacity-80 ml-1">(Default)</span>}
                  </button>
                );
              })}

              {/* Custom Preset Button */}
              <button
                type="button"
                onClick={() => setIsCustomTearTime(true)}
                className={`h-8 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isCustomTearTime
                    ? 'bg-cinnamon text-white border-cinnamon shadow-2xs'
                    : 'bg-secondary/50 text-foreground border-border/80 hover:bg-secondary'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Time Input (when active) */}
            {isCustomTearTime && (
              <div className="flex items-center gap-2 pt-2 animate-in fade-in-50 duration-150 max-w-xs">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={customTearSec}
                  onChange={(e) => setCustomTearSec(e.target.value)}
                  onBlur={handleCustomTearDelayCommit}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomTearDelayCommit()}
                  className="h-8 text-xs font-mono font-bold w-20 rounded-lg bg-card"
                  placeholder="3"
                />
                <span className="text-xs text-muted-foreground font-medium">seconds (1–10s max)</span>
                <Button
                  type="button"
                  size="xs"
                  onClick={handleCustomTearDelayCommit}
                  className="h-8 text-xs font-semibold bg-cinnamon text-white rounded-lg px-2.5"
                >
                  Set
                </Button>
              </div>
            )}
          </div>

          {/* 3. Paper Between Receipts (Paper Feed Gap) */}
          <div className="pt-4 border-t border-border/60 space-y-2">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">Paper Between Receipts</Label>
              <p className="text-[11px] text-muted-foreground">
                Feed additional blank paper so each receipt is easier to tear from the cutter bar.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Compact (2 lines) */}
              <button
                type="button"
                onClick={() => handleTearGapChange('compact')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  queueSettings.tearGap === 'compact'
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <span className="font-bold text-xs block">Compact</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">2 blank lines</p>
              </button>

              {/* Normal (3 lines) */}
              <button
                type="button"
                onClick={() => handleTearGapChange('normal')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  queueSettings.tearGap === 'normal'
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <span className="font-bold text-xs block">Normal</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">3 blank lines</p>
              </button>

              {/* Extra (5 lines) */}
              <button
                type="button"
                onClick={() => handleTearGapChange('extra')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  queueSettings.tearGap === 'extra'
                    ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                    : 'bg-secondary/40 border-border/80 text-foreground hover:bg-secondary/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Extra</span>
                  <Badge className="bg-cinnamon/20 text-cinnamon text-[8px] px-1 py-0 h-3.5 rounded">
                    Default
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">5 blank lines</p>
              </button>
            </div>
          </div>

          {/* 4. Visual Sequence Preview Diagram */}
          <div className="pt-4 border-t border-border/60">
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                Rush-Hour Print Sequence
              </span>

              <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold flex-wrap">
                <span className="bg-card px-2 py-1 rounded-md border border-border/70 shadow-2xs">
                  Receipt Output
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-muted-foreground shrink-0" />
                <span className="bg-cinnamon/10 text-cinnamon px-2 py-1 rounded-md border border-cinnamon/30">
                  {paperLinesDisplay} feed gap
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-muted-foreground shrink-0" />
                <span className="bg-cinnamon/10 text-cinnamon px-2 py-1 rounded-md border border-cinnamon/30">
                  {queueSettings.tearMode === 'continuous'
                    ? `${tearTimeDisplay} tear window`
                    : 'Wait for tear confirmation'}
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-muted-foreground shrink-0" />
                <span className="bg-card px-2 py-1 rounded-md border border-border/70 shadow-2xs">
                  Next Receipt
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Interactive Receipt Preview Card ── */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
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
