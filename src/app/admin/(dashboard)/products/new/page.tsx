"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Tag, LayoutGrid, FileText, Settings, AlignLeft, Bold, Italic, List } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/store/useToastStore";
import VariantsEditor, { ColorGroup, groupsToVariantPayloads, groupsToImagePayloads } from "@/components/admin/VariantsEditor";



export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    sku: "",
    category_id: "",
    status: "active",
    is_trending: false,
    is_featured: false,
    brand: "Tranquil",
    fabric: "",
    weight: "",
    tags: "",
    seo_title: "",
    seo_description: ""
  });

  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([
    {
      id: crypto.randomUUID(),
      color_name: "Default",
      color_hex: "#000000",
      image_urls: [],
      sizes: [{ id: crypto.randomUUID(), size: "S", stock_quantity: 0 }],
    },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Simple Rich Text Toolbar
  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById("description_field") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selection = text.substring(start, end);
    
    let newText = "";
    if (tag === "b") newText = `${before}<b>${selection || "bold text"}</b>${after}`;
    else if (tag === "i") newText = `${before}<i>${selection || "italic text"}</i>${after}`;
    else if (tag === "ul") newText = `${before}<ul>\n  <li>${selection || "list item"}</li>\n</ul>\n${after}`;

    setFormData({ ...formData, description: newText });
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Product name is required");
    
    setLoading(true);
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    // Auto-generate Base SKU based on Product Name and unique string
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const nameInitials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
    const finalBaseSku = `${nameInitials}-${randomHex}`;

    const payload = {
      name: formData.name,
      slug: slug,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      compare_at_price: parseFloat(formData.compare_at_price) || null,
      category_id: formData.category_id || null,
      status: formData.status,
      is_featured: formData.is_featured,
    };

    const { data: product, error } = await supabase.from("products").insert([payload]).select().single();

    if (error || !product) {
      console.error("Product creation error:", error);
      toast.error("Failed to save product. Please try again or check the logs.");
      setLoading(false);
      return;
    }

    // Insert Images
    const imagePayloads = groupsToImagePayloads(colorGroups, product.id);
    if (imagePayloads.length > 0) {
      await supabase.from("product_images").insert(imagePayloads);
    }

    // Insert Variants (1 row per color × size)
    const variantPayloads = groupsToVariantPayloads(colorGroups, product.id, finalBaseSku);
    const { error: varError } = await supabase.from("product_variants").insert(variantPayloads);

    if (varError) {
      console.error("Product variants creation error:", varError);
      toast.error("Product saved, but some variants failed to create. Please check the logs.");
    } else {
      toast.success("Product created successfully!");
    }

    setLoading(false);
    router.push("/admin/products");
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md pb-4 pt-6 md:pt-8 -mt-6 md:-mt-8 -mx-4 px-4 md:-mx-6 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 bg-white border border-[#EFEFEF] rounded-sm hover:bg-[#F9F9F9] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#111111]" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl text-[#111111]">Create Product</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/admin/products" className="px-4 py-2 border border-[#EFEFEF] text-sm text-[#111111] font-medium uppercase tracking-widest hover:bg-white transition-colors text-center w-full sm:w-auto bg-white">
              Discard
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-[#111111] text-white text-sm font-medium uppercase tracking-widest hover:bg-[#C7A17A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white border border-[#EFEFEF] shadow-sm">
              <div className="p-4 border-b border-[#EFEFEF] flex items-center gap-2 bg-[#F9F9F9]">
                <FileText className="w-4 h-4 text-[#666666]" />
                <h2 className="font-serif text-lg text-[#111111]">Basic Information</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Title</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. Midnight Silk Dress" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-[#111111]">Description</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => insertFormatting('b')} className="p-1.5 border border-[#EFEFEF] bg-[#F9F9F9] hover:bg-[#EFEFEF] text-[#111111] rounded-sm"><Bold className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => insertFormatting('i')} className="p-1.5 border border-[#EFEFEF] bg-[#F9F9F9] hover:bg-[#EFEFEF] text-[#111111] rounded-sm"><Italic className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => insertFormatting('ul')} className="p-1.5 border border-[#EFEFEF] bg-[#F9F9F9] hover:bg-[#EFEFEF] text-[#111111] rounded-sm"><List className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <textarea id="description_field" name="description" rows={8} value={formData.description} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] font-mono" placeholder="Use HTML tags like <b>, <i>, <ul> for styling..."></textarea>
                </div>
              </div>
            </div>


            {/* Variants & Inventory */}
            <div className="bg-white border border-[#EFEFEF] shadow-sm">
              <div className="p-4 border-b border-[#EFEFEF] flex items-center gap-2 bg-[#F9F9F9]">
                <LayoutGrid className="w-4 h-4 text-[#666666]" />
                <h2 className="font-serif text-lg text-[#111111]">Variants & Inventory</h2>
              </div>
              <div className="p-4 bg-[#FDFDFC]">
                <VariantsEditor groups={colorGroups} onChange={setColorGroups} />
              </div>
            </div>

            {/* SEO section */}
            <div className="bg-white border border-[#EFEFEF] shadow-sm">
              <div className="p-4 border-b border-[#EFEFEF] flex items-center gap-2 bg-[#F9F9F9]">
                <AlignLeft className="w-4 h-4 text-[#666666]" />
                <h2 className="font-serif text-lg text-[#111111]">Search Engine Optimization</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Page Title</label>
                  <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder={formData.name || "Title used for Google search..."} />
                  <p className="text-xs text-[#999999] mt-1">{formData.seo_title.length} of 70 characters used</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Meta Description</label>
                  <textarea name="seo_description" rows={3} value={formData.seo_description} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="A brief description of the product for search results..."></textarea>
                  <p className="text-xs text-[#999999] mt-1">{formData.seo_description.length} of 160 characters used</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* Status & Pricing */}
            <div className="bg-white border border-[#EFEFEF] shadow-sm">
              <div className="p-4 border-b border-[#EFEFEF] flex items-center gap-2 bg-[#F9F9F9]">
                <Settings className="w-4 h-4 text-[#666666]" />
                <h2 className="font-serif text-lg text-[#111111]">Pricing & Status</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] bg-white">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Price (₹)</label>
                    <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Compare-at (₹)</label>
                    <input type="number" step="0.01" name="compare_at_price" value={formData.compare_at_price} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="0.00" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFEFEF]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-[#111111] border-[#EFEFEF] focus:ring-[#111111]" />
                    <span className="text-sm font-medium text-[#111111]">Feature on Homepage</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_trending" checked={formData.is_trending} onChange={handleChange} className="w-4 h-4 text-[#111111] border-[#EFEFEF] focus:ring-[#111111]" />
                    <span className="text-sm font-medium text-[#111111]">Mark as Trending</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-white border border-[#EFEFEF] shadow-sm">
              <div className="p-4 border-b border-[#EFEFEF] flex items-center gap-2 bg-[#F9F9F9]">
                <Tag className="w-4 h-4 text-[#666666]" />
                <h2 className="font-serif text-lg text-[#111111]">Organization</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] bg-white">
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                


                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="Tranquil" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Fabric / Material</label>
                  <input type="text" name="fabric" value={formData.fabric} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. 100% Silk" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Weight (grams)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. 250" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Tags</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. summer, dress, elegant" />
                  <p className="text-xs text-[#999999] mt-1">Comma-separated</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
