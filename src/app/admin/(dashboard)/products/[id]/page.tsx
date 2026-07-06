"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/admin/ImageUploader";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category_id: "",
    stock_quantity: "",
    status: "active",
    image_url: ""
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [params.id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    setFetching(true);
    const { data: product, error } = await supabase
      .from('products')
      .select('*, product_images(url)')
      .eq('id', params.id)
      .single();

    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        sku: product.sku || "",
        category_id: product.category_id || "",
        stock_quantity: product.stock_quantity?.toString() || "0",
        status: product.status || "active",
        image_url: (product.product_images && product.product_images[0]?.url) || ""
      });
    }
    setFetching(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate a quick slug from name
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const payload = {
      name: formData.name,
      slug: slug,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      sku: formData.sku,
      category_id: formData.category_id || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      status: formData.status
    };

    const { error } = await supabase.from("products").update(payload).eq("id", params.id);

    if (error) {
      alert("Error saving product: " + error.message);
      setLoading(false);
      return;
    }

    if (formData.image_url) {
      // Very basic approach: delete old images and insert the new one
      await supabase.from("product_images").delete().eq("product_id", params.id);
      await supabase.from("product_images").insert([{
        product_id: params.id,
        url: formData.image_url,
        display_order: 1
      }]);
    }

    setLoading(false);
    router.push("/admin/products");
  };

  if (fetching) {
    return <div className="p-8 text-center text-[#666666]">Loading product...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 border border-[#EFEFEF] rounded-sm hover:bg-white transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#111111]" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl text-[#111111]">Edit Product</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" onClick={() => router.push('/admin/products')} className="px-4 py-2 text-sm text-[#111111] bg-white border border-[#EFEFEF] rounded-sm hover:bg-[#FAF8F5] transition-colors w-full sm:w-auto">
              Discard
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#111111] text-white px-6 py-2 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm w-full sm:w-auto disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-4">
              <h2 className="font-serif text-xl text-[#111111] mb-4">General Information</h2>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#111111]">Product Name *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Silk Evening Gown"
                  className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#111111]">Description</label>
                <textarea 
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter detailed product description..."
                  className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]"
                />
              </div>
            </div>

            {/* Media */}
            <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm">
              <h2 className="font-serif text-xl text-[#111111] mb-4">Media</h2>
              <ImageUploader 
                label="Primary Product Image"
                value={formData.image_url}
                onChange={(url) => setFormData({...formData, image_url: url})}
              />
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm">
              <h2 className="font-serif text-xl text-[#111111] mb-4">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#111111]">Price (₹) *</label>
                  <input 
                    type="number" 
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-4">
              <h2 className="font-serif text-xl text-[#111111] mb-2">Status</h2>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Organization */}
            <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-4">
              <h2 className="font-serif text-xl text-[#111111] mb-2">Organization</h2>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#111111]">Category</label>
                <select 
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-4">
              <h2 className="font-serif text-xl text-[#111111] mb-2">Inventory</h2>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#111111]">SKU (Stock Keeping Unit)</label>
                <input 
                  type="text" 
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#111111]">Quantity *</label>
                <input 
                  type="number" 
                  name="stock_quantity"
                  required
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
