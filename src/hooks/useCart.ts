import { useCartStore } from '../store/cartStore';

export function useCart() {
  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const notes = useCartStore((state) => state.notes);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const setDiscount = useCartStore((state) => state.setDiscount);
  const setNotes = useCartStore((state) => state.setNotes);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTax = useCartStore((state) => state.getTax);
  const getTotal = useCartStore((state) => state.getTotal);

  return {
    items,
    discount,
    notes,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    setNotes,
    clearCart,
    subtotal: getSubtotal(),
    tax: getTax(),
    total: getTotal(),
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
  };
}
