import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
  FileAttachmentIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

interface PrinterTestPanelProps {
  onPrintTestReceipt: () => Promise<boolean>;
  onPrintTemplateTest: () => Promise<boolean>;
  onOpenReceiptSettings?: () => void;
}

export function PrinterTestPanel({
  onPrintTestReceipt,
  onPrintTemplateTest,
  onOpenReceiptSettings,
}: PrinterTestPanelProps) {
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [isTemplateTesting, setIsTemplateTesting] = useState(false);
  const [lastTestSuccess, setLastTestSuccess] = useState<boolean | null>(null);

  const handleRunRawTest = async () => {
    setIsTestPrinting(true);
    setLastTestSuccess(null);
    try {
      const success = await onPrintTestReceipt();
      setLastTestSuccess(success);
      if (success) {
        toast.add({
          title: 'Test Receipt Transmitted',
          description: 'ESC/POS test byte stream sent to the thermal printer.',
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Test Print Failed',
          description: 'Unable to transmit test data. Check printer power and connection.',
          type: 'error',
        });
      }
    } finally {
      setIsTestPrinting(false);
    }
  };

  const handleRunTemplateTest = async () => {
    setIsTemplateTesting(true);
    setLastTestSuccess(null);
    try {
      const success = await onPrintTemplateTest();
      setLastTestSuccess(success);
      if (success) {
        toast.add({
          title: 'Template Test Transmitted',
          description: 'Sample receipt with active template styling sent to printer.',
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Template Test Failed',
          description: 'Unable to transmit receipt data. Check printer connection.',
          type: 'error',
        });
      }
    } finally {
      setIsTemplateTesting(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
            <HugeiconsIcon icon={PrinterIcon} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-bold font-heading text-foreground truncate">
              Printer Hardware Testing
            </CardTitle>
            <CardDescription className="text-xs">
              Verify byte stream transmission, character alignment, bold text, and paper feed.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full min-w-0">
          {/* Option 1: Raw ESC/POS Diagnostics Test */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-3 flex flex-col justify-between min-w-0">
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <span>Standard Hardware Test</span>
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Prints a quick 6-line hardware validation receipt to confirm Bluetooth connection, font size, and feed cut.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRunRawTest}
              disabled={isTestPrinting || isTemplateTesting}
              className="w-full text-xs font-semibold rounded-xl h-9 border-border/80 bg-card hover:bg-secondary gap-1.5 justify-center shadow-2xs"
            >
              {isTestPrinting ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={PrinterIcon} size={14} />
                  <span>Print Test Receipt</span>
                </>
              )}
            </Button>
          </div>

          {/* Option 2: Active Template Real Receipt Test */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-3 flex flex-col justify-between min-w-0">
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <span>Active Template Test</span>
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Prints a realistic sample cafe order receipt using your configured template, headers, and footer message.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRunTemplateTest}
              disabled={isTestPrinting || isTemplateTesting}
              className="w-full text-xs font-semibold rounded-xl h-9 border-border/80 bg-card hover:bg-secondary text-foreground gap-1.5 justify-center shadow-2xs"
            >
              {isTemplateTesting ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={FileAttachmentIcon} size={14} className="text-cinnamon" />
                  <span>Test Active Template</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Test Result Feedback Strip */}
        {lastTestSuccess !== null && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs flex-wrap ${
              lastTestSuccess
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={lastTestSuccess ? CheckmarkCircle02Icon : AlertCircleIcon}
                size={16}
                className="shrink-0"
              />
              <span className="font-medium">
                {lastTestSuccess
                  ? 'Test receipt byte stream sent to the thermal printer.'
                  : 'Unable to send test receipt. Please check printer connection.'}
              </span>
            </div>

            {lastTestSuccess && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    toast.add({
                      title: 'Printer Ready',
                      description: 'Your receipt printer is fully operational.',
                      type: 'success',
                    });
                    setLastTestSuccess(null);
                  }}
                  className="h-7 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 rounded-lg px-2.5"
                >
                  Yes, Looks Good
                </Button>

                {onOpenReceiptSettings && (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={onOpenReceiptSettings}
                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground rounded-lg px-2.5 gap-1"
                  >
                    <span>Adjust Width</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
