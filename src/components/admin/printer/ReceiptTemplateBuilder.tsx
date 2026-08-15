import { useState, useEffect } from 'react';
import {
  useReceiptTemplates,
  useActiveReceiptTemplate,
  useReceiptTemplateMutations,
} from '../../../hooks/useReceiptTemplates';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { useCafeSettings } from '../../../hooks/useCafeSettings';
import type { ReceiptTemplateConfig } from '../../../types';
import { ReceiptPreview } from './ReceiptPreview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Copy01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  StarIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  RefreshIcon,
  ViewIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';

// Realistic Sample Order Data for Preview
const SAMPLE_ORDER_DATA = {
  id: 'sample-order-001',
  order_number: 'RC-20260813-0088',
  created_at: new Date().toISOString(),
  cashier_name: 'Admin Counter',
  status: 'completed',
  customer_name: 'Rahul Sharma',
  customer_phone: '9876543210',
  payment_method: 'pay_later',
  items: [
    { item_name: 'Special Bellam Tea', quantity: 2, unit_price: 20, total_price: 40 },
    { item_name: 'Badam Milk', quantity: 1, unit_price: 20, total_price: 20 },
    { item_name: 'Fresh Mineral Water (20L)', quantity: 2, unit_price: 50, total_price: 100 },
  ],
  subtotal: 160,
  tax_amount: 0,
  discount_amount: 10,
  total_amount: 150,
  paid_amount: 50,
  due_amount: 100,
};

