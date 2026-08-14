import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReceiptTemplates,
  useReceiptTemplateMutations,
} from '../../hooks/useReceiptTemplates';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { useBluetoothPrinter } from '../../hooks/useBluetoothPrinter';
import {
  BUILT_IN_PRESETS,
  SAMPLE_DATASETS,
  presetToReceiptTemplate,
} from '../../lib/printer/presetTemplates';
import type { ReceiptTemplate, ReceiptTemplateConfig } from '../../types';
import { ReceiptGalleryHeader } from '../../components/admin/receipts/ReceiptGalleryHeader';
import { ActiveTemplateHero } from '../../components/admin/receipts/ActiveTemplateHero';
import { ReceiptTemplateCard } from '../../components/admin/receipts/ReceiptTemplateCard';
import { CreateTemplateModal } from '../../components/admin/receipts/CreateTemplateModal';
import { toast } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  RefreshIcon,
  Add01Icon,
  Layout01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';

export function ReceiptsPage() {
  const navigate = useNavigate();
  const galleryRef = useRef<HTMLDivElement>(null);

  const { data: dbTemplates, isLoading, refetch } = useReceiptTemplates();
  const { data: cafeSettings } = useCafeSettings();
  const {
    isConnected: printerConnected,
    savedPrinterName,
    printCustomReceipt,
  } = useBluetoothPrinter();

  const {
    activateMutation,
    createMutation,
    deleteMutation,
  } = useReceiptTemplateMutations();

  // Dialog state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isTestPrinting, setIsTestPrinting] = useState<boolean>(false);

  // Navigate to dedicated full-page preview
  const handlePreviewTemplate = (template: ReceiptTemplate) => {
    navigate(`/admin/settings/receipts/${template.id}/preview`);
  };

  // Convert built-in presets to standard ReceiptTemplate format
  const presetTemplates = BUILT_IN_PRESETS.map((p) => presetToReceiptTemplate(p));

  // Determine currently active template
  const activeDbTemplate = dbTemplates?.find((t) => t.is_active);
  const activeTemplate: ReceiptTemplate =
    activeDbTemplate || presetTemplates[1] || presetTemplates[0]; // Modern preset default

  // Custom user templates created in database
  const customTemplates = dbTemplates || [];

  // Scroll smoothly down to the gallery section
  const handleScrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Switch active template
  const handleUseTemplate = async (template: ReceiptTemplate) => {
    try {
      if (template.id.startsWith('preset-')) {
        // If activating a preset directly, find matching existing or create a custom copy as active
        const existingMatch = dbTemplates?.find(
          (t) => t.name === template.name
        );
        if (existingMatch) {
          await activateMutation.mutateAsync(existingMatch.id);
        } else {
          await createMutation.mutateAsync({
            name: template.name,
            description: template.description || 'Active preset receipt layout',
            is_active: true,
            paper_width: template.paper_width,
            template_config: template.template_config,
          });
        }
      } else {
        await activateMutation.mutateAsync(template.id);
      }

      toast.add({
        title: 'Active Template Changed',
        description: `"${template.name}" is now set as your active receipt format.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Failed to Activate Template',
        description: err.message || 'Unable to switch active template.',
        type: 'error',
      });
    }
  };

  // Open in full-page live editor
  const handleCustomizeTemplate = (template: ReceiptTemplate) => {
    navigate(`/admin/settings/receipts/${template.id}/edit`);
  };

  // Duplicate a template
  const handleDuplicateTemplate = async (template: ReceiptTemplate) => {
    try {
      const duplicated = await createMutation.mutateAsync({
        name: `${template.name} (Copy)`,
        description: `Copy of ${template.name}`,
        is_active: false,
        paper_width: template.paper_width,
        template_config: template.template_config,
      });

      toast.add({
        title: 'Template Duplicated',
        description: `Created copy "${duplicated.name}".`,
        type: 'success',
      });
      navigate(`/admin/settings/receipts/${duplicated.id}/edit`);
    } catch (err: any) {
      toast.add({
        title: 'Duplicate Failed',
        description: err.message || 'Unable to duplicate template.',
        type: 'error',
      });
    }
  };

  // Delete a custom template
  const handleDeleteTemplate = async (template: ReceiptTemplate) => {
    if (template.is_active) {
      toast.add({
        title: 'Cannot Delete Active Template',
        description: 'Please activate a different template before deleting this one.',
        type: 'error',
      });
      return;
    }

    try {
      await deleteMutation.mutateAsync(template.id);
      toast.add({
        title: 'Template Deleted',
        description: `"${template.name}" was removed.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Delete Failed',
        description: err.message || 'Unable to delete template.',
        type: 'error',
      });
    }
  };

  // Test Print thermal slip
  const handleTestPrint = async (template: ReceiptTemplate): Promise<boolean> => {
    setIsTestPrinting(true);
    try {
      const success = await printCustomReceipt(
        SAMPLE_DATASETS.paid,
        template.template_config,
        cafeSettings
      );
      if (success) {
        toast.add({
          title: 'Test Print Sent',
          description: `Transmitted "${template.name}" test stream to printer.`,
          type: 'success',
        });
        return true;
      } else {
        toast.add({
          title: 'Test Print Failed',
          description: 'Could not send test print. Check Bluetooth printer connection.',
          type: 'error',
        });
        return false;
      }
    } finally {
      setIsTestPrinting(false);
    }
  };

  // Handle Create Template modal submit
  const handleCreateSubmit = async (
    name: string,
    description: string,
    config: ReceiptTemplateConfig,
    paperWidth: number
  ) => {
    try {
      const created = await createMutation.mutateAsync({
        name,
        description,
        is_active: false,
        paper_width: paperWidth,
        template_config: config,
      });

      setIsCreateModalOpen(false);
      toast.add({
        title: 'Template Created',
        description: `Created "${created.name}". Opening live editor...`,
        type: 'success',
      });
      navigate(`/admin/settings/receipts/${created.id}/edit`);
    } catch (err: any) {
      toast.add({
        title: 'Creation Failed',
        description: err.message || 'Unable to create template.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-muted-foreground">
        <HugeiconsIcon icon={RefreshIcon} size={28} className="animate-spin text-cinnamon" />
        <span className="text-sm font-semibold">Loading receipt template gallery...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 w-full min-w-0">
      {/* 1. Page Header */}
      <ReceiptGalleryHeader
        onCreateTemplate={() => setIsCreateModalOpen(true)}
        printerConnected={printerConnected}
        savedPrinterName={savedPrinterName}
      />

      {/* 2. Active Template Hero Card */}
      <div className="space-y-3 w-full min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} size={17} className="text-cinnamon" />
            <h2 className="text-sm sm:text-base font-bold font-heading text-foreground">
              Active Printing Layout
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
          >
            <HugeiconsIcon icon={RefreshIcon} size={12} className="mr-1" />
            <span>Refresh</span>
          </Button>
        </div>

        <ActiveTemplateHero
          activeTemplate={activeTemplate}
          cafeSettings={cafeSettings}
          onCustomize={handleCustomizeTemplate}
          onPreview={handlePreviewTemplate}
          onTestPrint={() => handleTestPrint(activeTemplate)}
          isTestPrinting={isTestPrinting}
          onScrollToGallery={handleScrollToGallery}
        />
      </div>

      {/* 3. Built-in Presets Gallery */}
      <div ref={galleryRef} className="space-y-4 w-full min-w-0 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Layout01Icon} size={18} className="text-cinnamon" />
              <span>Built-in Preset Designs</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Production-tested baseline formats for RadhaCafe counter and mobile thermal printers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full min-w-0">
          {presetTemplates.map((preset) => {
            const isThisActive =
              activeTemplate.name === preset.name ||
              (activeTemplate.id.startsWith('preset-') && activeTemplate.id === preset.id);

            return (
              <ReceiptTemplateCard
                key={preset.id}
                template={preset}
                isPreset={true}
                isActive={isThisActive}
                cafeSettings={cafeSettings}
                onPreview={handlePreviewTemplate}
                onUseTemplate={handleUseTemplate}
                onCustomize={handleCustomizeTemplate}
                isActivating={activateMutation.isPending}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Custom Templates Section */}
      <div className="space-y-4 w-full min-w-0 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Add01Icon} size={18} className="text-cinnamon" />
              <span>Custom Templates & Copies ({customTemplates.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Tailored receipt configurations saved to your cafe account.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <HugeiconsIcon icon={Add01Icon} size={13} className="text-cinnamon" />
            <span>New Custom Template</span>
          </Button>
        </div>

        {customTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
            {customTemplates.map((tmpl) => (
              <ReceiptTemplateCard
                key={tmpl.id}
                template={tmpl}
                isPreset={false}
                isActive={tmpl.is_active}
                cafeSettings={cafeSettings}
                onPreview={handlePreviewTemplate}
                onUseTemplate={handleUseTemplate}
                onCustomize={handleCustomizeTemplate}
                onDuplicate={handleDuplicateTemplate}
                onDelete={handleDeleteTemplate}
                isActivating={activateMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-border/80 bg-card/50 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cinnamon/10 text-cinnamon flex items-center justify-center mx-auto border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Layout01Icon} size={24} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-sm text-foreground font-heading">
                No Custom Templates Yet
              </h3>
              <p className="text-xs text-muted-foreground">
                Customize one of the presets above or create a new custom receipt format for catering, events, or specialized billing.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs mt-2"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} />
              <span>Create First Custom Template</span>
            </Button>
          </div>
        )}
      </div>

      {/* 5. Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSubmit}
        isCreating={createMutation.isPending}
      />
    </div>
  );
}
