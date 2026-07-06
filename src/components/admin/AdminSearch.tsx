"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Package, ShoppingCart, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ type: string, id: string, title: string, subtitle: string }[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setIsOpen(true);
    
    // We will search across products, orders, and customers
    // This is a simplified parallel search
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("id, name, sku").ilike("name", `%${searchTerm}%`).limit(3),
      supabase.from("orders").select("id, customer_name").ilike("id", `%${searchTerm}%`).limit(3),
      // Add customers search if there is a customers table, but for now we rely on orders and products
    ]);

    const combinedResults = [];

    if (productsRes.data) {
      combinedResults.push(...productsRes.data.map(p => ({
        type: 'product',
        id: p.id,
        title: p.name,
        subtitle: p.sku || 'No SKU'
      })));
    }

    if (ordersRes.data) {
      combinedResults.push(...ordersRes.data.map(o => ({
        type: 'order',
        id: o.id,
        title: `Order #${o.id.split('-')[0].toUpperCase()}`,
        subtitle: o.customer_name
      })));
    }

    setResults(combinedResults);
    setLoading(false);
  };

  const navigateToResult = (result: any) => {
    setIsOpen(false);
    setQuery("");
    if (result.type === 'product') {
      router.push(`/admin/products/${result.id}`);
    } else if (result.type === 'order') {
      router.push(`/admin/orders`); // For order, maybe pass a search param or just go to orders page
    }
  };

  return (
    <div className="relative flex items-center w-full md:w-auto ml-2 md:ml-0" ref={ref}>
      <div className="flex items-center bg-[#FAF8F5] px-3 py-1.5 rounded-sm border border-[#EFEFEF] focus-within:border-[#C7A17A] transition-colors relative z-20 w-full">
        <Search className="w-4 h-4 text-[#999999] mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Search..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length > 1) setIsOpen(true); }}
          className="bg-transparent border-none outline-none text-sm w-32 md:w-64 text-[#111111] placeholder:text-[#999999]"
        />
        {loading && <Loader2 className="w-4 h-4 text-[#C7A17A] animate-spin absolute right-3" />}
      </div>

      {isOpen && (query.length > 1) && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#EFEFEF] rounded-sm shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <div className="p-4 text-sm text-[#999999] text-center">No results found</div>
          ) : (
            <ul className="py-2">
              {results.map((res, i) => (
                <li 
                  key={`${res.type}-${res.id}-${i}`}
                  onClick={() => navigateToResult(res)}
                  className="px-4 py-3 hover:bg-[#FAF8F5] cursor-pointer flex items-start gap-3 transition-colors border-b border-[#EFEFEF] last:border-0"
                >
                  <div className="mt-0.5">
                    {res.type === 'product' && <Package className="w-4 h-4 text-[#C7A17A]" />}
                    {res.type === 'order' && <ShoppingCart className="w-4 h-4 text-[#C7A17A]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{res.title}</p>
                    <p className="text-xs text-[#666666]">{res.subtitle}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
