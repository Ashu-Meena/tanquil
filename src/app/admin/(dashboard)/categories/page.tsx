"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Image from "next/image";

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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF8F5] text-[#111111] uppercase tracking-widest text-[11px] border-b border-[#EFEFEF]">
              <tr>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#666666]">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#666666]">
                    No categories found. <Link href="/admin/categories/new" className="text-[#C7A17A] hover:underline">Create one</Link>.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#EFEFEF] relative rounded-sm overflow-hidden flex-shrink-0">
                          {category.image_url ? (
                            <Image src={category.image_url} alt={category.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#999999] text-[10px]">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#111111]">{category.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#666666]">{category.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                        category.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {category.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-[#999999] hover:text-[#111111] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCategory(category.id)} className="text-[#999999] hover:text-red-500 transition-colors">
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
    </div>
  );
}
