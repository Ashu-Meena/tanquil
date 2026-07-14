"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Filter } from "lucide-react";
import Image from "next/image";
import { toast } from "@/store/useToastStore";
import { deleteProduct } from "@/app/actions/admin";

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(false);
  
  // Bulk Actions State
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(categories(name)), product_images(url), product_variants(stock_quantity, sku, size)")
      .order("created_at", { ascending: false });
    
    if (data) {
      const formattedData = data.map(product => {
        // Map images to the expected format
        const images = product.product_images?.map((img: any) => img.url) || [];
        
        // Sum up total stock from all variants
        const totalStock = product.product_variants?.reduce((sum: number, variant: any) => sum + (variant.stock_quantity || 0), 0) || 0;
        const hasCustomSize = product.product_variants?.some((v: any) => v.size === 'Custom') || false;
        
        let displaySku = product.sku;
        if (!displaySku && product.product_variants && product.product_variants.length > 0) {
          const firstSku = product.product_variants[0].sku;
          if (firstSku) {
            const parts = firstSku.split('-');
            displaySku = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : firstSku;
          }
        }

        const categoryText = product.product_categories?.map((pc: any) => pc.categories?.name).filter(Boolean).join(", ") || "Uncategorized";
        
        return {
          ...product,
          images,
          stock_quantity: totalStock,
          hasCustomSize,
          sku: displaySku,
          categoryText
        };
      });
      setProducts(formattedData);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.categoryText?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const applyBulkAction = async () => {
    if (!bulkStatus || selectedProducts.length === 0) return;
    setUpdating(true);
    
    // Update all selected products
    await Promise.all(selectedProducts.map(id => 
      supabase.from("products").update({ status: bulkStatus }).eq("id", id)
    ));
    
    setProducts(prev => prev.map(p => selectedProducts.includes(p.id) ? { ...p, status: bulkStatus } : p));
    setSelectedProducts([]);
    setBulkStatus("");
    setUpdating(false);
    toast.success("Products updated successfully!");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    // Optimistic UI update
    const previousProducts = [...products];
    setProducts(products.filter(p => p.id !== id));
    
    const result = await deleteProduct(id);
    
    if (!result.success) {
      // Revert if error
      setProducts(previousProducts);
      console.error("Delete product error:", result.error);
      toast.error(`Failed to delete product: ${result.error}`);
    } else {
      toast.success("Product deleted successfully");
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-rich-black mb-1">Products</h1>
          <p className="text-neutral-500 text-sm">Manage your inventory, pricing, and catalog</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-rich-black text-white px-4 py-2.5 text-sm font-medium hover:bg-gold transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-light flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center w-full sm:w-auto bg-ivory px-3 py-2 rounded-sm border border-border-light focus-within:border-gold transition-colors">
            <Search className="w-4 h-4 text-neutral-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-rich-black placeholder:text-neutral-400"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-neutral-500 hover:text-rich-black transition-colors px-3 py-2 border border-border-light rounded-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ivory text-rich-black uppercase tracking-widest text-[11px] border-b border-border-light">
              <tr>
                <th className="px-6 py-4 font-medium w-12">
                  <input 
                    type="checkbox" 
                    checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">SKU</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Category</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Inventory</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No products found. <Link href="/admin/products/new" className="text-gold hover:underline">Create one</Link>.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={`border-b border-border-light hover:bg-ivory transition-colors ${selectedProducts.includes(product.id) ? 'bg-ivory' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-border-light relative rounded-sm overflow-hidden flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-rich-black">{product.name}</p>
                          <p className="text-xs text-neutral-500">₹{product.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 hidden md:table-cell">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 capitalize hidden md:table-cell">
                      {product.categoryText}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {product.stock_quantity > 10 ? (
                        <span className="text-green-600">{product.stock_quantity} in stock</span>
                      ) : product.stock_quantity > 0 ? (
                        <span className="text-yellow-600">Low stock ({product.stock_quantity})</span>
                      ) : product.hasCustomSize ? (
                        <span className="text-[#B38D66] font-medium">On Demand</span>
                      ) : (
                        <span className="text-error">Out of stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.status === 'draft' ? (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-sm text-[11px] font-medium tracking-widest uppercase">Draft</span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-sm text-[11px] font-medium tracking-widest uppercase">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}`} className="p-2 text-neutral-500 hover:text-gold transition-colors rounded-sm hover:bg-ivory">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-neutral-500 hover:text-sale transition-colors rounded-sm hover:bg-error/10"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rich-black text-white px-6 py-4 rounded-sm shadow-xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-medium">
            <span className="text-gold">{selectedProducts.length}</span> products selected
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex items-center gap-3">
            <span className="text-sm">Change status to:</span>
            <select 
              value={bulkStatus} 
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-white/10 border border-white/20 text-sm py-1.5 px-3 rounded-sm focus:outline-none focus:border-gold"
            >
              <option value="" className="text-black">Select Status</option>
              <option value="active" className="text-black">Active</option>
              <option value="draft" className="text-black">Draft</option>
            </select>
            <button 
              onClick={applyBulkAction}
              disabled={!bulkStatus || updating}
              className="bg-gold text-white px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-[#B38D66] transition-colors disabled:opacity-50"
            >
              Apply
            </button>
            <button 
              onClick={() => setSelectedProducts([])}
              className="ml-2 text-white/50 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="text-lg">&times;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
