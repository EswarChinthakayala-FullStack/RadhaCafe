import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { HelpCircleIcon } from '@hugeicons/core-free-icons';

export function PrinterTroubleshooting() {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
            <HugeiconsIcon icon={HelpCircleIcon} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-bold font-heading text-foreground truncate">
              Printer Troubleshooting Guide
            </CardTitle>
            <CardDescription className="text-xs">
              Quick fixes for common thermal printer connectivity, pairing, and paper feed questions.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 text-xs">
        <Accordion className="w-full space-y-2">
          {/* Issue 1 */}
          <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-secondary/20">
            <AccordionTrigger className="text-xs font-bold text-foreground hover:no-underline py-3">
              Printer does not appear in Bluetooth scan
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed space-y-2 pt-1 pb-3">
              <p>
                1. <strong>Power Check:</strong> Confirm the printer is powered on and the blue/green power indicator is solid.
              </p>
              <p>
                2. <strong>Existing Connection:</strong> Thermal printers only support <em>one active connection</em> at a time. If the printer is connected to a mobile phone or another computer, disconnect it first.
              </p>
              <p>
                3. <strong>Range:</strong> Place the printer within 2–3 meters of this computer.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Issue 2 */}
          <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-secondary/20">
            <AccordionTrigger className="text-xs font-bold text-foreground hover:no-underline py-3">
              Printer pairs but won't connect or disconnects immediately
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed space-y-2 pt-1 pb-3">
              <p>
                1. Turn the physical printer switch <strong>OFF</strong>, wait 5 seconds, and turn it <strong>ON</strong>.
              </p>
              <p>
                2. Click <strong>Scan for Printer</strong> in RadhaCafe and select the printer again.
              </p>
              <p>
                3. If the battery is low, plug in the AC charging adapter. Low battery causes BLE transmission drops.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Issue 3 */}
          <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-secondary/20">
            <AccordionTrigger className="text-xs font-bold text-foreground hover:no-underline py-3">
              Printer is connected, but blank paper comes out
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed space-y-2 pt-1 pb-3">
              <p>
                Thermal paper is heat-sensitive on <strong>one side only</strong>. If the paper feeds but no text appears, the thermal paper roll is inserted upside down. Open the lid and flip the paper roll.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Issue 4 */}
          <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-secondary/20">
            <AccordionTrigger className="text-xs font-bold text-foreground hover:no-underline py-3">
              Receipt text is cut off on the right margin
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed space-y-2 pt-1 pb-3">
              <p>
                Ensure your <strong>Paper Roll Width</strong> setting matches the physical paper roll. Standard 58mm portable printers require <strong>32 Columns</strong>, while 80mm desktop thermal printers use <strong>48 Columns</strong>.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Issue 5 */}
          <AccordionItem value="item-5" className="border border-border/60 rounded-xl px-4 bg-secondary/20">
            <AccordionTrigger className="text-xs font-bold text-foreground hover:no-underline py-3">
              Browser Bluetooth compatibility & fallback printing
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed space-y-2 pt-1 pb-3">
              <p>
                Direct Bluetooth thermal printing is supported in <strong>Google Chrome, Microsoft Edge, and Opera</strong> on Windows, macOS, Android, and ChromeOS. If using Safari or Firefox, RadhaCafe automatically opens the system browser print dialog.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
