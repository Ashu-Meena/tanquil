"use client";

import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { X, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "@/store/useToastStore";
import FocusLock from "react-focus-lock";

export default function CartDrawer() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeCart, items: cartItems, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [shippingThreshold, setShippingThreshold] = useState(10000); // Default to 10000

  // Early return logic moved below hooks

  const fetchShippingSettings = async () => {
    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping')
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = data?.value as any;
    if (val && val.free_shipping_threshold) {
      setShippingThreshold(val.free_shipping_threshold);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (isOpen) {
      fetchShippingSettings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close cart on pathname change to prevent scroll lock bugs when navigating away
  useEffect(() => {
    if (isOpen) {
      closeCart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const totalAfterDiscount = subtotal;

  // Free shipping logic
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);
  const remaining = Math.max(0, shippingThreshold - subtotal);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);



  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.info("Please login or register to complete your order.");
      closeCart();
      router.push("/account");
      return;
    }
    
    closeCart();
    router.push("/checkout");
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "circOut" }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[80] shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart"
          >
            <FocusLock returnFocus className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border-light">
              <div className="w-6" /> {/* Spacer for centering */}
              <h2 className="font-serif text-2xl tracking-widest text-rich-black uppercase">Your Cart {mounted && totalItemsCount > 0 ? `(${totalItemsCount})` : ''}</h2>
              <button onClick={closeCart} className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center hover:rotate-90 transition-transform text-rich-black" aria-label="Close cart">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-5 bg-white border-b border-border-light relative overflow-hidden">
              {remaining > 0 ? (
                <p className="text-[10px] text-center mb-4 text-neutral-500 tracking-widest uppercase">
                  You&apos;re <span className="font-medium text-rich-black">₹{remaining.toLocaleString('en-IN')}</span> away from Free Shipping
                </p>
              ) : (
                <p className="text-[10px] text-center mb-4 text-gold tracking-widest uppercase font-semibold">
                  You&apos;ve unlocked Free Shipping!
                </p>
              )}
              <div className="w-full h-1 bg-[#F5F5F5] overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
                  className={`h-full relative overflow-hidden ${progress === 100 ? 'bg-gold' : 'bg-rich-black'}`}
                >
                  {/* Subtle Shimmer Effect */}
                  {progress > 0 && progress < 100 && (
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 skew-x-[-20deg]"
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-ivory">
              {!mounted ? null : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <p className="text-neutral-500 font-serif italic text-lg">Your cart is currently empty.</p>
                  <button onClick={closeCart} className="bg-rich-black text-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-gold transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-5 group items-center">
                    <div className="relative w-24 md:w-28 aspect-[3/4] bg-[#F5F5F5] overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="flex flex-col flex-1 py-1 h-full justify-between">
                      <div>
                        <Link href={`/products/${item.id}`} onClick={closeCart} className="font-serif text-lg hover:text-gold transition-colors line-clamp-2 leading-snug mb-1">
                          {item.name}
                        </Link>
                        <p className="font-medium text-rich-black text-sm mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>₹{item.price.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-4">{item.color} / {item.size}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-border-light bg-white rounded-sm">
                          <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)} className="px-3 py-1 text-neutral-500 hover:text-rich-black transition-colors">-</button>
                          <span className="px-3 py-1 text-xs text-rich-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)} className="px-3 py-1 text-neutral-500 hover:text-rich-black transition-colors">+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.color, item.size)}
                          className="text-neutral-400 hover:text-sale transition-colors text-[10px] uppercase tracking-widest border-b border-transparent hover:border-sale pb-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="font-serif text-2xl tracking-widest uppercase">Total</span>
                <span className="font-medium text-xl" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  ₹{totalAfterDiscount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-6 text-center">
                Shipping calculated at checkout
              </p>
              <button 
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className={`w-full py-5 uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-3 group ${cartItems.length === 0 ? 'bg-[#F5F5F5] text-neutral-400 cursor-not-allowed' : 'bg-rich-black hover:bg-gold text-white shadow-md hover:shadow-lg'}`}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
            </FocusLock>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
