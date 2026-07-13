import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
  syncToSupabase: () => Promise<void>;
  sessionId: string;
}

const supabase = createClient();

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      sessionId: uuidv4(),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (newItem) => {
        set((state) => {
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
        });
        get().syncToSupabase();
      },
      removeItem: (id, color, size) => {
        set((state) => ({
          items: state.items.filter(item => !(item.id === id && item.color === color && item.size === size))
        }));
        get().syncToSupabase();
      },
      updateQuantity: (id, color, size, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            (item.id === id && item.color === color && item.size === size) ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        }));
        get().syncToSupabase();
      },
      clearCart: () => {
        set({ items: [] });
        get().syncToSupabase();
      },
      syncToSupabase: async () => {
        const state = get();
        if (!state.sessionId) return;
        
        try {
          // 1. Ensure cart exists
          const { error: cartError } = await supabase
            .from('carts')
            .upsert({ session_id: state.sessionId }, { onConflict: 'session_id' });
            
          if (cartError) {
            console.error('Error upserting cart:', cartError);
            return;
          }

          // Fetch the actual cart ID
          const { data: cartData } = await supabase
            .from('carts')
            .select('id')
            .eq('session_id', state.sessionId)
            .single();

          if (!cartData) return;

          // 2. Sync items
          // Easiest approach: clear existing items and insert new ones
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cartData.id);

          if (state.items.length === 0) return;

          // Resolve variant IDs
          const cartItemsToInsert = await Promise.all(state.items.map(async (item) => {
            const { data: variant } = await supabase
              .from('product_variants')
              .select('id')
              .eq('product_id', item.id)
              .eq('color_name', item.color)
              .eq('size', item.size)
              .single();

            return {
              cart_id: cartData.id,
              product_id: item.id,
              variant_id: variant?.id || null,
              quantity: item.quantity
            };
          }));

          await supabase
            .from('cart_items')
            .insert(cartItemsToInsert);

        } catch (err) {
          console.error("Cart sync failed:", err);
        }
      },
    }),
    {
      name: 'tranquil-cart',
    }
  )
);
