import { create } from 'zustand';
import type { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  discount: number;
  taxRate: number;
  notes: string;
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  taxRate: 0,
  notes: '',

  addItem: (menuItem, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.menuItem.id === menuItem.id
      );
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        return { items: updated };
      }
      return { items: [...state.items, { menuItem, quantity }] };
    });
  },

  removeItem: (menuItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.menuItem.id !== menuItemId),
    }));
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i
      ),
    }));
  },

  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
  setNotes: (notes) => set({ notes }),
  clearCart: () => set({ items: [], discount: 0, notes: '' }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    const taxableAmount = Math.max(0, subtotal - discount);
    return taxableAmount * get().taxRate;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    const tax = get().getTax();
    return Math.max(0, subtotal - discount + tax);
  },
}));
