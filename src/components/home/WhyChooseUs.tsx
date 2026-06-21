"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw, Lock, Sparkles } from "lucide-react";

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
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Hassle-free 7-day return and exchange policy for your peace of mind."
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
    <section className="py-24 bg-[#111111] text-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl lg:text-5xl text-[#C7A17A] mb-4"
          >
            The Tanquil Experience
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#666666] uppercase tracking-widest text-sm"
          >
            Why choose our luxury pieces
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
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
                <div className="w-16 h-16 rounded-full border border-[#333333] flex items-center justify-center mb-6 group-hover:border-[#C7A17A] group-hover:text-[#C7A17A] transition-colors duration-300">
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl tracking-wide mb-3">{feature.title}</h3>
                <p className="text-[#666666] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
