"use client";

import { useSearchStore } from "@/store/useSearchStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import FocusLock from "react-focus-lock";

import { createClient } from "@/utils/supabase/client";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  slug: string;
  image: string;
}

export default function SearchModal() {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const trendingSearches = [
    "Satin Dresses",
    "Co-ord Sets",
    "Vacation Outfits",
    "Party Wear",
    "Sequin Tops"
  ];

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchResults = async () => {
      const supabase = createClient();
      if (query.trim().length === 0) {
        // Fetch suggested (trending) products when empty
        setIsSearching(true);
        const { data } = await supabase
          .from("products")
          .select("id, name, price, slug, product_images(url)")
          .eq("is_featured", true)
          .eq("status", "active")
          .limit(4);
          
        if (data) {
          setResults(data.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            image: p.product_images?.[0]?.url || "/images/placeholder-portrait.jpg"
          })));
        }
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, price, slug, product_images(url)")
        .ilike("name", `%${query}%`)
        .eq("status", "active")
        .limit(6);
        
      if (data) {
        setResults(data.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.product_images?.[0]?.url || "/images/placeholder-portrait.jpg"
        })));
      }
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, isOpen]);

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

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setQuery(""), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-rich-black/95 backdrop-blur-2xl text-white overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Search Products"
        >
          <FocusLock returnFocus>
          <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-24 max-w-6xl">
            {/* Header & Input */}
            <div className="flex items-center gap-4 lg:gap-8 border-b border-white/20 pb-6 mb-16 relative">
              <Search className="w-8 h-8 lg:w-12 lg:h-12 text-white/50 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search for dresses, tops, collections..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-3xl md:text-5xl lg:text-7xl font-serif bg-transparent outline-none placeholder:text-white/20 text-white transition-all focus:ring-0"
                autoFocus
              />
              <button onClick={closeSearch} className="hover:rotate-90 transition-transform p-2 text-white/50 hover:text-white">
                <X className="w-8 h-8 lg:w-12 lg:h-12" />
              </button>
              {/* Glowing bottom border effect */}
              <motion.div 
                className="absolute bottom-0 left-0 h-[2px] bg-white"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.3, duration: 0.8, ease: "circOut" }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
              {/* Left: Trending */}
              <div className="lg:col-span-4 space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-8">
                    {query ? "Try Searching" : "Trending Searches"}
                  </h3>
                  <ul className="space-y-6">
                    {trendingSearches.map((term, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (i * 0.05), duration: 0.5 }}
                      >
                        <button
                          onClick={() => setQuery(term)}
                          className="text-xl lg:text-2xl font-serif text-white/70 hover:text-white transition-colors flex items-center gap-4 group text-left w-full"
                        >
                          {term}
                          <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Right: Products */}
              <div className="lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                      {query ? `Results for "${query}"` : "Suggested For You"}
                    </h3>
                    {query && (
                      <Link
                        href={`/collections/all?search=${encodeURIComponent(query)}`}
                        onClick={closeSearch}
                        className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white flex items-center gap-2 transition-colors"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {isSearching ? (
                    <div className="flex justify-center items-center py-32">
                      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : results.length === 0 ? (
                    <p className="text-white/50 text-lg font-serif italic py-10">No products found for &quot;{query}&quot;.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
                      {results.map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + (i * 0.08), duration: 0.6 }}
                        >
                          <Link href={`/products/${product.slug}`} onClick={closeSearch} className="group cursor-pointer block">
                            <div className="aspect-[3/4] relative bg-white/5 mb-6 overflow-hidden rounded-sm">
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <h4 className="font-serif text-lg text-white/90 mb-2 group-hover:text-white transition-colors">{product.name}</h4>
                            <p className="text-sm tracking-widest text-white/50">₹{product.price.toLocaleString('en-IN')}</p>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
          </FocusLock>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