export function ReceiptTemplateBuilder() {
  const { data: templates, isLoading } = useReceiptTemplates();
  const { data: activeTemplate } = useActiveReceiptTemplate();
  const { data: cafeSettings } = useCafeSettings();
  const { printTestReceipt } = useBluetoothPrinter();

  const {
    createMutation,
    updateMutation,
    duplicateMutation,
    deleteMutation,
    activateMutation,
  } = useReceiptTemplateMutations();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [draftConfig, setDraftConfig] = useState<ReceiptTemplateConfig | null>(null);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Modals & Dialogs
  const [showSaveAsModal, setShowSaveAsModal] = useState<boolean>(false);
  const [saveAsName, setSaveAsName] = useState<string>('');
  const [showActivateDialog, setShowActivateDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'customize' | 'preview'>('customize');

  // Load selected template into draft state
  useEffect(() => {
    if (templates && templates.length > 0) {
      const current = templates.find((t) => t.id === selectedTemplateId) || activeTemplate || templates[0];
      if (current) {
        setSelectedTemplateId(current.id);
        setTemplateName(current.name);
        setTemplateDescription(current.description || '');
        setDraftConfig(JSON.parse(JSON.stringify(current.template_config)));
        setHasUnsavedChanges(false);
      }
    }
  }, [templates, activeTemplate, selectedTemplateId]);

  if (isLoading || !draftConfig) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
        <HugeiconsIcon icon={RefreshIcon} className="animate-spin mr-2" size={18} />
        <span>Loading receipt template builder...</span>
      </div>
    );
  }

  const currentTemplate = templates?.find((t) => t.id === selectedTemplateId);
  const isActive = currentTemplate?.is_active || false;

  // Helper to update draft nested config
  const updateDraft = (updater: (prev: ReceiptTemplateConfig) => ReceiptTemplateConfig) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      const next = updater(JSON.parse(JSON.stringify(prev)));
      setHasUnsavedChanges(true);
      return next;
    });
  };

  // Save changes to current template
  const handleSave = async () => {
    if (!selectedTemplateId || !draftConfig) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedTemplateId,
        input: {
          name: templateName,
          description: templateDescription,
          paper_width: draftConfig.paperWidth,
          template_config: draftConfig,
        },
      });
      setHasUnsavedChanges(false);
      toast.add({
        title: 'Receipt Template Saved',
        description: `Successfully updated template "${templateName}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Template',
        description: err.message || 'Failed to save receipt template.',
        type: 'error',
      });
    }
  };

  // Save as new template
  const handleSaveAs = async () => {
    if (!saveAsName.trim() || !draftConfig) return;
    try {
      const created = await createMutation.mutateAsync({
        name: saveAsName.trim(),
        description: `Custom copy of ${templateName}`,
        is_active: false,
        paper_width: draftConfig.paperWidth,
        template_config: draftConfig,
      });
      setShowSaveAsModal(false);
      setSelectedTemplateId(created.id);
      setHasUnsavedChanges(false);
      toast.add({
        title: 'New Template Created',
        description: `Saved as new template "${created.name}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Save As Failed',
        description: err.message || 'Failed to create new template.',
        type: 'error',
      });
    }
  };

  // Activate current template
  const handleActivate = async () => {
    if (!selectedTemplateId) return;
    try {
      await activateMutation.mutateAsync(selectedTemplateId);
      setShowActivateDialog(false);
      toast.add({
        title: 'Receipt Template Activated',
        description: `"${templateName}" is now active for all new receipts and reprints.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Activation Failed',
        description: err.message || 'Failed to activate receipt template.',
        type: 'error',
      });
    }
  };

  // Duplicate current template
  const handleDuplicate = async () => {
    if (!selectedTemplateId) return;
    try {
      const dup = await duplicateMutation.mutateAsync(selectedTemplateId);
      setSelectedTemplateId(dup.id);
      toast.add({
        title: 'Template Duplicated',
        description: `Created copy "${dup.name}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Duplication Failed',
        description: err.message || 'Failed to duplicate template.',
        type: 'error',
      });
    }
  };

  // Delete current template
  const handleDelete = async () => {
    if (!selectedTemplateId) return;
    try {
      await deleteMutation.mutateAsync(selectedTemplateId);
      setShowDeleteDialog(false);
      if (templates && templates.length > 1) {
        const remaining = templates.find((t) => t.id !== selectedTemplateId);
        if (remaining) setSelectedTemplateId(remaining.id);
      }
      toast.add({
        title: 'Template Deleted',
        description: 'Template successfully removed.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Deletion Failed',
        description: err.message || 'Unable to delete template.',
        type: 'error',
      });
    }
  };

  // Section reordering helper
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!draftConfig) return;
    const list = [...draftConfig.sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    updateDraft((prev) => ({ ...prev, sectionOrder: list }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <Card className="border border-border/80 shadow-xs bg-card">
        <CardContent className="p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
            <Select
              value={selectedTemplateId}
              onValueChange={(val) => {
                if (val) setSelectedTemplateId(val);
              }}
            >
              <SelectTrigger className="w-full sm:w-[220px] font-bold text-sm h-10 border-border/80">
                <SelectValue placeholder="Select Template">
                  {currentTemplate?.name || 'Select Template'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {templates?.map((t) => (
                  <SelectItem key={t.id} value={t.id} label={t.name} className="font-medium text-xs">
                    <div className="flex items-center gap-2">
                      <span>{t.name}</span>
                      {t.is_active && (
                        <Badge className="bg-emerald-600/90 text-white text-[9px] px-1.5 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              {isActive ? (
                <Badge className="bg-emerald-600 text-white gap-1 py-1.5 px-2.5 rounded-md text-xs font-bold shadow-2xs">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                  <span>Active Template</span>
                </Badge>
              ) : (
                <Button
                  onClick={() => setShowActivateDialog(true)}
                  size="sm"
                  className="bg-cinnamon hover:bg-cinnamon/90 text-white text-xs font-bold h-9 gap-1.5 shadow-2xs"
                >
                  <HugeiconsIcon icon={StarIcon} size={14} />
                  <span>Activate Template</span>
                </Button>
              )}

              {hasUnsavedChanges ? (
                <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] py-1">
                  Unsaved Changes
                </Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] py-1">
                  Saved
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || updateMutation.isPending}
              size="sm"
              className="bg-cinnamon hover:bg-cinnamon/90 text-white text-xs font-bold h-9 gap-1.5 shadow-2xs justify-center"
            >
              <HugeiconsIcon icon={FloppyDiskIcon} size={14} />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Template'}</span>
            </Button>

            <Button
              onClick={() => {
                setSaveAsName(`${templateName} Copy`);
                setShowSaveAsModal(true);
              }}
              variant="outline"
              size="sm"
              className="text-xs font-semibold h-9 gap-1.5 border-border/80 justify-center"
            >
              <HugeiconsIcon icon={Copy01Icon} size={14} />
              <span>Save As New</span>
            </Button>

            <Button
              onClick={handleDuplicate}
              variant="outline"
              size="sm"
              className="text-xs font-semibold h-9 gap-1.5 border-border/80 sm:border-0 justify-center"
            >
              <HugeiconsIcon icon={Copy01Icon} size={14} />
              <span>Duplicate</span>
            </Button>

            {!isActive && (
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="ghost"
                size="sm"
                className="text-xs font-semibold h-9 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-500/10 justify-center col-span-2 sm:col-span-1"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-secondary/40 p-1 rounded-lg border border-border/80 mb-2">
        <Button
          onClick={() => setActiveTabMobile('customize')}
          variant={activeTabMobile === 'customize' ? 'default' : 'ghost'}
          className={`flex-1 text-xs font-bold h-9 ${activeTabMobile === 'customize' ? 'bg-cinnamon text-white' : ''}`}
        >
          <HugeiconsIcon icon={Settings01Icon} size={14} className="mr-1.5" />
          Customize Controls
        </Button>
        <Button
          onClick={() => setActiveTabMobile('preview')}
          variant={activeTabMobile === 'preview' ? 'default' : 'ghost'}
          className={`flex-1 text-xs font-bold h-9 ${activeTabMobile === 'preview' ? 'bg-cinnamon text-white' : ''}`}
        >
          <HugeiconsIcon icon={ViewIcon} size={14} className="mr-1.5" />
          Live Preview
        </Button>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template Controls */}
        <div className={`md:col-span-7 space-y-4 ${activeTabMobile === 'preview' ? 'hidden md:block' : 'block'}`}>
          <Accordion className="space-y-3">
            {/* Header Accordion */}
            <AccordionItem value="header" className="border border-border/80 rounded-md bg-card px-4 shadow-2xs">
              <AccordionTrigger className="hover:no-underline py-3.5">
                <span className="font-bold text-sm font-heading text-foreground">1. Cafe Header & Branding</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-1 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold">Show Cafe Logo</Label>
                    <Switch
                      checked={draftConfig.header.logoVisible}
                      onCheckedChange={(val) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, logoVisible: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold">Show Tagline</Label>
                    <Switch
                      checked={draftConfig.header.taglineVisible}
                      onCheckedChange={(val) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, taglineVisible: val } }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Cafe Display Name</Label>
                    <Input
                      value={draftConfig.header.cafeNameText}
                      onChange={(e) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, cafeNameText: e.target.value } }))
                      }
                      className="h-9 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Tagline Text</Label>
                    <Input
                      value={draftConfig.header.taglineText}
                      onChange={(e) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, taglineText: e.target.value } }))
                      }
                      className="h-9 text-xs mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">Address Line</Label>
                      <Input
                        value={draftConfig.header.addressText}
                        onChange={(e) =>
                          updateDraft((prev) => ({ ...prev, header: { ...prev.header, addressText: e.target.value } }))
                        }
                        className="h-9 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Phone Number</Label>
                      <Input
                        value={draftConfig.header.phoneText}
                        onChange={(e) =>
                          updateDraft((prev) => ({ ...prev, header: { ...prev.header, phoneText: e.target.value } }))
                        }
                        className="h-9 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">Header Alignment</Label>
                      <Select
                        value={draftConfig.header.alignment}
                        onValueChange={(val: any) =>
                          updateDraft((prev) => ({ ...prev, header: { ...prev.header, alignment: val } }))
                        }
                      >
                        <SelectTrigger className="w-full h-9 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Header Emphasis Mode</Label>
                      <Select
                        value={draftConfig.header.emphasis}
                        onValueChange={(val: any) =>
                          updateDraft((prev) => ({ ...prev, header: { ...prev.header, emphasis: val } }))
                        }
                      >
                        <SelectTrigger className="w-full h-9 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bold">Bold Standard</SelectItem>
                          <SelectItem value="double_size">Double Size ESC/POS</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Paper & Divider Accordion */}
            <AccordionItem value="paper" className="border border-border/80 rounded-md bg-card px-4 shadow-2xs">
              <AccordionTrigger className="hover:no-underline py-3.5">
                <span className="font-bold text-sm font-heading text-foreground">2. Paper Width & Divider Style</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-1 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Thermal Paper Roll Width</Label>
                    <Select
                      value={String(draftConfig.paperWidth)}
                      onValueChange={(val) =>
                        updateDraft((prev) => ({ ...prev, paperWidth: Number(val) }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="32">58mm Paper (32 Columns)</SelectItem>
                        <SelectItem value="42">72mm Paper (42 Columns)</SelectItem>
                        <SelectItem value="48">80mm Paper (48 Columns)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Thermal Divider Style</Label>
                    <Select
                      value={draftConfig.dividerStyle}
                      onValueChange={(val: any) =>
                        updateDraft((prev) => ({ ...prev, dividerStyle: val }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashed">Dashed Lines ( - - - )</SelectItem>
                        <SelectItem value="solid">Solid Line ( ──────── )</SelectItem>
                        <SelectItem value="double">Double Line ( ======= )</SelectItem>
                        <SelectItem value="dotted">Dotted Line ( . . . . . )</SelectItem>
                        <SelectItem value="none">No Dividers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label className="text-xs font-semibold">Paper Feed Lines After Cut</Label>
                    <Select
                      value={String(draftConfig.feedLines || 3)}
                      onValueChange={(val) =>
                        updateDraft((prev) => ({ ...prev, feedLines: Number(val) }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Lines Feed</SelectItem>
                        <SelectItem value="3">3 Lines Feed (Recommended)</SelectItem>
                        <SelectItem value="4">4 Lines Feed</SelectItem>
                        <SelectItem value="5">5 Lines Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Preview Monospace Font</Label>
                    <Select
                      value={draftConfig.previewFont}
                      onValueChange={(val: any) =>
                        updateDraft((prev) => ({ ...prev, previewFont: val }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                        <SelectItem value="Consolas">Consolas</SelectItem>
                        <SelectItem value="Inter">Inter (Sans-serif simulation)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Customer & Payment Accordion */}
            <AccordionItem value="customer" className="border border-border/80 rounded-md bg-card px-4 shadow-2xs">
              <AccordionTrigger className="hover:no-underline py-3.5">
                <span className="font-bold text-sm font-heading text-foreground">3. Customer Details & Pay Later</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-1 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold">Customer Name</Label>
                    <Switch
                      checked={draftConfig.customerInfo.customerNameVisible}
                      onCheckedChange={(val) =>
                        updateDraft((prev) => ({
                          ...prev,
                          customerInfo: { ...prev.customerInfo, customerNameVisible: val },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold">Customer Phone</Label>
                    <Switch
                      checked={draftConfig.customerInfo.phoneVisible}
                      onCheckedChange={(val) =>
                        updateDraft((prev) => ({
                          ...prev,
                          customerInfo: { ...prev.customerInfo, phoneVisible: val },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold">Credit Status</Label>
                    <Switch
                      checked={draftConfig.customerInfo.paymentStatusVisible}
                      onCheckedChange={(val) =>
                        updateDraft((prev) => ({
                          ...prev,
                          customerInfo: { ...prev.customerInfo, paymentStatusVisible: val },
                        }))
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Footer Accordion */}
            <AccordionItem value="footer" className="border border-border/80 rounded-md bg-card px-4 shadow-2xs">
              <AccordionTrigger className="hover:no-underline py-3.5">
                <span className="font-bold text-sm font-heading text-foreground">4. Receipt Footer Messages</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1 pb-4">
                <div>
                  <Label className="text-xs font-semibold">Primary Thank-You Message</Label>
                  <Input
                    value={draftConfig.footer.thankYouMessage}
                    onChange={(e) =>
                      updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, thankYouMessage: e.target.value } }))
                    }
                    className="h-9 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Secondary Message</Label>
                  <Input
                    value={draftConfig.footer.secondaryMessage}
                    onChange={(e) =>
                      updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, secondaryMessage: e.target.value } }))
                    }
                    className="h-9 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Contact / Bulk Order Message</Label>
                  <Input
                    value={draftConfig.footer.contactMessage}
                    onChange={(e) =>
                      updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, contactMessage: e.target.value } }))
                    }
                    className="h-9 text-xs mt-1"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section Reordering Accordion */}
            <AccordionItem value="sections" className="border border-border/80 rounded-md bg-card px-4 shadow-2xs">
              <AccordionTrigger className="hover:no-underline py-3.5">
                <span className="font-bold text-sm font-heading text-foreground">5. Receipt Section Sequence</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1 pb-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Reorder receipt sections vertically using the arrow controls below:
                </p>
                <div className="space-y-2">
                  {draftConfig.sectionOrder.map((sec, idx) => (
                    <div
                      key={sec}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-secondary/30 text-xs font-bold"
                    >
                      <span className="capitalize text-foreground">{sec.replace(/([AZ])/g, ' $1')}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                        </Button>
                        <Button
                          disabled={idx === draftConfig.sectionOrder.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right Column: Sticky Live Monospace Thermal Preview */}
        <div className={`md:col-span-5 md:sticky md:top-20 space-y-4 ${activeTabMobile === 'customize' ? 'hidden md:block' : 'block'}`}>
          <Card className="border border-border/80 shadow-md bg-card">
            <CardHeader className="p-4 border-b border-border/80 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-heading">Live Thermal Slip Preview</CardTitle>
                  <CardDescription className="text-[11px]">
                    Simulating {draftConfig.paperWidth} columns thermal output
                  </CardDescription>
                </div>
                <Button
                  onClick={async () => {
                    const success = await printTestReceipt(cafeSettings?.cafe_name || 'RadhaCafe');
                    if (success) {
                      toast.add({
                        title: 'Test Print Transmitted',
                        description: 'Receipt byte stream transmitted to ESC/POS thermal printer.',
                        type: 'success',
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold h-8 gap-1.5 border-border/80"
                >
                  <HugeiconsIcon icon={PrinterIcon} size={13} />
                  <span>Test Print</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-secondary/15">
              <ReceiptPreview
                order={SAMPLE_ORDER_DATA}
                templateConfig={draftConfig}
                cafeSettings={cafeSettings}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Save As New Template */}
      <Dialog open={showSaveAsModal} onOpenChange={setShowSaveAsModal}>
        <DialogContent className="max-w-md bg-card border border-border/80 p-6 rounded-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-heading">Save As New Receipt Template</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create an independent new template preset based on your current customization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">New Template Name</Label>
              <Input
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="e.g. Catering Detailed Slip"
                className="h-10 text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end items-center gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setShowSaveAsModal(false)} className="h-9 px-4 text-xs font-semibold rounded-md border-border/80">
              Cancel
            </Button>
            <Button
              onClick={handleSaveAs}
              disabled={!saveAsName.trim() || createMutation.isPending}
              className="h-9 px-5 bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-md shadow-2xs"
            >
              {createMutation.isPending ? 'Saving...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirm Activate Template */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 p-6 rounded-md shadow-2xl space-y-4">
          <AlertDialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={StarIcon} size={24} />
            </div>
            <AlertDialogTitle className="text-center text-lg font-bold font-heading text-foreground">
              Activate Template "{templateName}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              This template will become the active source of truth for all future order receipts, manual prints, and historical reprints across RadhaCafe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center items-center gap-2.5 pt-2">
            <AlertDialogCancel className="h-9 px-5 text-xs font-semibold rounded-md border-border/80">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivate}
              className="h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-2xs"
            >
              Activate Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Delete Safety Check */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 p-6 rounded-md shadow-2xl space-y-4">
          <AlertDialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-600 flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={AlertCircleIcon} size={24} />
            </div>
            <AlertDialogTitle className="text-center text-lg font-bold font-heading text-foreground">
              Delete Template "{templateName}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this saved template configuration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center items-center gap-2.5 pt-2">
            <AlertDialogCancel className="h-9 px-5 text-xs font-semibold rounded-md border-border/80">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-9 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-2xs"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
