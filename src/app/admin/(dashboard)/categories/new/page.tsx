"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Save, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "@/store/useToastStore";

export default function NewCategoryPage() {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
    display_order: 0
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("categories")
        .insert([formData]);

      if (error) throw error;
      
      router.push("/admin/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 border border-border-light rounded-sm hover:bg-ivory transition-colors">
            <ArrowLeft className="w-4 h-4 text-neutral-500" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-rich-black mb-1">New Category</h1>
            <p className="text-neutral-500 text-sm">Create a new product category</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-rich-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gold transition-colors rounded-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Category"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-border-light rounded-sm shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-rich-black mb-2">Category Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})}
                className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold rounded-sm transition-colors"
                placeholder="e.g., Summer Collection"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-rich-black mb-2">Slug</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold rounded-sm transition-colors bg-ivory"
                placeholder="summer-collection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rich-black mb-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold rounded-sm transition-colors min-h-[120px]"
                placeholder="Brief description of this category..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border border-border-light rounded-sm shadow-sm space-y-4">
            <h3 className="font-medium text-rich-black">Status</h3>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                />
                <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
              <span className="text-sm text-neutral-500">{formData.is_active ? 'Active' : 'Hidden'}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-rich-black mb-2 mt-4">Display Order</label>
              <input 
                type="number" 
                value={formData.display_order}
                onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                className="w-full border border-border-light p-3 text-sm focus:outline-none focus:border-gold rounded-sm transition-colors"
              />
            </div>
          </div>

          <div className="bg-white p-6 border border-border-light rounded-sm shadow-sm space-y-4">
            <h3 className="font-medium text-rich-black flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Category Image
            </h3>
            <ImageUploader
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
            {formData.image_url && (
              <div className="relative w-full h-40 bg-ivory rounded-sm overflow-hidden border border-border-light">{/* eslint-disable-next-line  */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.image_url} alt="Category" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setFormData({...formData, image_url: ''})}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-sm shadow-sm text-error hover:bg-white transition-colors"
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
