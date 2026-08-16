import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSavedPrinters,
  fetchPreferredPrinter,
  saveVerifiedPrinter,
  updateSavedPrinter,
  setPreferredPrinter,
  removeSavedPrinter,
} from '../lib/supabase/queries/printer';
import type { SavedPrinterInsert, SavedPrinterUpdate } from '../types/printer.types';

export const PRINTER_QUERY_KEYS = {
  savedPrinters: ['saved-printers'] as const,
  preferred: ['saved-printers', 'preferred'] as const,
  settings: ['printerSettings'] as const,
};

/**
 * Hook to retrieve all saved Bluetooth thermal printers for RadhaCafe
 */
export function useSavedPrinters() {
  return useQuery({
    queryKey: PRINTER_QUERY_KEYS.savedPrinters,
    queryFn: fetchSavedPrinters,
    staleTime: 30000,
  });
}

/**
 * Hook to retrieve the preferred saved Bluetooth printer
 */
export function usePreferredPrinter() {
  return useQuery({
    queryKey: PRINTER_QUERY_KEYS.preferred,
    queryFn: fetchPreferredPrinter,
    staleTime: 30000,
  });
}

/**
 * Mutation to save or update a verified printer
 */
export function useSaveVerifiedPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (printerData: SavedPrinterInsert) => saveVerifiedPrinter(printerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.settings });
    },
  });
}

/**
 * Mutation to update saved printer details (friendly name, paper width, etc.)
 */
export function useUpdateSavedPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SavedPrinterUpdate }) =>
      updateSavedPrinter(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
    },
  });
}

/**
 * Mutation to set a printer as preferred
 */
export function useSetPreferredPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (printerId: string) => setPreferredPrinter(printerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.settings });
    },
  });
}

/**
 * Mutation to remove a saved printer from RadhaCafe
 */
export function useRemoveSavedPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (printerId: string) => removeSavedPrinter(printerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.settings });
    },
  });
}
