"use client";

import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CartDrawer() {
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
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#EFEFEF]">
              <h2 className="font-serif text-xl sm:text-2xl tracking-wide">Your Cart {mounted ? `(${totalItemsCount})` : ''}</h2>
              <button onClick={closeCart} className="hover:rotate-90 transition-transform p-2 -mr-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="p-4 sm:p-6 bg-[#FAF8F5] border-b border-[#EFEFEF]">
              {remaining > 0 ? (
                <p className="text-sm text-center mb-3 text-[#111111]">
                  You&apos;re <span className="font-bold text-[#C7A17A]">₹{remaining.toLocaleString('en-IN')}</span> away from Free Shipping
                </p>
              ) : (
                <p className="text-sm text-center mb-3 text-[#2F855A] font-medium">
                  You&apos;ve unlocked Free Shipping! 🎉
                </p>
              )}
              <div className="w-full h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${progress === 100 ? 'bg-[#2F855A]' : 'bg-[#C7A17A]'}`}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {!mounted ? null : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <p className="text-[#666666]">Your cart is currently empty.</p>
                  <button onClick={closeCart} className="bg-[#111111] text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-[#C7A17A] transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 group">
                    <div className="relative w-24 h-32 bg-[#FAF8F5] overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col flex-1 py-1 justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <Link href={`/products/${item.id}`} onClick={closeCart} className="font-medium hover:text-[#C7A17A] transition-colors line-clamp-2">
                            {item.name}
                          </Link>
                          <p className="font-medium whitespace-nowrap">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-sm text-[#666666] mb-2">{item.color} / {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#EFEFEF]">
                          <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)} className="px-3 py-1 hover:bg-[#FAF8F5] transition-colors">-</button>
                          <span className="px-3 py-1 text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)} className="px-3 py-1 hover:bg-[#FAF8F5] transition-colors">+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.color, item.size)}
                          className="text-[#999999] hover:text-[#E63946] transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#EFEFEF] p-4 sm:p-6 bg-white">
              {/* Discount Code */}
              <div className="mb-6 border-b border-[#EFEFEF] pb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleApplyDiscount()}
                    className="flex-1 border border-[#EFEFEF] px-4 py-2 text-sm focus:outline-none focus:border-[#C7A17A] uppercase"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="bg-[#111111] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#C7A17A] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {discountMessage && (
                  <p className={`text-xs mt-2 ${discountMessage.type === "error" ? "text-[#E63946]" : "text-[#2F855A]"}`}>
                    {discountMessage.text}
                  </p>
                )}
              </div>

              {activeCoupon && discountAmount > 0 && (
                <div className="flex justify-between items-center mb-2 text-[#2F855A]">
                  <span className="font-serif text-lg tracking-wide">Discount</span>
                  <span className="font-serif text-lg tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    -₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <span className="font-serif text-xl tracking-wide">Total</span>
                <span className="font-serif text-xl tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  ₹{totalAfterDiscount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-[#666666] mb-6 text-center">
                Taxes and shipping calculated at checkout
              </p>
              <Link 
                href="/checkout" 
                onClick={(e) => {
                  if (cartItems.length === 0) {
                    e.preventDefault();
                    return;
                  }
                  closeCart();
                }}
                className={`w-full py-4 uppercase tracking-widest text-sm font-medium transition-colors flex items-center justify-center gap-2 group ${cartItems.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#111111] hover:bg-[#C7A17A] text-white'}`}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
