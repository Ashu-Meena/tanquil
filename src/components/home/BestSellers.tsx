"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "../product/ProductCard";
import { ArrowRight } from "lucide-react";

const bestSellers = [
  {
    id: 1,
    name: "Embellished Corset Top",
    price: 3499,
    images: [
      "https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=600",
      "https://images.unsplash.com/photo-1588117305388-c2631a279f82?q=80&w=600"
    ],
    isNew: true
  },
  {
    id: 2,
    name: "Satin Slip Midi Dress",
    price: 4999,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600"
    ]
  },
  {
    id: 3,
    name: "Draped Halter Gown",
    price: 6999,
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600"
    ]
  },
  {
    id: 4,
    name: "Sequin Mini Skirt",
    price: 2999,
    images: [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600"
    ],
    isSale: true
  },
  {
    id: 5,
    name: "Velvet Wrap Dress",
    price: 5499,
    images: [
      "https://images.unsplash.com/photo-1515347619362-e610058bdaee?q=80&w=600",
      "https://images.unsplash.com/photo-1515347619362-e610058bdaee?q=80&w=600"
    ]
  }
];

export default function BestSellers() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end text-left mb-16 gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-4xl lg:text-5xl text-[#111111] mb-4"
            >
              Best Sellers
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#666666] font-serif italic text-xl"
            >
              Our most loved pieces
            </motion.p>
          </div>
          <Link 
            href="/collections/bestsellers" 
            className="uppercase tracking-widest text-xs font-medium text-[#111111] hover:text-[#C7A17A] flex items-center gap-2 transition-colors border-b border-[#111111] hover:border-[#C7A17A] pb-1"
          >
            Shop All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-10 no-scrollbar snap-x">
          {bestSellers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="min-w-[280px] md:min-w-[320px] lg:min-w-[360px] snap-center flex-shrink-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
