"use client";

import { useState } from "react";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import { SlidersHorizontal, ChevronDown, LayoutGrid, List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string | number;
  name: string;
  price: number;
  images: string[];
  isNew?: boolean;
  isSale?: boolean;
  category: string;
  size?: string; // Simplification for now
}

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
];

const PAGE_SIZE = 12;

export default function CollectionClient({ slug, initialProducts }: { slug: string, initialProducts: Product[] }) {
  const collectionName = slug === 'all' ? 'All Edits' : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setVisibleCount(PAGE_SIZE);
  };

  const toggleSize = (size: string) => {
    setActiveSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
    setVisibleCount(PAGE_SIZE);
  };

  const clearFilters = () => {
    setActiveCategories([]);
    setActiveSizes([]);
    setVisibleCount(PAGE_SIZE);
  };

  // Apply filters
  let filtered = initialProducts;
  if (activeCategories.length > 0) {
    filtered = filtered.filter(p => activeCategories.includes(p.category));
  }
  if (activeSizes.length > 0) {
    // In a real app with proper variants table, filter by joined sizes. Here we skip size filtering if not provided.
    filtered = filtered.filter(p => activeSizes.includes(p.size || ""));
  }

  // Apply sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "newest") return String(b.id).localeCompare(String(a.id));
    return 0; // featured — original order
  });

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;
  const hasActiveFilters = activeCategories.length > 0 || activeSizes.length > 0;

  // Extract unique categories from products
  const availableCategories = Array.from(new Set(initialProducts.map(p => p.category)));

  const FilterSidebar = () => (
    <div className="space-y-10">
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs uppercase tracking-widest text-[#E63946] hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Clear All Filters
        </button>
      )}

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <div>
          <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Category</h3>
          <ul className="space-y-3 text-[#666666]">
            {availableCategories.map(cat => (
              <li key={cat}>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]">
                  <input
                    type="checkbox"
                    checked={activeCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="accent-[#C7A17A]"
                  />
                  {cat}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Filter */}
      <div>
        <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Price</h3>
        <ul className="space-y-3 text-[#666666]">
          <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> Under ₹5,000</label></li>
          <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> ₹5,000 – ₹10,000</label></li>
          <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> Over ₹10,000</label></li>
        </ul>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {['XS', 'S', 'M', 'L', 'XL'].map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`border py-2 text-xs uppercase tracking-widest transition-colors ${activeSizes.includes(size) ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#EFEFEF] hover:border-[#111111] text-[#111111]'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Color</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { color: "bg-black", label: "Black" },
            { color: "bg-white border border-[#EFEFEF]", label: "White" },
            { color: "bg-[#C7A17A]", label: "Champagne" },
            { color: "bg-red-800", label: "Burgundy" },
            { color: "bg-blue-900", label: "Navy" },
          ].map(({ color, label }) => (
            <button
              key={label}
              title={label}
              className={`w-8 h-8 rounded-full ${color} ring-1 ring-offset-2 ring-transparent hover:ring-[#111111] transition-all`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Banner */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-[#FAF8F5]">
        <Image 
          src="https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2000" 
          alt="Collection Banner"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center px-6">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-4 tracking-wide">
              {collectionName}
            </h1>
            <p className="text-white/90 text-sm md:text-base font-light tracking-widest uppercase">
              Discover our latest curation of statement pieces designed for elegance.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#EFEFEF] pb-6 mb-8 gap-4 text-sm uppercase tracking-widest font-medium text-[#111111]">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 hover:text-[#C7A17A] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter By
            {hasActiveFilters && (
              <span className="bg-[#C7A17A] text-white text-[10px] px-1.5 py-0.5 rounded-full normal-case font-bold">
                {activeCategories.length + activeSizes.length}
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[#666666]">
              <span>{sorted.length} Products</span>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 cursor-pointer hover:text-[#C7A17A] transition-colors"
              >
                Sort By: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full right-0 mt-2 bg-white border border-[#EFEFEF] shadow-lg z-30 min-w-[200px]"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-[#FAF8F5] transition-colors normal-case tracking-normal ${sortBy === opt.value ? 'text-[#C7A17A] font-medium' : 'text-[#111111]'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-2 border-l border-[#EFEFEF] pl-6 text-[#666666]">
              <button
                onClick={() => setViewMode("grid")}
                className={`hover:text-[#111111] transition-colors ${viewMode === 'grid' ? 'text-[#111111]' : ''}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`hover:text-[#111111] transition-colors ${viewMode === 'list' ? 'text-[#111111]' : ''}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {sorted.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#666666] mb-4">No products match your filters.</p>
                <button onClick={clearFilters} className="text-[#C7A17A] underline underline-offset-4 text-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12"
                : "flex flex-col gap-6"
              }>
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            {/* Load More */}
            {hasMore && (
              <div className="mt-16 border-t border-[#EFEFEF] pt-10 flex justify-center">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="border border-[#111111] px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-[#111111] hover:text-white transition-colors duration-300"
                >
                  Load More ({sorted.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[70]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "circOut" }}
              className="fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-white z-[80] flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-[#EFEFEF] sticky top-0 bg-white">
                <h2 className="font-serif text-xl">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <FilterSidebar />
              </div>
              <div className="p-6 border-t border-[#EFEFEF] mt-auto sticky bottom-0 bg-white">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-[#111111] text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-[#C7A17A] transition-colors"
                >
                  View {sorted.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sort dropdown backdrop */}
      {isSortOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
      )}
    </div>
  );
}
