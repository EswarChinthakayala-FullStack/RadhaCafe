import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useReceiptTemplates,
  useReceiptTemplateMutations,
} from '../../hooks/useReceiptTemplates';
import { useBluetoothPrinter } from '../../hooks/useBluetoothPrinter';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import {
  BUILT_IN_PRESETS,
  SAMPLE_DATASETS,
  presetToReceiptTemplate,
} from '../../lib/printer/presetTemplates';
import type {
  ReceiptTemplate,
  ReceiptTemplateConfig,
  AlignmentType,
  EmphasisType,
  DividerStyleType,
  SectionType,
} from '../../types';
import { ReceiptPreview } from '../../components/admin/printer/ReceiptPreview';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from '../../components/ui/toast';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  FloppyDiskIcon,
  PrinterIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  StarIcon,
  MoreVerticalIcon,
  Settings01Icon,
  ViewIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

export function ReceiptTemplateEditorPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: templates, isLoading } = useReceiptTemplates();
  const { data: cafeSettings } = useCafeSettings();
  const { isConnected: printerConnected, printCustomReceipt } = useBluetoothPrinter();

  const {
    createMutation,
    updateMutation,
    activateMutation,
    deleteMutation,
  } = useReceiptTemplateMutations();

  // Local draft state
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [draftConfig, setDraftConfig] = useState<ReceiptTemplateConfig | null>(null);
  const [initialConfig, setInitialConfig] = useState<string>('');
  const [initialName, setInitialName] = useState<string>('');
  const [initialDescription, setInitialDescription] = useState<string>('');
  const [isPresetBase, setIsPresetBase] = useState<boolean>(false);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);

  // Preview Workspace controls
  const [previewDataset, setPreviewDataset] = useState<'paid' | 'payLater' | 'walkIn'>('paid');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [activeMobileTab, setActiveMobileTab] = useState<'customize' | 'preview'>('customize');
  const [isTestPrinting, setIsTestPrinting] = useState<boolean>(false);

  // Dialogs
  const [showDiscardAlert, setShowDiscardAlert] = useState<boolean>(false);
  const [pendingNavigateUrl, setPendingNavigateUrl] = useState<string | null>(null);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState<boolean>(false);
  const [saveAsName, setSaveAsName] = useState<string>('');
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);

  // Load template from DB or built-in preset
  useEffect(() => {
    if (isLoading) return;

    // 1. Check if ID matches a built-in preset (e.g. preset-classic, preset-modern)
    const matchedPreset = BUILT_IN_PRESETS.find(
      (p) => p.id === templateId || p.presetKey === templateId
    );

    if (matchedPreset) {
      const synthetic = presetToReceiptTemplate(matchedPreset);
      setTemplateName(`${matchedPreset.name} (Custom)`);
      setTemplateDescription(`Custom template derived from ${matchedPreset.name}`);
      setInitialName(`${matchedPreset.name} (Custom)`);
      setInitialDescription(`Custom template derived from ${matchedPreset.name}`);
      setDraftConfig(JSON.parse(JSON.stringify(synthetic.template_config)));
      setInitialConfig(JSON.stringify(synthetic.template_config));
      setIsPresetBase(true);
      setLoadedTemplateId(matchedPreset.id);
      return;
    }

    // 2. Check if creating new from scratch/source
    const sourcePresetKey = searchParams.get('source') || 'modern';
    if (templateId === 'new') {
      const sourcePreset =
        BUILT_IN_PRESETS.find((p) => p.presetKey === sourcePresetKey) || BUILT_IN_PRESETS[1];
      setTemplateName('New Custom Template');
      setTemplateDescription('Custom configured receipt format');
      setInitialName('New Custom Template');
      setInitialDescription('Custom configured receipt format');
      setDraftConfig(JSON.parse(JSON.stringify(sourcePreset.config)));
      setInitialConfig(JSON.stringify(sourcePreset.config));
      setIsPresetBase(true);
      setLoadedTemplateId('new');
      return;
    }

    // 3. Search saved templates from database
    if (templates && templates.length > 0) {
      const found = templates.find((t) => t.id === templateId);
      if (found) {
        setTemplateName(found.name);
        setTemplateDescription(found.description || '');
        setInitialName(found.name);
        setInitialDescription(found.description || '');
        setDraftConfig(JSON.parse(JSON.stringify(found.template_config)));
        setInitialConfig(JSON.stringify(found.template_config));
        setIsPresetBase(false);
        setLoadedTemplateId(found.id);
      } else {
        // Fallback to first template or modern preset
        const fallback = templates[0] || presetToReceiptTemplate(BUILT_IN_PRESETS[1]);
        setTemplateName(fallback.name);
        setTemplateDescription(fallback.description || '');
        setInitialName(fallback.name);
        setInitialDescription(fallback.description || '');
        setDraftConfig(JSON.parse(JSON.stringify(fallback.template_config)));
        setInitialConfig(JSON.stringify(fallback.template_config));
        setLoadedTemplateId(fallback.id);
      }
    }
  }, [templateId, templates, isLoading, searchParams]);

  // Dirty tracking for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!draftConfig || !initialConfig) return false;
    return JSON.stringify(draftConfig) !== initialConfig
      || templateName !== initialName
      || templateDescription !== initialDescription;
  }, [draftConfig, initialConfig, templateName, initialName, templateDescription, initialDescription]);

  useEffect(() => {
    const protectDraft = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [hasUnsavedChanges]);

  // Safe navigation with unsaved changes prompt
  const handleSafeBack = () => {
    const targetUrl =
      loadedTemplateId && loadedTemplateId !== 'new' && !loadedTemplateId.startsWith('preset-')
        ? `/admin/settings/receipts/${loadedTemplateId}/preview`
        : ROUTES.ADMIN.RECEIPTS;
    if (hasUnsavedChanges) {
      setPendingNavigateUrl(targetUrl);
      setShowDiscardAlert(true);
    } else {
      navigate(targetUrl);
    }
  };

  // Helper to update draft config state
  const updateDraft = (updater: (prev: ReceiptTemplateConfig) => ReceiptTemplateConfig) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      return updater(JSON.parse(JSON.stringify(prev)));
    });
  };

  // Section sequence reordering helper
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

  // Reset changes back to initial state
  const handleResetDraft = () => {
    if (initialConfig) {
      setDraftConfig(JSON.parse(initialConfig));
      setTemplateName(initialName);
      setTemplateDescription(initialDescription);
      toast.add({
        title: 'Changes Reset',
        description: 'Receipt settings restored to last saved state.',
        type: 'info',
      });
    }
  };

  // Save template mutation
  const handleSave = async (andActivate = false): Promise<ReceiptTemplate | null> => {
    if (!draftConfig) return null;
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      toast.add({
        title: 'Template Name Required',
        description: 'Please enter a name for this receipt template.',
        type: 'error',
      });
      return null;
    }

    try {
      let savedResult: ReceiptTemplate;

      if (isPresetBase || loadedTemplateId === 'new' || loadedTemplateId?.startsWith('preset-')) {
        // Create as new custom template
        savedResult = await createMutation.mutateAsync({
          name: trimmedName,
          description: templateDescription.trim() || `Custom copy based on ${trimmedName}`,
          is_active: andActivate,
          paper_width: draftConfig.paperWidth,
          template_config: draftConfig,
        });

        setIsPresetBase(false);
        setLoadedTemplateId(savedResult.id);
        setInitialConfig(JSON.stringify(savedResult.template_config));
        setInitialName(savedResult.name);
        setInitialDescription(savedResult.description || '');
        navigate(`/admin/settings/receipts/${savedResult.id}/edit`, { replace: true });
      } else {
        // Update existing template
        savedResult = await updateMutation.mutateAsync({
          id: loadedTemplateId!,
          input: {
            name: trimmedName,
            description: templateDescription.trim(),
            paper_width: draftConfig.paperWidth,
            template_config: draftConfig,
          },
        });

        if (andActivate && !savedResult.is_active) {
          await activateMutation.mutateAsync(savedResult.id);
        }

        setInitialConfig(JSON.stringify(savedResult.template_config));
        setInitialName(savedResult.name);
        setInitialDescription(savedResult.description || '');
      }

      toast.add({
        title: andActivate ? 'Template Saved & Activated' : 'Template Saved',
        description: `Successfully saved "${trimmedName}".`,
        type: 'success',
      });

      return savedResult;
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Template',
        description: err.message || 'Failed to persist receipt template.',
        type: 'error',
      });
      return null;
    }
  };

  // Save and directly navigate to full preview
  const handleSaveAndPreview = async () => {
    const saved = await handleSave(false);
    if (saved) {
      navigate(`/admin/settings/receipts/${saved.id}/preview`);
    }
  };

  // Save As New Template Modal
  const handleSaveAsSubmit = async () => {
    if (!saveAsName.trim() || !draftConfig) return;
    try {
      const created = await createMutation.mutateAsync({
        name: saveAsName.trim(),
        description: `Custom copy of ${templateName}`,
        is_active: false,
        paper_width: draftConfig.paperWidth,
        template_config: draftConfig,
      });

      setShowSaveAsDialog(false);
      navigate(`/admin/settings/receipts/${created.id}/edit`);
      toast.add({
        title: 'Saved As New Template',
        description: `Created new template "${created.name}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Save As Failed',
        description: err.message || 'Unable to create copy.',
        type: 'error',
      });
    }
  };

  // Delete Custom Template
  const handleDeleteTemplate = async () => {
    if (!loadedTemplateId || isPresetBase) return;
    try {
      await deleteMutation.mutateAsync(loadedTemplateId);
      setShowDeleteAlert(false);
      toast.add({
        title: 'Template Deleted',
        description: 'Custom receipt template removed.',
        type: 'success',
      });
      navigate(ROUTES.ADMIN.RECEIPTS);
    } catch (err: any) {
      toast.add({
        title: 'Deletion Failed',
        description: err.message || 'Cannot delete active or built-in template.',
        type: 'error',
      });
    }
  };

  // Transmit live draft to Bluetooth thermal printer
  const handleTestPrint = async () => {
    if (!draftConfig) return;
    setIsTestPrinting(true);
    try {
      const sampleOrder =
        previewDataset === 'payLater'
          ? SAMPLE_DATASETS.payLater
          : previewDataset === 'walkIn'
          ? SAMPLE_DATASETS.walkIn
          : SAMPLE_DATASETS.paid;

      const success = await printCustomReceipt(sampleOrder, draftConfig, cafeSettings);
      if (success) {
        toast.add({
          title: 'Test Print Transmitted',
          description: `Transmitted ${draftConfig.paperWidth} cols byte stream to printer.`,
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Test Print Failed',
          description: 'Unable to send byte stream. Check Bluetooth connection.',
          type: 'error',
        });
      }
    } finally {
      setIsTestPrinting(false);
    }
  };

  if (isLoading || !draftConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <HugeiconsIcon icon={RefreshIcon} size={28} className="animate-spin text-cinnamon" />
        <span className="text-sm font-semibold">Opening live receipt editor workspace...</span>
      </div>
    );
  }

  const currentSavedRecord = templates?.find((t) => t.id === loadedTemplateId);
  const isActive = currentSavedRecord?.is_active || false;
  const activeSampleOrder =
    previewDataset === 'payLater'
      ? SAMPLE_DATASETS.payLater
      : previewDataset === 'walkIn'
      ? SAMPLE_DATASETS.walkIn
      : SAMPLE_DATASETS.paid;

  return (
    <div className="space-y-5 pb-20 w-full min-w-0">
      {/* 1. STICKY TOP BAR */}
      <div className="sticky top-2 z-20 mt-2 rounded-2xl border border-border/80 bg-card/95 px-3 py-3 shadow-sm backdrop-blur-md sm:px-5 flex items-center justify-between gap-3">
        {/* Left: Back Navigation + Template Identity */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleSafeBack()}
            className="h-9 w-9 p-0 rounded-xl hover:bg-secondary shrink-0"
            title="Back to Templates Gallery"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          </Button>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              <div className="min-w-0">
                <p className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Receipt template editor</p>
                <h1 className="max-w-[130px] truncate font-heading text-sm font-bold text-foreground sm:max-w-xs sm:text-base lg:max-w-sm">
                  {templateName || 'Untitled template'}
                </h1>
              </div>

              {isActive ? (
                <Badge className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px] gap-1 px-2 py-0.5 shrink-0">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                  <span>Active</span>
                </Badge>
              ) : isPresetBase ? (
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] bg-secondary/60 shrink-0">
                  Preset Draft
                </Badge>
              ) : (
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-cinnamon border-cinnamon/30 shrink-0">
                  Custom
                </Badge>
              )}

              {hasUnsavedChanges ? (
                <Badge variant="outline" className="hidden md:inline-flex border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] shrink-0">
                  Unsaved Changes
                </Badge>
              ) : (
                <Badge variant="outline" className="hidden md:inline-flex border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] shrink-0">
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right: Workspace Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetDraft}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground rounded-xl hidden sm:flex"
            >
              <span>Reset</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestPrint}
            disabled={isTestPrinting}
            className="hidden md:flex h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
            title={printerConnected ? 'Send test to connected Bluetooth printer' : 'Test thermal print stream'}
          >
            <HugeiconsIcon icon={PrinterIcon} size={14} className="text-cinnamon" />
            <span className="hidden sm:inline">{isTestPrinting ? 'Transmitting...' : 'Test Print'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveAndPreview}
            disabled={updateMutation.isPending || createMutation.isPending}
            className="h-8.5 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs"
          >
            {updateMutation.isPending || createMutation.isPending ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={ViewIcon} size={14} />
                <span className="sm:hidden">Save</span>
                <span className="hidden sm:inline">Save & Preview</span>
              </>
            )}
          </Button>

          {!isActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSave(true)}
              disabled={activateMutation.isPending || updateMutation.isPending}
              className="h-8.5 text-xs font-bold rounded-xl border-cinnamon/40 text-cinnamon hover:bg-cinnamon/10 gap-1.5 shadow-2xs hidden md:flex"
            >
              <HugeiconsIcon icon={StarIcon} size={14} />
              <span>Save & Set Active</span>
            </Button>
          )}

          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8.5 w-8.5 p-0 rounded-xl hover:bg-secondary text-muted-foreground shrink-0"
                />
              }
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 text-xs">
              <DropdownMenuItem
                onClick={() => handleSave(false)}
                className="cursor-pointer gap-2 font-medium"
              >
                <HugeiconsIcon icon={FloppyDiskIcon} size={13} />
                <span>Save Without Leaving</span>
              </DropdownMenuItem>

              {loadedTemplateId && loadedTemplateId !== 'new' && (
                <DropdownMenuItem
                  onClick={() => navigate(`/admin/settings/receipts/${loadedTemplateId}/preview`)}
                  className="cursor-pointer gap-2 font-medium"
                >
                  <HugeiconsIcon icon={ViewIcon} size={13} />
                  <span>View Full Preview</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSaveAsName(`${templateName} Copy`);
                  setShowSaveAsDialog(true);
                }}
                className="cursor-pointer gap-2 font-medium"
              >
                <HugeiconsIcon icon={Copy01Icon} size={13} />
                <span>Save As New Copy</span>
              </DropdownMenuItem>

              {!isPresetBase && !isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteAlert(true)}
                    className="cursor-pointer gap-2 font-medium text-destructive focus:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={13} />
                    <span>Delete Template</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. TABLET / MOBILE TAB SWITCHER */}
      <div className="flex xl:hidden bg-secondary/60 p-1 rounded-xl border border-border/80 shadow-2xs">
        <Button
          type="button"
          onClick={() => setActiveMobileTab('customize')}
          variant={activeMobileTab === 'customize' ? 'default' : 'ghost'}
          className={`flex-1 text-xs font-bold h-9 rounded-lg ${
            activeMobileTab === 'customize' ? 'bg-cinnamon text-white shadow-2xs' : 'text-muted-foreground'
          }`}
        >
          <HugeiconsIcon icon={Settings01Icon} size={14} className="mr-1.5" />
          <span>Customize</span>
        </Button>
        <Button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          variant={activeMobileTab === 'preview' ? 'default' : 'ghost'}
          className={`flex-1 text-xs font-bold h-9 rounded-lg ${
            activeMobileTab === 'preview' ? 'bg-cinnamon text-white shadow-2xs' : 'text-muted-foreground'
          }`}
        >
          <HugeiconsIcon icon={ViewIcon} size={14} className="mr-1.5" />
          <span>Live Preview</span>
        </Button>
      </div>

      {/* 3. MAIN WORKSPACE GRID (stacks through tablet / splits on large desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 items-start w-full min-w-0">
        {/* LEFT COLUMN: Scrollable Customization Controls */}
        <div
          className={`xl:col-span-5 space-y-4 w-full min-w-0 ${
            activeMobileTab === 'preview' ? 'hidden xl:block' : 'block'
          }`}
        >
          <div className="flex items-end justify-between gap-3 px-1 pb-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnamon">Customize template</p>
              <h2 className="font-heading text-base font-bold text-foreground">Receipt content & layout</h2>
            </div>
            <Badge variant="outline" className="bg-card text-[10px] font-semibold text-muted-foreground">9 sections</Badge>
          </div>

          <Accordion defaultValue={['paper']} className="space-y-3 w-full">
            {/* Section 1: Template & Paper Setup */}
            <AccordionItem value="paper" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      1. Paper Roll Width & Identity
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Select 58mm compact or 80mm wide thermal roll format
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-1 pb-5 text-xs">
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="receipt-template-name" className="text-xs font-semibold text-foreground">Template name</Label>
                    <Input
                      id="receipt-template-name"
                      value={templateName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
                      placeholder="e.g. Counter receipt"
                      className="h-9 rounded-xl bg-card text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="receipt-template-description" className="text-xs font-semibold text-foreground">Internal description</Label>
                    <Textarea
                      id="receipt-template-description"
                      value={templateDescription}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTemplateDescription(e.target.value)}
                      placeholder="Where and when this layout is used"
                      className="min-h-[72px] resize-none rounded-xl bg-card text-xs leading-relaxed"
                    />
                    <p className="text-[10px] leading-relaxed text-muted-foreground">Visible to admins in the template gallery; it is not printed on receipts.</p>
                  </div>
                </div>

                {/* Paper Roll Width Segmented Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground block">
                    Paper Roll Width Format
                  </Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => updateDraft((prev) => ({ ...prev, paperWidth: 32 }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        draftConfig.paperWidth === 32
                          ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                          : 'bg-secondary/30 border-border/80 text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">58 mm Roll</span>
                        <Badge variant={draftConfig.paperWidth === 32 ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                          32 Cols
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Standard compact portable printer</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateDraft((prev) => ({ ...prev, paperWidth: 48 }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        draftConfig.paperWidth === 48
                          ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                          : 'bg-secondary/30 border-border/80 text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">80 mm Roll</span>
                        <Badge variant={draftConfig.paperWidth === 48 ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                          48 Cols
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Wide desktop thermal printer</p>
                    </button>
                  </div>
                </div>

              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Cafe Header & Branding */}
            <AccordionItem value="branding" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      2. Cafe Header & Branding
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Cafe name, alignment, tagline, address, and phone details
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-1 pb-5 text-xs">
                {/* Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Cafe Name</Label>
                    <Switch
                      checked={draftConfig.header.cafeNameVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, cafeNameVisible: val } }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Tagline</Label>
                    <Switch
                      checked={draftConfig.header.taglineVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, taglineVisible: val } }))
                      }
                    />
                  </div>
                </div>

                {/* Cafe Name & Tagline Inputs */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-foreground">Cafe Display Name</Label>
                    <Input
                      value={draftConfig.header.cafeNameText}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, cafeNameText: e.target.value } }))
                      }
                      placeholder={cafeSettings?.cafe_name || 'RadhaCafe'}
                      className="h-9 text-xs rounded-xl mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-foreground">Tagline Text</Label>
                    <Input
                      value={draftConfig.header.taglineText}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateDraft((prev) => ({ ...prev, header: { ...prev.header, taglineText: e.target.value } }))
                      }
                      placeholder={cafeSettings?.tagline || 'Fresh Sips & Bites'}
                      className="h-9 text-xs rounded-xl mt-1"
                    />
                  </div>

                  {/* Alignment & Emphasis Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Header Alignment</Label>
                      <div className="flex items-center bg-secondary/40 p-1 rounded-xl border border-border/70">
                        {(['left', 'center', 'right'] as AlignmentType[]).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() =>
                              updateDraft((prev) => ({ ...prev, header: { ...prev.header, alignment: align } }))
                            }
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                              draftConfig.header.alignment === align
                                ? 'bg-card text-foreground shadow-2xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Header Typography</Label>
                      <div className="flex items-center bg-secondary/40 p-1 rounded-xl border border-border/70">
                        {(['normal', 'bold', 'double_size'] as EmphasisType[]).map((emp) => (
                          <button
                            key={emp}
                            type="button"
                            onClick={() =>
                              updateDraft((prev) => ({ ...prev, header: { ...prev.header, emphasis: emp } }))
                            }
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                              draftConfig.header.emphasis === emp
                                ? 'bg-card text-foreground shadow-2xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {emp === 'double_size' ? 'Large' : emp}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Address, Phone & Email */}
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-xs font-semibold text-foreground">Address</Label>
                          <Switch
                            checked={draftConfig.header.addressVisible}
                            onCheckedChange={(val: boolean) =>
                              updateDraft((prev) => ({ ...prev, header: { ...prev.header, addressVisible: val } }))
                            }
                          />
                        </div>
                        <Input
                          value={draftConfig.header.addressText}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateDraft((prev) => ({ ...prev, header: { ...prev.header, addressText: e.target.value } }))
                          }
                          placeholder={cafeSettings?.address || 'Near Bus Stand'}
                          className="h-9 text-xs rounded-xl"
                          disabled={!draftConfig.header.addressVisible}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-xs font-semibold text-foreground">Phone</Label>
                          <Switch
                            checked={draftConfig.header.phoneVisible}
                            onCheckedChange={(val: boolean) =>
                              updateDraft((prev) => ({ ...prev, header: { ...prev.header, phoneVisible: val } }))
                            }
                          />
                        </div>
                        <Input
                          value={draftConfig.header.phoneText}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateDraft((prev) => ({ ...prev, header: { ...prev.header, phoneText: e.target.value } }))
                          }
                          placeholder={cafeSettings?.phone || '+91 9876543210'}
                          className="h-9 text-xs rounded-xl"
                          disabled={!draftConfig.header.phoneVisible}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs font-semibold text-foreground">Email</Label>
                        <Switch
                          checked={draftConfig.header.emailVisible}
                          onCheckedChange={(val: boolean) =>
                            updateDraft((prev) => ({ ...prev, header: { ...prev.header, emailVisible: val } }))
                          }
                        />
                      </div>
                      <Input
                        value={draftConfig.header.emailText}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateDraft((prev) => ({ ...prev, header: { ...prev.header, emailText: e.target.value } }))
                        }
                        placeholder={cafeSettings?.email || 'orders@radhacafe.com'}
                        className="h-9 text-xs rounded-xl"
                        disabled={!draftConfig.header.emailVisible}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Order Details */}
            <AccordionItem value="orderInfo" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      3. Order Information Metadata
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Order number, timestamp, cashier name, and order status
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3.5 pt-1 pb-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Order Number</Label>
                    <Switch
                      checked={draftConfig.orderInfo.orderNumberVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, orderInfo: { ...prev.orderInfo, orderNumberVisible: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Date & Time</Label>
                    <Switch
                      checked={draftConfig.orderInfo.dateVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, orderInfo: { ...prev.orderInfo, dateVisible: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Cashier Name</Label>
                    <Switch
                      checked={draftConfig.orderInfo.cashierVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, orderInfo: { ...prev.orderInfo, cashierVisible: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Order Status</Label>
                    <Switch
                      checked={draftConfig.orderInfo.statusVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, orderInfo: { ...prev.orderInfo, statusVisible: val } }))
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4: Customer Details & Pay Later */}
            <AccordionItem value="customer" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      4. Customer Details & Credit Ledger
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Customer name, phone, and Pay Later account indicator
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3.5 pt-1 pb-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Customer Name</Label>
                    <Switch
                      checked={draftConfig.customerInfo.customerNameVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({
                          ...prev,
                          customerInfo: { ...prev.customerInfo, customerNameVisible: val },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Customer Phone</Label>
                    <Switch
                      checked={draftConfig.customerInfo.phoneVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({
                          ...prev,
                          customerInfo: { ...prev.customerInfo, phoneVisible: val },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Credit Status</Label>
                    <Switch
                      checked={draftConfig.customerInfo.paymentStatusVisible}
                      onCheckedChange={(val: boolean) =>
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

            {/* Section 5: Items Presentation */}
            <AccordionItem value="items" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      5. Items Table & Wrapping
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Table headers, unit rates, two-line wrapping, and item dividers
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3.5 pt-1 pb-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Table Headers</Label>
                    <Switch
                      checked={draftConfig.items.showHeaders}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, items: { ...prev.items, showHeaders: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Unit Price (Rate)</Label>
                    <Switch
                      checked={draftConfig.items.showUnitPrice}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, items: { ...prev.items, showUnitPrice: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Divider Before Items</Label>
                    <Switch
                      checked={draftConfig.items.dividerBefore}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, items: { ...prev.items, dividerBefore: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Divider After Items</Label>
                    <Switch
                      checked={draftConfig.items.dividerAfter}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, items: { ...prev.items, dividerAfter: val } }))
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 6: Totals Breakdown */}
            <AccordionItem value="totals" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      6. Totals Breakdown & Emphasis
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Subtotal, GST Tax, Discount, Grand Total size, and Pay Later balance
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3.5 pt-1 pb-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Subtotal</Label>
                    <Switch
                      checked={draftConfig.summary.subtotalVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, summary: { ...prev.summary, subtotalVisible: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show GST Tax Line</Label>
                    <Switch
                      checked={draftConfig.summary.taxVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, summary: { ...prev.summary, taxVisible: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Discount Line</Label>
                    <Switch
                      checked={draftConfig.summary.discountVisible}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, summary: { ...prev.summary, discountVisible: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Divider Before Total</Label>
                    <Switch
                      checked={draftConfig.summary.dividerBeforeTotal}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, summary: { ...prev.summary, dividerBeforeTotal: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Bold Grand Total</Label>
                    <Switch
                      checked={draftConfig.summary.grandTotalBold}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, summary: { ...prev.summary, grandTotalBold: val } }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                    <Label className="text-xs font-semibold text-foreground cursor-pointer">Large Double-Size Total</Label>
                    <Switch
                      checked={draftConfig.summary.doubleSizeTotal}
                      onCheckedChange={(val: boolean) =>
                        updateDraft((prev) => ({ ...prev, summary: { ...prev.summary, doubleSizeTotal: val } }))
                      }
                    />
                  </div>
                </div>

                {/* Pay Later & Payment Options */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="font-bold text-foreground text-xs block">Payment Breakdown Options</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                      <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Paid Amount</Label>
                      <Switch
                        checked={draftConfig.payment.amountPaidVisible}
                        onCheckedChange={(val: boolean) =>
                          updateDraft((prev) => ({ ...prev, payment: { ...prev.payment, amountPaidVisible: val } }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                      <Label className="text-xs font-semibold text-foreground cursor-pointer">Show Due Balance (Credit)</Label>
                      <Switch
                        checked={draftConfig.payment.amountDueVisible}
                        onCheckedChange={(val: boolean) =>
                          updateDraft((prev) => ({ ...prev, payment: { ...prev.payment, amountDueVisible: val } }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 7: Dividers & Feed Spacing */}
            <AccordionItem value="dividers" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      7. Dividers & Paper Feed
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Separator characters and blank paper feed lines before cut
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-1 pb-5 text-xs">
                {/* Divider Style Buttons */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Thermal Divider Character Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      { id: 'dashed', label: 'Dashed ( - - - )' },
                      { id: 'solid', label: 'Solid ( ─── )' },
                      { id: 'double', label: 'Double ( === )' },
                      { id: 'none', label: 'None' },
                    ].map((div) => (
                      <button
                        key={div.id}
                        type="button"
                        onClick={() =>
                          updateDraft((prev) => ({ ...prev, dividerStyle: div.id as DividerStyleType }))
                        }
                        className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                          draftConfig.dividerStyle === div.id
                            ? 'bg-cinnamon/10 border-cinnamon text-cinnamon ring-1 ring-cinnamon shadow-2xs'
                            : 'bg-secondary/30 border-border/80 text-foreground hover:bg-secondary/60'
                        }`}
                      >
                        {div.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feed Lines After Cut */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold text-foreground">Paper Feed Lines After Print</Label>
                  <div className="flex items-center bg-secondary/40 p-1 rounded-xl border border-border/70 max-w-sm">
                    {[1, 2, 3, 4, 5].map((lines) => (
                      <button
                        key={lines}
                        type="button"
                        onClick={() => updateDraft((prev) => ({ ...prev, feedLines: lines }))}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          (draftConfig.feedLines || 3) === lines
                            ? 'bg-card text-foreground shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {lines} {lines === 1 ? 'line' : 'lines'}
                      </button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 8: Footer Messages */}
            <AccordionItem value="footer" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      8. Receipt Footer Messages
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Thank-you note, visit again, and catering / water contacts
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3.5 pt-1 pb-5 text-xs">
                <div>
                  <Label className="text-xs font-semibold text-foreground">Primary Thank-You Message</Label>
                  <Input
                    value={draftConfig.footer.thankYouMessage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, thankYouMessage: e.target.value } }))
                    }
                    placeholder="Thank you for visiting RadhaCafe!"
                    className="h-9 text-xs rounded-xl mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">Secondary Message</Label>
                  <Input
                    value={draftConfig.footer.secondaryMessage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, secondaryMessage: e.target.value } }))
                    }
                    placeholder="Please visit us again."
                    className="h-9 text-xs rounded-xl mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">Contact / Catering Message</Label>
                  <Input
                    value={draftConfig.footer.contactMessage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, contactMessage: e.target.value } }))
                    }
                    placeholder="For bulk & catering orders: 9876543210"
                    className="h-9 text-xs rounded-xl mt-1"
                  />
                </div>

                {/* Alignment & Emphasis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Footer Alignment</Label>
                    <div className="flex items-center bg-secondary/40 p-1 rounded-xl border border-border/70">
                      {(['left', 'center', 'right'] as AlignmentType[]).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() =>
                            updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, alignment: align } }))
                          }
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                            draftConfig.footer.alignment === align
                              ? 'bg-card text-foreground shadow-2xs font-bold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Footer Typography</Label>
                    <div className="flex items-center bg-secondary/40 p-1 rounded-xl border border-border/70">
                      {(['normal', 'bold'] as EmphasisType[]).map((emp) => (
                        <button
                          key={emp}
                          type="button"
                          onClick={() =>
                            updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, emphasis: emp } }))
                          }
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                            draftConfig.footer.emphasis === emp
                              ? 'bg-card text-foreground shadow-2xs font-bold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {emp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 9: Section Reordering */}
            <AccordionItem value="sequence" className="border border-border/80 rounded-2xl bg-card px-4 sm:px-5 shadow-xs overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm font-heading text-foreground block">
                      9. Section Order & Sequence
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Adjust vertical sequence of receipt components
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2.5 pt-1 pb-5 text-xs">
                <p className="text-[11px] text-muted-foreground mb-2">
                  Click the arrow buttons to move sections up or down:
                </p>
                <div className="space-y-2">
                  {draftConfig.sectionOrder.map((sec: SectionType, idx: number) => (
                    <div
                      key={sec}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border/60 bg-secondary/30 text-xs font-bold"
                    >
                      <span className="capitalize text-foreground">
                        {sec === 'orderInfo'
                          ? 'Order Details'
                          : sec === 'customerInfo'
                          ? 'Customer Details'
                          : sec === 'items'
                          ? 'Item List'
                          : sec === 'summary'
                          ? 'Totals Summary'
                          : sec === 'payment'
                          ? 'Payment Details'
                          : sec}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Move section up"
                        >
                          <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                        </Button>
                        <Button
                          type="button"
                          disabled={idx === draftConfig.sectionOrder.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Move section down"
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

        {/* RIGHT COLUMN: Sticky Live Receipt Preview */}
        <div
          className={`xl:col-span-7 xl:sticky xl:top-20 space-y-4 w-full min-w-0 ${
            activeMobileTab === 'customize' ? 'hidden xl:block' : 'block'
          }`}
        >
          <Card className="rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden w-full min-w-0">
            {/* Live Preview Header & Inspection Toolbar */}
            <CardHeader className="p-4 sm:p-5 border-b border-border/70 pb-3.5 space-y-3 bg-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground flex items-center gap-2">
                    <span>Live receipt preview</span>
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">Live</Badge>
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Updates instantly as you edit · {draftConfig.paperWidth === 48 ? '80 mm' : '58 mm'} thermal roll
                  </p>
                </div>

                <span className="hidden sm:inline-flex rounded-lg border border-border/70 bg-secondary/40 px-2 py-1 font-mono text-[10px] font-bold text-muted-foreground">
                  {draftConfig.paperWidth} columns
                </span>
              </div>

              {/* Toolbar Controls (Paper Width, Dataset Switcher, Zoom) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/60 text-xs">
                {/* Dataset Selector */}
                <div role="group" aria-label="Preview sample order" className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => setPreviewDataset('paid')}
                    aria-pressed={previewDataset === 'paid'}
                    className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
                      previewDataset === 'paid'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Paid (UPI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDataset('payLater')}
                    aria-pressed={previewDataset === 'payLater'}
                    className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
                      previewDataset === 'payLater'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pay Later
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDataset('walkIn')}
                    aria-pressed={previewDataset === 'walkIn'}
                    className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
                      previewDataset === 'walkIn'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Walk-in
                  </button>
                </div>

                {/* Width & Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5">
                    {draftConfig.paperWidth === 48 ? '80 mm' : '58 mm'}
                  </Badge>

                  <div role="group" aria-label="Preview zoom" className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border/60">
                    {[85, 100].map((zoom) => (
                      <button
                        key={zoom}
                        type="button"
                        aria-pressed={previewZoom === zoom}
                        onClick={() => setPreviewZoom(zoom)}
                        className={`h-8 rounded-lg px-2 text-[10px] font-mono font-bold transition-colors ${
                          previewZoom === zoom ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {zoom}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Scrollable Monospace Thermal Paper Surface */}
            <CardContent className="p-4 sm:p-7 bg-[#eee9e1] dark:bg-[#171512] flex justify-center overflow-y-auto max-h-[calc(100vh-255px)] min-h-[460px] sm:min-h-[540px] bg-[radial-gradient(circle_at_1px_1px,rgba(91,72,52,0.12)_1px,transparent_0)] bg-size-[22px_22px]">
              <div
                style={{ zoom: previewZoom / 100 }}
                className="w-full flex justify-center min-w-0"
              >
                <ReceiptPreview
                  order={activeSampleOrder}
                  templateConfig={draftConfig}
                  cafeSettings={cafeSettings}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. MODAL: Save As New Template */}
      <Dialog open={showSaveAsDialog} onOpenChange={setShowSaveAsDialog}>
        <DialogContent className="max-w-md bg-card border border-border/80 p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-heading text-foreground">
              Save As New Receipt Template
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create an independent copy of this receipt design with a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold text-foreground">New Template Name</Label>
              <Input
                value={saveAsName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSaveAsName(e.target.value)}
                placeholder="e.g. Catering Detailed Slip"
                className="h-9 text-xs rounded-xl mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSaveAsDialog(false)}
              className="text-xs rounded-xl h-9 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveAsSubmit}
              disabled={createMutation.isPending}
              className="text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white h-9 gap-1.5"
            >
              <HugeiconsIcon icon={FloppyDiskIcon} size={14} />
              <span>Save Copy</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. ALERT: Discard Unsaved Changes */}
      <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent className="bg-card border border-border/80 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-foreground">
              Discard unsaved receipt changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You have unsaved changes to "{templateName}". Navigating away will lose your current modifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-xl h-9">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDiscardAlert(false);
                if (pendingNavigateUrl) navigate(pendingNavigateUrl);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-xl h-9"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 6. ALERT: Delete Template */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-card border border-border/80 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-destructive">
              Delete receipt template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete <strong>{templateName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-xl h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-xl h-9"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
