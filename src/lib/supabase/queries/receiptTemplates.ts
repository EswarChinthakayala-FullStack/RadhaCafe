import { supabase } from '../client';
import type { ReceiptTemplate, CreateReceiptTemplateInput, UpdateReceiptTemplateInput } from '../../../types';

const db = () => supabase.from('receipt_templates' as any);

/**
 * Fetches all saved receipt templates ordered by name
 */
export async function fetchReceiptTemplates(): Promise<ReceiptTemplate[]> {
  const { data, error } = await db()
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching receipt templates:', error);
    throw new Error(error.message || 'Failed to fetch receipt templates');
  }

  return (data || []) as ReceiptTemplate[];
}

/**
 * Fetches the currently active receipt template
 */
export async function fetchActiveReceiptTemplate(): Promise<ReceiptTemplate | null> {
  const { data, error } = await db()
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active receipt template:', error);
    return null;
  }

  return data as ReceiptTemplate | null;
}

/**
 * Creates a new receipt template
 */
export async function createReceiptTemplate(input: CreateReceiptTemplateInput): Promise<ReceiptTemplate> {
  const { data, error } = await (supabase as any)
    .from('receipt_templates')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error creating receipt template:', error);
    throw new Error(error.message || 'Failed to create receipt template');
  }

  return data as ReceiptTemplate;
}

/**
 * Updates an existing receipt template
 */
export async function updateReceiptTemplate(id: string, input: UpdateReceiptTemplateInput): Promise<ReceiptTemplate> {
  const { data, error } = await (supabase as any)
    .from('receipt_templates')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating receipt template:', error);
    throw new Error(error.message || 'Failed to update receipt template');
  }

  return data as ReceiptTemplate;
}

/**
 * Duplicates a template and saves it as a new copy
 */
export async function duplicateReceiptTemplate(id: string): Promise<ReceiptTemplate> {
  const { data: original, error: fetchErr } = await (supabase as any)
    .from('receipt_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !original) {
    throw new Error(fetchErr?.message || 'Original template not found for duplication');
  }

  const origRecord = original as ReceiptTemplate;

  const copyInput: CreateReceiptTemplateInput = {
    name: `${origRecord.name} (Copy)`,
    description: origRecord.description ? `${origRecord.description} - Copy` : 'Duplicated template',
    is_active: false, // Never activate copies automatically
    paper_width: origRecord.paper_width,
    template_config: origRecord.template_config,
  };

  return createReceiptTemplate(copyInput);
}

/**
 * Deletes a receipt template (Guarded against active template deletion)
 */
export async function deleteReceiptTemplate(id: string): Promise<void> {
  const { data: target, error: fetchErr } = await (supabase as any)
    .from('receipt_templates')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchErr) {
    throw new Error(fetchErr.message || 'Template not found');
  }

  if ((target as any)?.is_active) {
    throw new Error('This template is currently active. Activate another template before deleting it.');
  }

  const { error } = await (supabase as any)
    .from('receipt_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting receipt template:', error);
    throw new Error(error.message || 'Failed to delete receipt template');
  }
}

/**
 * Sets a specific receipt template as active and deactivates all others
 */
export async function activateReceiptTemplate(id: string): Promise<ReceiptTemplate> {
  // 1. Deactivate all existing templates
  await (supabase as any)
    .from('receipt_templates')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Activate target template
  const { data, error } = await (supabase as any)
    .from('receipt_templates')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error activating receipt template:', error);
    throw new Error(error.message || 'Failed to activate receipt template');
  }

  return data as ReceiptTemplate;
}
