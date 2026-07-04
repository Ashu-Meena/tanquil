"use client";

import { useSearchStore } from "@/store/useSearchStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

const allProducts = [
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
  },
  {
    id: 3,
    name: "Satin Slip Midi Dress",
    price: 4999,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
  },
  {
    id: 4,
    name: "Embellished Corset Top",
    price: 3499,
    image: "https://images.unsplash.com/photo-1588117260148-b47818741c74?w=400&q=80",
  },
];

export default function SearchModal() {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState("");

  const trendingSearches = [
    "Satin Dresses",
    "Co-ord Sets",
    "Vacation Outfits",
    "Party Wear",
    "Sequin Tops"
  ];

  const filtered = query.trim().length > 0
    ? allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : allProducts.slice(0, 2);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeSearch();
    }
  }, [closeSearch]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/20 z-[95]"
          />

          {/* Modal */}
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
                <Search className="w-8 h-8 text-[#111111] flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search for dresses, tops, collections..." 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 text-2xl md:text-4xl font-serif bg-transparent outline-none placeholder:text-[#EFEFEF] transition-all"
                  autoFocus
                />
                <button onClick={closeSearch} className="hover:rotate-90 transition-transform p-2">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Left: Trending */}
                <div className="md:col-span-4 space-y-10">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#666666] mb-6">
                      {query ? "Try Searching" : "Trending Searches"}
                    </h3>
                    <ul className="space-y-4">
                      {trendingSearches.map((term, i) => (
                        <li key={i}>
                          <button
                            onClick={() => setQuery(term)}
                            className="text-lg hover:text-[#C7A17A] transition-colors flex items-center gap-2 group text-left"
                          >
                            {term}
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Products */}
                <div className="md:col-span-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#666666]">
                      {query ? `Results for "${query}"` : "Suggested For You"}
                    </h3>
                    {query && (
                      <Link
                        href={`/collections/all?search=${encodeURIComponent(query)}`}
                        onClick={closeSearch}
                        className="text-xs uppercase tracking-widest text-[#C7A17A] hover:underline flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {filtered.length === 0 ? (
                    <p className="text-[#666666]">No products found for &quot;{query}&quot;.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {filtered.map((product) => (
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
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
