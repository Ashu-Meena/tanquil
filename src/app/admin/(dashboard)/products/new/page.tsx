"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Tag, LayoutGrid, Image as ImageIcon, FileText, Settings, AlignLeft, Bold, Italic, List } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "@/store/useToastStore";

interface Variant {
  id: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
  sku: string;
  image_urls: string[];
}

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

  const [variants, setVariants] = useState<Variant[]>([
    { id: crypto.randomUUID(), color_name: "Default", color_hex: "#000000", size: "OS", stock_quantity: 0, sku: "", image_urls: [] }
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

  // Variant Management
  const addVariant = () => {
    setVariants([...variants, { id: crypto.randomUUID(), color_name: "", color_hex: "#000000", size: "", stock_quantity: 0, sku: "", image_urls: [] }]);
  };
  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(prev => {
      const targetVariant = prev.find(v => v.id === id);
      if (!targetVariant) return prev;
      
      const newVariants = prev.map(v => v.id === id ? { ...v, [field]: value } : v);
      
      // Auto-sync image_urls across variants with the same color_name
      if (field === 'image_urls' && targetVariant.color_name) {
        return newVariants.map(v => 
          v.color_name === targetVariant.color_name ? { ...v, image_urls: value } : v
        );
      }
      
      // If color changes, auto-populate images from existing variants with the new color
      if (field === 'color_name' && value) {
        const existingColorVariant = newVariants.find(v => v.id !== id && v.color_name === value && v.image_urls && v.image_urls.length > 0);
        if (existingColorVariant) {
          return newVariants.map(v => v.id === id ? { ...v, image_urls: existingColorVariant.image_urls } : v);
        }
      }
      
      return newVariants;
    });
  };
  const removeVariant = (id: string) => {
    if (variants.length === 1) return toast.error("You must have at least one variant.");
    setVariants(variants.filter(v => v.id !== id));
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
      sku: finalBaseSku,
      category_id: formData.category_id || null,
      status: formData.status,
      is_trending: formData.is_trending,
      is_featured: formData.is_featured,
      brand: formData.brand,
      fabric: formData.fabric,
      weight: parseFloat(formData.weight) || null,
      tags: tagsArray,
      seo_title: formData.seo_title || formData.name,
      seo_description: formData.seo_description
    };

    const { data: product, error } = await supabase.from("products").insert([payload]).select().single();

    if (error || !product) {
      toast.error("Error saving product: " + (error?.message || "Unknown error"));
      setLoading(false);
      return;
    }

    // Extract and Insert Images Grouped by Color
    const uniqueColors = new Set<string>();
    const imagePayloads: any[] = [];
    
    variants.forEach(v => {
      const colorKey = v.color_name.trim() || "Default";
      if (!uniqueColors.has(colorKey) && v.image_urls && v.image_urls.length > 0) {
        uniqueColors.add(colorKey);
        const validUrls = v.image_urls.filter(url => url.trim() !== "");
        validUrls.forEach((url, index) => {
          imagePayloads.push({
            product_id: product.id,
            url,
            color_name: colorKey,
            display_order: index + 1
          });
        });
      }
    });

    if (imagePayloads.length > 0) {
      await supabase.from("product_images").insert(imagePayloads);
    }

    // Insert Variants
    const variantPayloads = variants.map(v => {
      const colorCode = v.color_name.trim().substring(0, 3).toUpperCase() || "DEF";
      const sizeCode = v.size.trim().toUpperCase() || "OS";
      const vSku = `${finalBaseSku}-${colorCode}-${sizeCode}-${randomHex}`;
      
      return {
        product_id: product.id,
        color_name: v.color_name,
        color_hex: v.color_hex,
        size: v.size,
        stock_quantity: v.stock_quantity,
        sku: vSku
      };
    });
    
    const { error: varError } = await supabase.from("product_variants").insert(variantPayloads);
    
    if (varError) {
      toast.error("Product saved, but variants failed: " + varError.message);
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
              <div className="p-4 border-b border-[#EFEFEF] flex items-center justify-between bg-[#F9F9F9]">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-[#666666]" />
                  <h2 className="font-serif text-lg text-[#111111]">Variants & Inventory</h2>
                </div>
                <button type="button" onClick={addVariant} className="text-xs text-[#111111] font-medium uppercase tracking-widest hover:text-[#C7A17A] flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Variant
                </button>
              </div>
              <div className="p-4 bg-[#FDFDFC]">
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="border border-[#EFEFEF] rounded-sm p-5 bg-white shadow-sm relative group hover:border-[#C7A17A] transition-colors">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EFEFEF]">
                        <h3 className="text-sm font-medium text-[#111111]">Variant {index + 1}</h3>
                        <button type="button" onClick={() => removeVariant(variant.id)} className="text-xs flex items-center gap-1 text-[#999999] hover:text-[#E63946] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Color */}
                        <div className="col-span-1 md:col-span-4">
                          <label className="block text-xs font-medium text-[#666666] uppercase tracking-wider mb-1.5">Color Details</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={variant.color_hex} onChange={e => updateVariant(variant.id, 'color_hex', e.target.value)} className="w-10 h-10 border border-[#EFEFEF] p-0.5 cursor-pointer rounded-sm flex-shrink-0 bg-white" title="Choose color hex" />
                            <input type="text" value={variant.color_name} onChange={e => updateVariant(variant.id, 'color_name', e.target.value)} className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors" placeholder="e.g. Midnight Blue" />
                          </div>
                        </div>
                        
                        {/* Size */}
                        <div className="col-span-1 md:col-span-3">
                           <label className="block text-xs font-medium text-[#666666] uppercase tracking-wider mb-1.5">Size</label>
                           <div className="flex flex-col gap-2">
                            <select 
                              value={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'].includes(variant.size) ? variant.size : 'Custom'}
                              onChange={e => updateVariant(variant.id, 'size', e.target.value === 'Custom' ? '' : e.target.value)}
                              className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors"
                            >
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                              <option value="OS">OS (One Size)</option>
                              <option value="Custom">Custom...</option>
                            </select>
                            {(!['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'].includes(variant.size)) && (
                              <input 
                                type="text" 
                                value={variant.size} 
                                onChange={e => updateVariant(variant.id, 'size', e.target.value)} 
                                className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors" 
                                placeholder="Enter custom size" 
                              />
                            )}
                          </div>
                        </div>
                        
                        {/* Stock */}
                        <div className="col-span-1 md:col-span-2">
                           <label className="block text-xs font-medium text-[#666666] uppercase tracking-wider mb-1.5">Stock</label>
                           <input type="number" value={variant.stock_quantity} onChange={e => updateVariant(variant.id, 'stock_quantity', parseInt(e.target.value) || 0)} className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors font-mono" />
                        </div>
                        
                        {/* SKU is auto-generated */}

                        {/* Variant Gallery */}
                        <div className="col-span-1 md:col-span-12 mt-4 pt-4 border-t border-[#EFEFEF]">
                           <label className="block text-xs font-medium text-[#666666] uppercase tracking-wider mb-3">Color Media Gallery</label>
                           <p className="text-xs text-[#999999] mb-4 -mt-2">Images uploaded here will automatically sync to all variants sharing the exact same color name.</p>
                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {variant.image_urls.map((img, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <ImageUploader 
                                    value={img} 
                                    onChange={(url) => {
                                      const newUrls = [...variant.image_urls];
                                      newUrls[imgIndex] = url;
                                      updateVariant(variant.id, 'image_urls', newUrls);
                                    }} 
                                    label=""
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newUrls = variant.image_urls.filter((_, i) => i !== imgIndex);
                                      updateVariant(variant.id, 'image_urls', newUrls);
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-white border border-[#EFEFEF] shadow-sm text-[#E63946] hover:bg-[#E63946] hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <div 
                                onClick={() => updateVariant(variant.id, 'image_urls', [...variant.image_urls, ""])}
                                className="border border-dashed border-[#EFEFEF] hover:border-[#C7A17A] rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors aspect-square w-full bg-[#FAF8F5]"
                              >
                                <Plus className="w-5 h-5 text-[#666666] mb-1" />
                                <span className="text-[10px] font-medium text-[#666666] uppercase tracking-widest text-center px-2">Add Image</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
