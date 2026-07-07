import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId: string) => 
        set((state) => {
          if (!state.items.includes(productId)) {
            return { items: [...state.items, productId] };
          }
          return state;
        }),
      removeItem: (productId: string) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),
      toggleItem: (productId: string) =>
        set((state) => {
          if (state.items.includes(productId)) {
            return { items: state.items.filter((id) => id !== productId) };
          }
          return { items: [...state.items, productId] };
        }),
      hasItem: (productId: string) => get().items.includes(productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'tranquil-wishlist-storage',
    }
  )
);
