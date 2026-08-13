import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReceiptTemplates,
  fetchActiveReceiptTemplate,
  createReceiptTemplate,
  updateReceiptTemplate,
  duplicateReceiptTemplate,
  deleteReceiptTemplate,
  activateReceiptTemplate,
} from '../lib/supabase/queries/receiptTemplates';
import type { CreateReceiptTemplateInput, UpdateReceiptTemplateInput } from '../types';

export const RECEIPT_TEMPLATES_QUERY_KEY = ['receipt-templates'];
export const ACTIVE_RECEIPT_TEMPLATE_QUERY_KEY = ['receipt-templates', 'active'];

/**
 * Hook to fetch all saved receipt templates
 */
export function useReceiptTemplates() {
  return useQuery({
    queryKey: RECEIPT_TEMPLATES_QUERY_KEY,
    queryFn: fetchReceiptTemplates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to fetch the currently active receipt template
 */
export function useActiveReceiptTemplate() {
  return useQuery({
    queryKey: ACTIVE_RECEIPT_TEMPLATE_QUERY_KEY,
    queryFn: fetchActiveReceiptTemplate,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Hook for template mutations (create, update, duplicate, delete, activate)
 */
export function useReceiptTemplateMutations() {
  const queryClient = useQueryClient();

  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: RECEIPT_TEMPLATES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ACTIVE_RECEIPT_TEMPLATE_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateReceiptTemplateInput) => createReceiptTemplate(input),
    onSuccess: invalidateKeys,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReceiptTemplateInput }) =>
      updateReceiptTemplate(id, input),
    onSuccess: invalidateKeys,
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateReceiptTemplate(id),
    onSuccess: invalidateKeys,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReceiptTemplate(id),
    onSuccess: invalidateKeys,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateReceiptTemplate(id),
    onSuccess: invalidateKeys,
  });

  return {
    createMutation,
    updateMutation,
    duplicateMutation,
    deleteMutation,
    activateMutation,
  };
}
