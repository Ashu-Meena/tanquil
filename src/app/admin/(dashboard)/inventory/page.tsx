"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Save, AlertTriangle } from "lucide-react";
import Image from "next/image";

export default function InventoryPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_variants")
      .select(`
        *,
        products (name, images, status)
      `)
      .order("stock_quantity", { ascending: true }); // Lowest stock first
      
    if (data) setVariants(data);
    setLoading(false);
  };

  const updateStock = async (id: string, newStock: number) => {
    setSavingId(id);
    await supabase.from("product_variants").update({ stock_quantity: newStock }).eq("id", id);
    setSavingId(null);
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
          <h1 className="font-serif text-3xl text-[#111111] mb-1">Inventory</h1>
          <p className="text-[#666666] text-sm">Monitor and update product stock levels</p>
        </div>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center">
          <div className="flex items-center w-full sm:w-auto bg-[#FAF8F5] px-3 py-2 rounded-sm border border-[#EFEFEF] focus-within:border-[#C7A17A] transition-colors">
            <Search className="w-4 h-4 text-[#999999] mr-2" />
            <input 
              type="text" 
              placeholder="Search by product or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-[#111111] placeholder:text-[#999999]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF8F5] text-[#111111] uppercase tracking-widest text-[11px] border-b border-[#EFEFEF]">
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
                  <td colSpan={5} className="px-6 py-12 text-center text-[#666666]">Loading inventory...</td>
                </tr>
              ) : filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#666666]">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((variant) => {
                  const isLowStock = variant.stock_quantity < 10;
                  
                  return (
                    <tr key={variant.id} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-[#EFEFEF] relative rounded-sm overflow-hidden flex-shrink-0">
                            {variant.products?.images && variant.products.images[0] ? (
                              <Image src={variant.products.images[0]} alt={variant.products.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#999999] text-[10px]">No Img</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#111111]">{variant.products?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#666666]">{variant.sku || '-'}</td>
                      <td className="px-6 py-4 text-[#666666]">
                        {variant.color_name} {variant.size ? `/ ${variant.size}` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                          variant.products?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {variant.products?.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isLowStock && <AlertTriangle className="w-4 h-4 text-orange-500" title="Low Stock" />}
                          <input 
                            type="number" 
                            value={variant.stock_quantity}
                            onChange={(e) => handleStockChange(variant.id, e.target.value)}
                            onBlur={(e) => updateStock(variant.id, parseInt(e.target.value) || 0)}
                            className={`w-20 border p-2 text-sm text-right focus:outline-none focus:border-[#C7A17A] rounded-sm transition-colors ${
                              isLowStock ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-[#EFEFEF]'
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
