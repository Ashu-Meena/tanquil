import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';

interface WishlistStore {
  items: string[];
  userId: string | null;
  setUserId: (id: string | null) => void;
  fetchWishlistFromDb: () => Promise<void>;
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
      userId: null,
      
      setUserId: (id) => {
        const state = get();
        if (id === null && state.userId !== null) {
          // Logging out: clear wishlist
          set({ userId: null, items: [] });
        } else if (id !== null && state.userId !== id) {
          // Logging in as a new user
          set({ userId: id });
          get().fetchWishlistFromDb();
        }
      },

      fetchWishlistFromDb: async () => {
        const state = get();
        if (!state.userId) return;
        
        try {
          const { data, error } = await supabase
            .from('wishlist')
            .select('product_id')
            .eq('user_id', state.userId);
            
          if (error) {
            console.error("Error fetching wishlist items:", error);
            return;
          }

          if (data) {
            const mappedItems = data.map(item => item.product_id);
            set({ items: mappedItems });
          }
        } catch (err) {
          console.error("Error fetching wishlist from DB:", err);
        }
      },

      setItems: (items: string[]) => set({ items }),
      
      addItem: async (productId: string) => {
        set((state) => {
          if (!state.items.includes(productId)) {
            return { items: [...state.items, productId] };
          }
          return state;
        });
        
        try {
          const state = get();
          if (state.userId) {
            // Check if already in db
            const { data } = await supabase.from('wishlist').select('id').eq('user_id', state.userId).eq('product_id', productId).maybeSingle();
            if (!data) {
              await supabase.from('wishlist').insert({ user_id: state.userId, product_id: productId });
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
          const state = get();
          if (state.userId) {
            await supabase.from('wishlist').delete().eq('user_id', state.userId).eq('product_id', productId);
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
          const state = get();
          if (state.userId) {
            await supabase.from('wishlist').delete().eq('user_id', state.userId);
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
