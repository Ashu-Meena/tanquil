"use client";

import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/store/useToastStore";

export default function CartDrawer() {
  const supabase = createClient();
  const router = useRouter();
  const { isOpen, closeCart, items: cartItems, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [shippingThreshold, setShippingThreshold] = useState(10000); // Default to 10000
  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; is_free_shipping: boolean; discount_value: number; discount_type: 'percentage' | 'fixed' } | null>(null);

  const fetchShippingSettings = async () => {
    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping')
      .single();
    if (data && data.value && data.value.free_shipping_threshold) {
      setShippingThreshold(data.value.free_shipping_threshold);
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

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Calculate discount if applicable
  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * activeCoupon.discount_value) / 100;
    } else {
      discountAmount = activeCoupon.discount_value;
    }
  }
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);

  // Free shipping logic
  const isFreeShippingViaCoupon = activeCoupon?.is_free_shipping || false;
  const progress = isFreeShippingViaCoupon ? 100 : Math.min((subtotal / shippingThreshold) * 100, 100);
  const remaining = isFreeShippingViaCoupon ? 0 : Math.max(0, shippingThreshold - subtotal);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage({ type: "error", text: "Please enter a discount code." });
      setActiveCoupon(null);
      return;
    } 

    const { data, error } = await supabase
      .from('coupons')
      .select('code, is_active, min_order_value, discount_type, discount_value, is_free_shipping')
      .ilike('code', discountCode.trim())
      .single();

    if (error || !data || !data.is_active) {
      setDiscountMessage({ type: "error", text: `"${discountCode.toUpperCase()}" is not a valid code.` });
      setActiveCoupon(null);
    } else if (data.min_order_value > subtotal) {
      setDiscountMessage({ type: "error", text: `Minimum order value for this coupon is ₹${data.min_order_value}.` });
      setActiveCoupon(null);
    } else {
      setDiscountMessage({ type: "success", text: `Discount applied successfully!` });
      setActiveCoupon({
        code: data.code,
        is_free_shipping: data.is_free_shipping,
        discount_value: data.discount_value,
        discount_type: data.discount_type
      });
    }

    setTimeout(() => {
      if (discountMessage?.type === 'error') setDiscountMessage(null);
    }, 3000);
  };

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
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#EFEFEF]">
              <div className="w-6" /> {/* Spacer for centering */}
              <h2 className="font-serif text-2xl tracking-widest text-[#111111] uppercase">Your Cart {mounted && totalItemsCount > 0 ? `(${totalItemsCount})` : ''}</h2>
              <button onClick={closeCart} className="hover:rotate-90 transition-transform text-[#111111]">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-4 bg-white border-b border-[#EFEFEF]">
              {remaining > 0 ? (
                <p className="text-xs text-center mb-3 text-[#666666] tracking-wide uppercase">
                  You're <span className="font-bold text-[#111111]">₹{remaining.toLocaleString('en-IN')}</span> away from Free Shipping
                </p>
              ) : (
                <p className="text-xs text-center mb-3 text-[#C7A17A] tracking-widest uppercase font-medium">
                  You've unlocked Free Shipping
                </p>
              )}
              <div className="w-full h-[2px] bg-[#F5F5F5] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${progress === 100 ? 'bg-[#C7A17A]' : 'bg-[#111111]'}`}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-[#FAF8F5]">
              {!mounted ? null : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <p className="text-[#666666] font-serif italic text-lg">Your cart is currently empty.</p>
                  <button onClick={closeCart} className="bg-[#111111] text-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#C7A17A] transition-colors">
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
                        <Link href={`/products/${item.id}`} onClick={closeCart} className="font-serif text-lg hover:text-[#C7A17A] transition-colors line-clamp-2 leading-snug mb-1">
                          {item.name}
                        </Link>
                        <p className="font-medium text-[#111111] text-sm mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>₹{item.price.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-[#666666] tracking-widest uppercase mb-4">{item.color} / {item.size}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-[#EFEFEF] bg-white rounded-sm">
                          <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)} className="px-3 py-1 text-[#666666] hover:text-[#111111] transition-colors">-</button>
                          <span className="px-3 py-1 text-xs text-[#111111]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)} className="px-3 py-1 text-[#666666] hover:text-[#111111] transition-colors">+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.color, item.size)}
                          className="text-[#999999] hover:text-[#E63946] transition-colors text-[10px] uppercase tracking-widest border-b border-transparent hover:border-[#E63946] pb-0.5"
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
              {/* Discount Code */}
              <div className="mb-6 pb-6">
                <div className="flex items-end gap-4 border-b border-[#EFEFEF] focus-within:border-[#111111] transition-colors pb-1 group">
                  <input 
                    type="text" 
                    placeholder="Enter Discount Code"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleApplyDiscount()}
                    className="flex-1 bg-transparent px-0 py-1 text-xs uppercase tracking-widest focus:outline-none text-[#111111] placeholder:text-[#999999]"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="text-[#111111] text-[10px] uppercase tracking-[0.2em] font-medium hover:text-[#C7A17A] transition-colors pb-1"
                  >
                    Apply
                  </button>
                </div>
                {discountMessage && (
                  <p className={`text-[10px] uppercase tracking-widest mt-2 ${discountMessage.type === "error" ? "text-[#E63946]" : "text-[#C7A17A]"}`}>
                    {discountMessage.text}
                  </p>
                )}
              </div>

              {activeCoupon && discountAmount > 0 && (
                <div className="flex justify-between items-center mb-3 text-[#C7A17A]">
                  <span className="text-xs uppercase tracking-widest">Discount</span>
                  <span className="font-medium text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    -₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <span className="font-serif text-2xl tracking-widest uppercase">Total</span>
                <span className="font-medium text-xl" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  ₹{totalAfterDiscount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-6 text-center">
                Shipping calculated at checkout
              </p>
              <button 
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className={`w-full py-5 uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-3 group ${cartItems.length === 0 ? 'bg-[#F5F5F5] text-[#999999] cursor-not-allowed' : 'bg-[#111111] hover:bg-[#C7A17A] text-white shadow-md hover:shadow-lg'}`}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
