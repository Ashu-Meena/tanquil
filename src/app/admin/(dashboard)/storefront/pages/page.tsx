"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Edit, Search, Plus, Trash2 } from "lucide-react";

export default function CustomPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data } = await supabase.from('pages').select('*');
    if (data) setPages(data);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
        <h2 className="font-serif text-xl text-[#111111]">Custom Pages</h2>
        <button className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm">
          <Plus className="w-4 h-4" /> Add Page
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#FAF8F5] text-[#111111] uppercase tracking-widest text-[11px] border-b border-[#EFEFEF]">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#666666]">Loading pages...</td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#666666]">No custom pages found.</td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5]">
                  <td className="px-6 py-4 font-medium text-[#111111]">{page.title}</td>
                  <td className="px-6 py-4 text-[#666666]">/{page.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                      page.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {page.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#999999] hover:text-[#111111] transition-colors mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-[#999999] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
