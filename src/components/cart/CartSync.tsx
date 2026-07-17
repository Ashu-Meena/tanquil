'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { createClient } from '@/utils/supabase/client';

export default function CartSync() {
  const setCartUserId = useCartStore((state) => state.setUserId);
  const setWishlistUserId = useWishlistStore((state) => state.setUserId);

  useEffect(() => {
    const supabase = createClient();

    // Check initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCartUserId(user.id);
        setWishlistUserId(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCartUserId(session.user.id);
        setWishlistUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCartUserId(null);
        setWishlistUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCartUserId, setWishlistUserId]);

  return null;
}
