"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Tag, LayoutGrid, FileText, Settings, AlignLeft, Bold, Italic, List } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/store/useToastStore";
import VariantsEditor, { ColorGroup, groupsToVariantPayloads, groupsToImagePayloads } from "@/components/admin/VariantsEditor";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    sku: "",
    category_ids: [] as string[],
    status: "active",
    is_trending: false,
    is_featured: false,
    is_bestseller: false,
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
    if (productId && productId !== 'new') {
      fetchProduct();
    } else {
      setInitialLoading(false);
    }
  }, [productId]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(category_id),
          product_images(image_url, color_name),
          product_variants(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (product) {
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ? product.price.toString() : "",
          compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : "",
          sku: product.sku || "",
          category_ids: product.product_categories ? product.product_categories.map((c: any) => c.category_id) : [],
          status: product.status || "active",
          is_trending: product.is_trending || false,
          is_featured: product.is_featured || false,
          is_bestseller: product.is_bestseller || false,
          brand: product.brand || "Tranquil",
          fabric: product.fabric || "",
          weight: product.weight ? product.weight.toString() : "",
          tags: product.tags && Array.isArray(product.tags) ? product.tags.join(', ') : "",
          seo_title: product.seo_title || "",
          seo_description: product.seo_description || ""
        });

        if (product.product_variants && product.product_variants.length > 0) {
          const groupsMap = new Map<string, ColorGroup>();
          product.product_variants.forEach((v: any) => {
            const key = v.color_name;
            if (!groupsMap.has(key)) {
              const imgs = product.product_images 
                ? product.product_images.filter((img: any) => img.color_name === key).map((img: any) => img.image_url) 
                : [];
              groupsMap.set(key, {
                id: crypto.randomUUID(),
                color_name: key,
                color_hex: v.color_hex || "#000000",
                image_urls: imgs,
                sizes: []
              });
            }
            const g = groupsMap.get(key)!;
            g.sizes.push({
              id: v.id || crypto.randomUUID(),
              size: v.size,
              stock_quantity: v.stock_quantity
            });
          });
          setColorGroups(Array.from(groupsMap.values()));
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load product details");
    } finally {
      setInitialLoading(false);
    }
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

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const current = prev.category_ids;
      if (current.includes(categoryId)) {
        return { ...prev, category_ids: current.filter(id => id !== categoryId) };
      } else {
        return { ...prev, category_ids: [...current, categoryId] };
      }
    });
  };

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

    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const nameInitials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
    const finalBaseSku = formData.sku || `${nameInitials}-${randomHex}`;

    const payload = {
      name: formData.name,
      slug: slug,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      compare_at_price: parseFloat(formData.compare_at_price) || null,
      sku: finalBaseSku,
      status: formData.status,
      is_featured: formData.is_featured,
      is_bestseller: formData.is_bestseller,
      brand: formData.brand,
      fabric: formData.fabric,
      weight: parseFloat(formData.weight) || null,
      tags: tagsArray,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
    };

    try {
      if (productId === 'new') {
        const { data: product, error } = await supabase.from("products").insert([payload]).select().single();
        if (error || !product) throw error;
        
        if (formData.category_ids.length > 0) {
          const pcPayloads = formData.category_ids.map(id => ({ product_id: product.id, category_id: id }));
          await supabase.from("product_categories").insert(pcPayloads);
        }

        const imagePayloads = groupsToImagePayloads(colorGroups, product.id);
        if (imagePayloads.length > 0) await supabase.from("product_images").insert(imagePayloads);

        const variantPayloads = groupsToVariantPayloads(colorGroups, product.id, finalBaseSku);
        await supabase.from("product_variants").insert(variantPayloads);
        
        toast.success("Product created successfully!");
      } else {
        const { error } = await supabase.from("products").update(payload).eq('id', productId);
        if (error) throw error;

        await supabase.from("product_categories").delete().eq('product_id', productId);
        if (formData.category_ids.length > 0) {
          const pcPayloads = formData.category_ids.map(id => ({ product_id: productId, category_id: id }));
          await supabase.from("product_categories").insert(pcPayloads);
        }

        await supabase.from("product_images").delete().eq('product_id', productId);
        const imagePayloads = groupsToImagePayloads(colorGroups, productId);
        if (imagePayloads.length > 0) await supabase.from("product_images").insert(imagePayloads);

        await supabase.from("product_variants").delete().eq('product_id', productId);
        const variantPayloads = groupsToVariantPayloads(colorGroups, productId, finalBaseSku);
        if (variantPayloads.length > 0) await supabase.from("product_variants").insert(variantPayloads);

        toast.success("Product updated successfully!");
      }
      
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rich-black"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 z-40 bg-ivory/90 backdrop-blur-md pb-4 pt-6 md:pt-8 -mt-6 md:-mt-8 -mx-4 px-4 md:-mx-6 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 bg-white border border-border-light rounded-sm hover:bg-ivory transition-colors">
              <ArrowLeft className="w-5 h-5 text-rich-black" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl text-rich-black">{productId === 'new' ? 'Create Product' : 'Edit Product'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/admin/products" className="px-4 py-2 border border-border-light text-sm text-rich-black font-medium uppercase tracking-widest hover:bg-white transition-colors text-center w-full sm:w-auto bg-white">
              Discard
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-rich-black text-white text-sm font-medium uppercase tracking-widest hover:bg-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-border-light shadow-sm">
              <div className="p-4 border-b border-border-light flex items-center gap-2 bg-ivory">
                <FileText className="w-4 h-4 text-neutral-500" />
                <h2 className="font-serif text-lg text-rich-black">Basic Information</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Title</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="e.g. Midnight Silk Dress" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-rich-black">Description</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => insertFormatting('b')} className="p-1.5 border border-border-light bg-ivory hover:bg-border-light text-rich-black rounded-sm"><Bold className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => insertFormatting('i')} className="p-1.5 border border-border-light bg-ivory hover:bg-border-light text-rich-black rounded-sm"><Italic className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => insertFormatting('ul')} className="p-1.5 border border-border-light bg-ivory hover:bg-border-light text-rich-black rounded-sm"><List className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <textarea id="description_field" name="description" rows={8} value={formData.description} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold font-mono" placeholder="Use HTML tags like <b>, <i>, <ul> for styling..."></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border-light shadow-sm">
              <div className="p-4 border-b border-border-light flex items-center gap-2 bg-ivory">
                <LayoutGrid className="w-4 h-4 text-neutral-500" />
                <h2 className="font-serif text-lg text-rich-black">Variants & Inventory</h2>
              </div>
              <div className="p-4 bg-[#FDFDFC]">
                <VariantsEditor groups={colorGroups} onChange={setColorGroups} />
              </div>
            </div>

            <div className="bg-white border border-border-light shadow-sm">
              <div className="p-4 border-b border-border-light flex items-center gap-2 bg-ivory">
                <AlignLeft className="w-4 h-4 text-neutral-500" />
                <h2 className="font-serif text-lg text-rich-black">Search Engine Optimization</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Page Title</label>
                  <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder={formData.name || "Title used for Google search..."} />
                  <p className="text-xs text-neutral-400 mt-1">{formData.seo_title.length} of 70 characters used</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Meta Description</label>
                  <textarea name="seo_description" rows={3} value={formData.seo_description} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="A brief description of the product for search results..."></textarea>
                  <p className="text-xs text-neutral-400 mt-1">{formData.seo_description.length} of 160 characters used</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-border-light shadow-sm">
              <div className="p-4 border-b border-border-light flex items-center gap-2 bg-ivory">
                <Settings className="w-4 h-4 text-neutral-500" />
                <h2 className="font-serif text-lg text-rich-black">Pricing & Status</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold bg-white">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-2">Price (₹)</label>
                    <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-2">Compare-at (₹)</label>
                    <input type="number" step="0.01" name="compare_at_price" value={formData.compare_at_price} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="0.00" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border-light">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-rich-black border-border-light focus:ring-rich-black" />
                    <span className="text-sm font-medium text-rich-black">Feature on Homepage</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_trending" checked={formData.is_trending} onChange={handleChange} className="w-4 h-4 text-rich-black border-border-light focus:ring-rich-black" />
                    <span className="text-sm font-medium text-rich-black">Mark as Trending</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_bestseller" checked={formData.is_bestseller} onChange={handleChange} className="w-4 h-4 text-rich-black border-border-light focus:ring-rich-black" />
                    <span className="text-sm font-medium text-rich-black">Mark as Best Seller</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border-light shadow-sm">
              <div className="p-4 border-b border-border-light flex items-center gap-2 bg-ivory">
                <Tag className="w-4 h-4 text-neutral-500" />
                <h2 className="font-serif text-lg text-rich-black">Organization</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Categories</label>
                  <div className="space-y-2 border border-border-light p-3 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.category_ids.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="w-4 h-4 text-rich-black focus:ring-rich-black border-border-light rounded-sm"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                    {categories.length === 0 && <span className="text-sm text-neutral-500">No categories found.</span>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="Tranquil" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Fabric / Material</label>
                  <input type="text" name="fabric" value={formData.fabric} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="e.g. 100% Silk" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Weight (grams)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="e.g. 250" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">Tags</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold" placeholder="e.g. summer, dress, elegant" />
                  <p className="text-xs text-neutral-400 mt-1">Comma-separated</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
