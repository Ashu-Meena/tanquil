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
      addItem: (productId: string) => {
        set((state) => {
          if (!state.items.includes(productId)) {
            return { items: [...state.items, productId] };
          }
          return state;
        });
        get().syncToSupabase();
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
        get().syncToSupabase();
      },
      toggleItem: (productId: string) => {
        set((state) => {
          if (state.items.includes(productId)) {
            return { items: state.items.filter((id) => id !== productId) };
          }
          return { items: [...state.items, productId] };
        });
        get().syncToSupabase();
      },
      hasItem: (productId: string) => get().items.includes(productId),
      clearWishlist: () => {
        set({ items: [] });
        get().syncToSupabase();
      },
      syncToSupabase: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return; // Only sync if logged in

          const state = get();
          
          // Current DB wishlist
          const { data: dbWishlist } = await supabase
            .from('wishlist')
            .select('product_id')
            .eq('user_id', session.user.id);
            
          const dbItemIds = dbWishlist?.map(w => w.product_id) || [];
          
          // Items to add to DB (in local state but not in DB)
          const itemsToAdd = state.items.filter(id => !dbItemIds.includes(id));
          
          // Items to remove from DB (in DB but not in local state)
          const itemsToRemove = dbItemIds.filter(id => !state.items.includes(id));
          
          if (itemsToAdd.length > 0) {
            await supabase.from('wishlist').insert(
              itemsToAdd.map(productId => ({ user_id: session.user.id, product_id: productId }))
            );
          }
          
          if (itemsToRemove.length > 0) {
            await supabase.from('wishlist')
              .delete()
              .eq('user_id', session.user.id)
              .in('product_id', itemsToRemove);
          }
        } catch (err) {
          console.error("Wishlist sync failed:", err);
        }
      },
    }),
    {
      name: 'tranquil-wishlist-storage',
    }
  )
);
