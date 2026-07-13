"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Save, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { toast } from "@/store/useToastStore";

export default function InventoryPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_variants")
      .select(`
        *,
        products (name, status, product_images(url, color_name))
      `)
      .order("stock_quantity", { ascending: true }); // Lowest stock first
      
    if (data) setVariants(data);
    setLoading(false);
  };

  const updateStock = async (id: string, newStock: number) => {
    setSavingId(id);
    const { error } = await supabase.from("product_variants").update({ stock_quantity: newStock }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Failed to update stock. Please try again.");
    } else {
      toast.success("Stock updated successfully!");
    }
  };

  const handleStockChange = (id: string, value: string) => {
    const num = parseInt(value) || 0;
    setVariants(variants.map(v => v.id === id ? { ...v, stock_quantity: num } : v));
  };

  const filteredVariants = variants.filter(v => 
    v.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-rich-black mb-1">Inventory</h1>
          <p className="text-neutral-500 text-sm">Monitor and update product stock levels</p>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-light flex justify-between items-center">
          <div className="flex items-center w-full sm:w-auto bg-ivory px-3 py-2 rounded-sm border border-border-light focus-within:border-gold transition-colors">
            <Search className="w-4 h-4 text-neutral-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by product or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-rich-black placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ivory text-rich-black uppercase tracking-widest text-[11px] border-b border-border-light">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Variant</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right w-48">Stock Quantity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Loading inventory...</td>
                </tr>
              ) : filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((variant) => {
                  const isLowStock = variant.stock_quantity < 10;
                  
                  return (
                    <tr key={variant.id} className="border-b border-border-light hover:bg-ivory transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-border-light relative rounded-sm overflow-hidden flex-shrink-0">
                            {(() => {
                              const img = variant.products?.product_images?.find((i: any) => i.color_name === variant.color_name) 
                                || variant.products?.product_images?.[0];
                              return img ? (
                                <Image src={img.url} alt={variant.products?.name || 'Product'} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">No Img</div>
                              );
                            })()}
                          </div>
                          <div>
                            <p className="font-medium text-rich-black">{variant.products?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{variant.sku || '-'}</td>
                      <td className="px-6 py-4 text-neutral-500">
                        {variant.color_name} {variant.size ? `/ ${variant.size}` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                          variant.products?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {variant.products?.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isLowStock && (
                            <span title="Low Stock">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            </span>
                          )}
                          <input 
                            type="number" 
                            value={variant.stock_quantity}
                            onChange={(e) => handleStockChange(variant.id, e.target.value)}
                            onBlur={(e) => updateStock(variant.id, parseInt(e.target.value) || 0)}
                            className={`w-20 border p-2 text-sm text-right focus:outline-none focus:border-gold rounded-sm transition-colors ${
                              isLowStock ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-border-light'
                            }`}
                          />
                          <div className="w-5 flex items-center justify-center">
                            {savingId === variant.id && <Save className="w-4 h-4 text-green-500 animate-pulse" />}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
