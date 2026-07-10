"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "@/store/useToastStore";

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    const fetchCategory = async () => {
      setFetching(true);
      const { data, error } = await supabase.from('categories').select('*').eq('id', params.id).single();
      
      if (data) {
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          image_url: data.image_url || "",
          is_active: data.is_active,
          display_order: data.display_order || 0
        });
      } else {
        toast.error("Category not found");
        router.push("/admin/categories");
      }
      setFetching(false);
    };

    fetchCategory();
  }, [params.id, router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("categories")
        .update(formData)
        .eq('id', params.id);

      if (error) throw error;
      
      router.push("/admin/categories");
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error("Failed to complete operation. Please try again or check the logs.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-[#666666]">Loading category...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 border border-[#EFEFEF] rounded-sm hover:bg-[#FAF8F5] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#666666]" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-[#111111] mb-1">Edit Category</h1>
            <p className="text-[#666666] text-sm">Update product category</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#111111] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Category Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] rounded-sm transition-colors"
                placeholder="e.g., Summer Collection"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Slug</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] rounded-sm transition-colors bg-[#FAF8F5]"
                placeholder="summer-collection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] rounded-sm transition-colors min-h-[120px]"
                placeholder="Brief description of this category..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-4">
            <h3 className="font-medium text-[#111111]">Status</h3>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                />
                <div className="w-11 h-6 bg-[#EFEFEF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#EFEFEF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C7A17A]"></div>
              </label>
              <span className="text-sm text-[#666666]">{formData.is_active ? 'Active' : 'Hidden'}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2 mt-4">Display Order</label>
              <input 
                type="number" 
                value={formData.display_order}
                onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] rounded-sm transition-colors"
              />
            </div>
          </div>

          <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-4">
            <h3 className="font-medium text-[#111111] flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Category Image
            </h3>
            <ImageUploader
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
            {formData.image_url && (
              <div className="relative w-full h-40 bg-[#FAF8F5] rounded-sm overflow-hidden border border-[#EFEFEF]">
                <img src={formData.image_url} alt="Category" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setFormData({...formData, image_url: ''})}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-sm shadow-sm text-red-500 hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
