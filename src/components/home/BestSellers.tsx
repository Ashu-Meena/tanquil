"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "../product/ProductCard";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string | number;
  name: string;
  price: number;
  images: string[];
  isNew?: boolean;
  isSale?: boolean;
}

export default function BestSellers({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end text-left mb-16 gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#111111] mb-4"
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
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1, margin: "100px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="w-[65vw] sm:w-[40vw] md:w-[260px] lg:w-[280px] snap-center flex-shrink-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
