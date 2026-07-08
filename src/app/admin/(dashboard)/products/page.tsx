"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Filter } from "lucide-react";
import Image from "next/image";
import { toast } from "@/store/useToastStore";

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
      .select("*, categories(name), product_images(url), product_variants(stock_quantity)")
      .order("created_at", { ascending: false });
    
    if (data) {
      const formattedData = data.map(product => {
        // Map images to the expected format
        const images = product.product_images?.map((img: any) => img.url) || [];
        
        // Sum up total stock from all variants
        const totalStock = product.product_variants?.reduce((sum: number, variant: any) => sum + (variant.stock_quantity || 0), 0) || 0;
        
        return {
          ...product,
          images,
          stock_quantity: totalStock
        };
      });
      setProducts(formattedData);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.categories?.name?.toLowerCase().includes(search.toLowerCase())
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
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    
    if (error) {
      // Revert if error
      setProducts(previousProducts);
      toast.error(`Failed to delete product: ${error.message}`);
    } else {
      toast.success("Product deleted successfully");
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#111111] mb-1">Products</h1>
          <p className="text-[#666666] text-sm">Manage your inventory, pricing, and catalog</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#EFEFEF] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center w-full sm:w-auto bg-[#FAF8F5] px-3 py-2 rounded-sm border border-[#EFEFEF] focus-within:border-[#C7A17A] transition-colors">
            <Search className="w-4 h-4 text-[#999999] mr-2" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-[#111111] placeholder:text-[#999999]"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-[#666666] hover:text-[#111111] transition-colors px-3 py-2 border border-[#EFEFEF] rounded-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF8F5] text-[#111111] uppercase tracking-widest text-[11px] border-b border-[#EFEFEF]">
              <tr>
                <th className="px-6 py-4 font-medium w-12">
                  <input 
                    type="checkbox" 
                    checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#C7A17A] focus:ring-[#C7A17A]"
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
                  <td colSpan={6} className="px-6 py-12 text-center text-[#666666]">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#666666]">
                    No products found. <Link href="/admin/products/new" className="text-[#C7A17A] hover:underline">Create one</Link>.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={`border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors ${selectedProducts.includes(product.id) ? 'bg-[#FAF8F5]' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#C7A17A] focus:ring-[#C7A17A]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-[#EFEFEF] relative rounded-sm overflow-hidden flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#999999] text-[10px]">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#111111]">{product.name}</p>
                          <p className="text-xs text-[#666666]">₹{product.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#666666] hidden md:table-cell">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-[#666666] capitalize hidden md:table-cell">
                      {product.categories?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {product.stock_quantity > 10 ? (
                        <span className="text-green-600">{product.stock_quantity} in stock</span>
                      ) : product.stock_quantity > 0 ? (
                        <span className="text-yellow-600">Low stock ({product.stock_quantity})</span>
                      ) : (
                        <span className="text-red-600">Out of stock</span>
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
                        <Link href={`/admin/products/${product.id}`} className="p-2 text-[#666666] hover:text-[#C7A17A] transition-colors rounded-sm hover:bg-[#FAF8F5]">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-[#666666] hover:text-[#E63946] transition-colors rounded-sm hover:bg-red-50"
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111111] text-white px-6 py-4 rounded-sm shadow-xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-medium">
            <span className="text-[#C7A17A]">{selectedProducts.length}</span> products selected
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex items-center gap-3">
            <span className="text-sm">Change status to:</span>
            <select 
              value={bulkStatus} 
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-white/10 border border-white/20 text-sm py-1.5 px-3 rounded-sm focus:outline-none focus:border-[#C7A17A]"
            >
              <option value="" className="text-black">Select Status</option>
              <option value="active" className="text-black">Active</option>
              <option value="draft" className="text-black">Draft</option>
            </select>
            <button 
              onClick={applyBulkAction}
              disabled={!bulkStatus || updating}
              className="bg-[#C7A17A] text-white px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-[#B38D66] transition-colors disabled:opacity-50"
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
