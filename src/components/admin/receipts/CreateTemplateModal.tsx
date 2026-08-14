import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { BUILT_IN_PRESETS, type PresetTemplateItem } from '../../../lib/printer/presetTemplates';
import type { ReceiptTemplateConfig } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, config: ReceiptTemplateConfig, paperWidth: number) => Promise<void>;
  isCreating?: boolean;
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
}: CreateTemplateModalProps) {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('modern');
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const selectedPreset: PresetTemplateItem =
    BUILT_IN_PRESETS.find((p) => p.presetKey === selectedPresetKey) || BUILT_IN_PRESETS[1];

  const handleSelectPreset = (preset: PresetTemplateItem) => {
    setSelectedPresetKey(preset.presetKey);
    if (!templateName || BUILT_IN_PRESETS.some((p) => templateName === `${p.name} Custom`)) {
      setTemplateName(`${preset.name} Custom`);
    }
  };

  const handleOpen = () => {
    setTemplateName('Modern Cafe Custom');
    setTemplateDescription('Customized receipt template for counter orders');
    setSelectedPresetKey('modern');
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = templateName.trim();
    if (!trimmed || trimmed.length < 2) {
      setValidationError('Template name must be at least 2 characters.');
      return;
    }

    setValidationError('');
    await onCreate(
      trimmed,
      templateDescription.trim(),
      selectedPreset.config,
      selectedPreset.defaultWidth
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) handleOpen();
        else onClose();
      }}
    >
      <DialogContent className="max-w-xl bg-card border border-border/80 p-5 sm:p-7 rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-foreground flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Add01Icon} size={18} />
            </div>
            <span>Create New Receipt Template</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Pick a proven baseline layout, give it a name, and customize every section in the full-page live editor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Step 1: Baseline Preset Selection */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-foreground block">
              1. Choose a Starting Preset Layout
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUILT_IN_PRESETS.map((preset) => {
                const isSelected = preset.presetKey === selectedPresetKey;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cinnamon/10 border-cinnamon text-foreground ring-1 ring-cinnamon shadow-2xs'
                        : 'bg-secondary/30 border-border/70 text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{preset.name}</span>
                        {isSelected && (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-cinnamon" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                        {preset.recommendedWidthLabel}
                      </Badge>
                      <span className="capitalize">{preset.config.dividerStyle} line</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Template Name & Description */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <Label className="text-xs font-bold text-foreground block">
              2. Name & Description
            </Label>

            <div className="space-y-1.5">
              <Label htmlFor="create-tmpl-name" className="text-[11px] font-semibold text-muted-foreground">
                Template Name *
              </Label>
              <Input
                id="create-tmpl-name"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="e.g. Modern Weekend Special"
                className="h-9 text-xs rounded-xl border-border/80"
                required
              />
              {validationError && (
                <p className="text-[11px] text-destructive font-medium">{validationError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-tmpl-desc" className="text-[11px] font-semibold text-muted-foreground">
                Optional Description
              </Label>
              <Input
                id="create-tmpl-desc"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="e.g. Custom layout for cafe counter with QR payment footer"
                className="h-9 text-xs rounded-xl border-border/80"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl h-9 font-semibold"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isCreating}
              className="text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white h-9 gap-1.5 shadow-2xs"
            >
              {isCreating ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  <span>Creating Template...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  <span>Create & Open Editor</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
