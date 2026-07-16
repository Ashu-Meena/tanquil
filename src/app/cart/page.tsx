"use client";

import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items: cartItems, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white pt-24 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-3xl md:text-4xl text-rich-black mb-8">Your Cart ({totalItems})</h1>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-ivory border border-border-light">
            <p className="text-neutral-500 mb-6">Your cart is currently empty.</p>
            <Link 
              href="/collections/all" 
              className="bg-rich-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-gold transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 p-4 border border-border-light">
                  <div className="w-24 h-32 relative bg-ivory flex-shrink-0">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-rich-black">
                          {item.name}
                        </span>
                        <button 
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="text-neutral-400 hover:text-error transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{item.color} / {item.size}</p>
                      <p className="text-sm font-medium text-rich-black mt-2">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border-light">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.color, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-ivory transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-rich-black">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-ivory transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-ivory p-6 border border-border-light sticky top-28">
                <h2 className="font-serif text-xl text-rich-black mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border-light mb-8">
                  <div className="flex justify-between font-medium text-rich-black">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-rich-black text-white py-4 text-xs uppercase tracking-widest font-medium hover:bg-gold transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
