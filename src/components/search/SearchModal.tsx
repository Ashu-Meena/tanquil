"use client";

import { useSearchStore } from "@/store/useSearchStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import FocusLock from "react-focus-lock";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const trendingSearches = [
    "Dress",
    "Set",
    "Top",
    "Bloom",
    "Boho"
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/20 z-[95]"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-white text-rich-black overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Search Products"
          >
            <FocusLock returnFocus>
            <div className="container mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-12 max-w-5xl h-full flex flex-col">
              {/* Header & Input */}
              <div className="flex items-center gap-3 md:gap-4 border-b-2 border-rich-black pb-3 md:pb-6 mb-8 md:mb-12">
                <Search className="w-5 h-5 md:w-8 md:h-8 text-rich-black flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && query.trim().length > 0) {
                      closeSearch();
                      router.push(`/collections/all?search=${encodeURIComponent(query)}`);
                    }
                  }}
                  className="flex-1 min-w-0 text-lg md:text-5xl font-serif bg-transparent outline-none placeholder:text-border-light placeholder:font-serif transition-all"
                  autoFocus
                />
                {query && (
                  <button onClick={() => setQuery("")} className="p-1 md:p-2 flex-shrink-0 text-neutral-400 hover:text-rich-black transition-colors" aria-label="Clear search">
                    <X className="w-4 h-4 md:w-6 md:h-6" />
                  </button>
                )}
                <div className="w-[1px] h-6 md:h-10 bg-border-light mx-2 md:mx-4 flex-shrink-0"></div>
                <button onClick={closeSearch} className="text-[10px] md:text-xs uppercase tracking-widest font-medium text-neutral-500 hover:text-rich-black transition-colors flex-shrink-0">
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 flex-1 overflow-y-auto no-scrollbar pb-10">
                {/* Left: Trending */}
                <div className="md:col-span-4 space-y-8 md:space-y-10">
                  <div>
                    <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4 md:mb-6">
                      {query ? "Try Searching" : "Trending Searches"}
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {trendingSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(term)}
                          className="px-4 py-2 border border-border-light rounded-full text-xs md:text-sm font-medium text-rich-black hover:border-rich-black hover:bg-rich-black hover:text-white transition-all whitespace-nowrap"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Products */}
                <div className="md:col-span-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-neutral-500">
                      {query ? `Results for "${query}"` : "Suggested For You"}
                    </h3>
                    {query && (
                      <Link
                        href={`/collections/all?search=${encodeURIComponent(query)}`}
                        onClick={closeSearch}
                        className="text-[10px] md:text-xs uppercase tracking-widest text-gold hover:underline flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </Link>
                    )}
                  </div>

                  {isSearching ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="w-8 h-8 border-2 border-rich-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : results.length === 0 ? (
                    <p className="text-neutral-500 text-sm md:text-base font-serif italic">No products found for &quot;{query}&quot;.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8 md:gap-6">
                      {results.map((product) => (
                        <Link key={product.id} href={`/products/${product.slug}`} onClick={closeSearch} className="group cursor-pointer">
                          <div className="aspect-[3/4] relative bg-ivory mb-3 md:mb-4 overflow-hidden">
                            <Image 
                              src={product.image} 
                              alt={product.name} 
                              fill 
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <h4 className="font-serif text-sm md:text-base mb-1 group-hover:text-gold transition-colors truncate pr-2">{product.name}</h4>
                          <p className="text-xs md:text-sm text-neutral-500 font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </FocusLock>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
