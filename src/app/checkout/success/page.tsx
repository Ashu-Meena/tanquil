"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('recentOrderNumber');
    if (savedOrder) {
      setOrderNumber(savedOrder);
      sessionStorage.removeItem('recentOrderNumber'); // Clear it so it only shows once
    }
  }, []);

  return (
    <div className="min-h-[80vh] bg-ivory flex items-center justify-center pt-36 pb-20">
      <div className="container mx-auto px-6 max-w-lg text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-rich-black rounded-full flex items-center justify-center mx-auto mb-8 text-gold"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        
        <h1 className="font-serif text-4xl text-rich-black mb-4">Order Received!</h1>
        {orderNumber && (
          <p className="text-gold font-medium tracking-widest text-sm uppercase mb-4">
            Order #{orderNumber}
          </p>
        )}
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Thank you for your purchase. Your order is currently <strong className="text-rich-black">Pending Verification</strong>. Our team will verify your UPI payment screenshot and transaction ID shortly. You will receive an email confirmation once approved.
        </p>
        
        <div className="bg-white border border-border-light p-6 text-sm mb-10 text-left rounded-sm">
          <p className="font-medium text-rich-black mb-2">What happens next?</p>
          <ul className="text-neutral-500 space-y-2 list-disc pl-4">
            <li>We manually verify the UTR/Transaction ID with our bank.</li>
            <li>Verification usually takes 1-2 hours during business hours.</li>
            <li>Once verified, your order will be processed for shipping.</li>
          </ul>
        </div>
        
        <Link 
          href="/collections/all"
          className="inline-flex items-center justify-center gap-2 bg-rich-black hover:bg-gold text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
