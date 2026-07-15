import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';

interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
  setItems: (items: string[]) => void;
  syncToSupabase: () => Promise<void>;
}

const supabase = createClient();

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items: string[]) => set({ items }),
      addItem: async (productId: string) => {
        set((state) => {
          if (!state.items.includes(productId)) {
            return { items: [...state.items, productId] };
          }
          return state;
        });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Check if already in db
            const { data } = await supabase.from('wishlist').select('id').eq('user_id', session.user.id).eq('product_id', productId).maybeSingle();
            if (!data) {
              await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: productId });
            }
          }
        } catch (e) {
          console.error(e);
        }
      },
      removeItem: async (productId: string) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.from('wishlist').delete().eq('user_id', session.user.id).eq('product_id', productId);
          }
        } catch (e) {
          console.error(e);
        }
      },
      toggleItem: async (productId: string) => {
        const state = get();
        if (state.items.includes(productId)) {
          await get().removeItem(productId);
        } else {
          await get().addItem(productId);
        }
      },
      hasItem: (productId: string) => get().items.includes(productId),
      clearWishlist: async () => {
        set({ items: [] });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.from('wishlist').delete().eq('user_id', session.user.id);
          }
        } catch (e) {
          console.error(e);
        }
      },
      syncToSupabase: async () => {
        // Deprecated: We now sync per action. Kept for interface compatibility.
      },
    }),
    {
      name: 'tranquil-wishlist-storage',
    }
  )
);
