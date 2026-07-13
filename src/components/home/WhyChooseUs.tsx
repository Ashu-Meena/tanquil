"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, ArrowLeftRight, Lock, Sparkles } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary shipping on all orders over ₹10,000 Pan India."
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    description: "Crafted with the finest fabrics and meticulous attention to detail."
  },
  {
    icon: ArrowLeftRight,
    title: "Exchange Available",
    description: "Need a different size? We offer size exchanges within 72 hours of delivery."
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "100% secure checkout via Cashfree and Razorpay with all major cards."
  },
  {
    icon: Sparkles,
    title: "Handcrafted Details",
    description: "Intricate embellishments and couture-inspired finishing."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 md:py-24 bg-rich-black text-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-10 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-2xl md:text-4xl lg:text-5xl text-gold mb-2 md:mb-4"
          >
            The Tranquil Experience
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 uppercase tracking-widest text-sm"
          >
            Why choose our luxury pieces
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-neutral-800 flex items-center justify-center mb-4 md:mb-6 group-hover:border-gold group-hover:text-gold transition-colors duration-300">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-base md:text-xl tracking-wide mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-neutral-500 text-xs md:text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
