import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color: string, size: string) => void;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      isOpen: false,
      items: [],
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(
          item => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
        );
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item === existingItem ? { ...item, quantity: item.quantity + newItem.quantity } : item
            )
          };
        }
        return { items: [...state.items, newItem] };
      }),
      removeItem: (id, color, size) => set((state) => ({
        items: state.items.filter(item => !(item.id === id && item.color === color && item.size === size))
      })),
      updateQuantity: (id, color, size, quantity) => set((state) => ({
        items: state.items.map(item =>
          (item.id === id && item.color === color && item.size === size) ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'tranquil-cart',
    }
  )
);
