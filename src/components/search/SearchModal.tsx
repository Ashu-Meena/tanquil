"use client";

import { useSearchStore } from "@/store/useSearchStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SearchModal() {
  const { isOpen, closeSearch } = useSearchStore();

  const trendingSearches = [
    "Satin Dresses",
    "Co-ord Sets",
    "Vacation Outfits",
    "Party Wear",
    "Sequin Tops"
  ];

  const suggestedProducts = [
    {
      id: 1,
      name: "Draped Halter Gown",
      price: 6999,
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80",
    },
    {
      id: 2,
      name: "Feather Trim Mini Dress",
      price: 5499,
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-white text-[#111111] overflow-y-auto"
        >
          <div className="container mx-auto px-6 lg:px-12 py-8 max-w-5xl">
            {/* Header & Input */}
            <div className="flex items-center gap-4 border-b-2 border-[#111111] pb-4 mb-12">
              <Search className="w-8 h-8 text-[#111111]" />
              <input 
                type="text" 
                placeholder="Search for dresses, tops, collections..." 
                className="flex-1 text-2xl md:text-4xl font-serif bg-transparent outline-none placeholder:text-[#EFEFEF] transition-all"
                autoFocus
              />
              <button onClick={closeSearch} className="hover:rotate-90 transition-transform p-2">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              {/* Left: Trending & Recent */}
              <div className="md:col-span-4 space-y-10">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#666666] mb-6">Trending Searches</h3>
                  <ul className="space-y-4">
                    {trendingSearches.map((term, i) => (
                      <li key={i}>
                        <button className="text-lg hover:text-[#C7A17A] transition-colors flex items-center gap-2 group">
                          {term}
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Suggested Products */}
              <div className="md:col-span-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#666666] mb-6">Suggested For You</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {suggestedProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} onClick={closeSearch} className="group cursor-pointer">
                      <div className="aspect-[3/4] relative bg-[#FAF8F5] mb-4 overflow-hidden">
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <h4 className="font-medium mb-1 group-hover:text-[#C7A17A] transition-colors">{product.name}</h4>
                      <p className="text-[#666666]">₹{product.price.toLocaleString('en-IN')}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
