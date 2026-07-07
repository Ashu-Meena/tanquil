"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Tag, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const deleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await supabase.from("categories").delete().eq("id", id);
      fetchCategories();
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#111111] mb-1">Categories</h1>
          <p className="text-[#666666] text-sm">Manage your product collections and navigation</p>
        </div>
        <Link 
          href="/admin/categories/new" 
          className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center">
          <div className="flex items-center w-full sm:w-auto bg-[#FAF8F5] px-3 py-2 rounded-sm border border-[#EFEFEF] focus-within:border-[#C7A17A] transition-colors">
            <Search className="w-4 h-4 text-[#999999] mr-2" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-[#111111] placeholder:text-[#999999]"
            />
          </div>
        </div>

        {/* Grid Layout */}
        <div className="p-6 bg-[#F9F9F9] min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[200px]">
              <p className="text-[#666666] animate-pulse">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center border-2 border-dashed border-[#EFEFEF] rounded-lg">
              <Tag className="w-12 h-12 text-[#EFEFEF] mb-4" />
              <p className="text-[#666666] mb-4">No categories found.</p>
              <Link href="/admin/categories/new" className="bg-[#111111] text-white px-6 py-2 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm">
                Create Category
              </Link>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredCategories.map((category) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                    key={category.id} 
                    className="group bg-white border border-[#EFEFEF] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C7A17A] transition-all duration-300 flex flex-col"
                  >
                    {/* Image Header */}
                    <div className="relative w-full aspect-video bg-[#FAF8F5] overflow-hidden">
                      {category.image_url ? (
                        <Image 
                          src={category.image_url} 
                          alt={category.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#999999]">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-[10px] uppercase tracking-widest">No Image</span>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm backdrop-blur-md ${
                          category.is_active 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-orange-500/90 text-white'
                        }`}>
                          {category.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-xl text-[#111111] mb-1 group-hover:text-[#C7A17A] transition-colors line-clamp-1">{category.name}</h3>
                        <p className="text-xs text-[#666666] font-mono bg-[#F5F5F5] px-2 py-1 rounded inline-block">/{category.slug}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#EFEFEF]">
                        <Link 
                          href={`/admin/categories/${category.id}`} 
                          className="flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </Link>
                        <button 
                          onClick={() => deleteCategory(category.id)} 
                          className="flex items-center gap-2 text-sm font-medium text-[#999999] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
