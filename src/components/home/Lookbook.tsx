"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const lookbookItems = [
  { id: 1, type: 'photo', url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600", height: "h-[400px]", product: "Satin Midi" },
  { id: 2, type: 'video', url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600", height: "h-[550px]", product: "Velvet Gown" },
  { id: 3, type: 'photo', url: "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=600", height: "h-[350px]", product: "Silk Co-ord" },
  { id: 4, type: 'photo', url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600", height: "h-[500px]", product: "Lace Top" },
  { id: 5, type: 'photo', url: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600", height: "h-[450px]", product: "Sequin Skirt" },
  { id: 6, type: 'video', url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600", height: "h-[400px]", product: "Party Dress" },
];

export default function Lookbook() {
  return (
    <section className="py-24 bg-[#FAF8F5]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl lg:text-5xl text-[#111111] mb-4 flex justify-center items-center gap-3"
          >
            <InstagramIcon className="w-8 h-8 md:w-10 md:h-10 text-[#C7A17A]" />
            Instagram Gallery
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#666666] uppercase tracking-widest text-sm"
          >
            @tranquil.co.in
          </motion.p>
        </div>

        {/* Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {lookbookItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`relative group overflow-hidden break-inside-avoid ${item.height} w-full cursor-pointer bg-[#EFEFEF]`}
            >
              <Image 
                src={item.url}
                alt={`Lookbook ${item.id}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
                <button className="bg-white text-[#111111] hover:bg-[#C7A17A] hover:text-white rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <ShoppingBag className="w-5 h-5" />
                </button>
                <span className="text-white mt-3 font-medium uppercase tracking-widest text-xs transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                  Shop {item.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
