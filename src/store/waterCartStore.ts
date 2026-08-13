import { create } from 'zustand';
import type { WaterCartItem, WaterProduct } from '../types';

interface WaterCartState {
  items: WaterCartItem[];
  discount: number;
  notes: string;
  addItem: (product: WaterProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useWaterCartStore = create<WaterCartState>((set, get) => ({
  items: [],
  discount: 0,
  notes: '',

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.product.id === product.id
      );
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        return { items: updated };
      }
      return { items: [...state.items, { product, quantity }] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }));
  },

  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
  setNotes: (notes) => set({ notes }),
  clearCart: () => set({ items: [], discount: 0, notes: '' }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
      0
    );
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    return Math.max(0, subtotal - discount);
  },
}));

export function useWaterCart() {
  const store = useWaterCartStore();
  return {
    items: store.items,
    discount: store.discount,
    notes: store.notes,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    setDiscount: store.setDiscount,
    setNotes: store.setNotes,
    clearCart: store.clearCart,
    subtotal: store.getSubtotal(),
    total: store.getTotal(),
  };
}
