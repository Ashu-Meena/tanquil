"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Filter, Check, X, Trash2, Star } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function ReviewsPage() {
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        products (name),
        profiles (first_name, last_name, email)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setReviews(data);
    setLoading(false);
  };

  const updateReviewStatus = async (id: string, status: string) => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await supabase.from("reviews").delete().eq("id", id);
      fetchReviews();
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#111111] mb-1">Reviews</h1>
          <p className="text-[#666666] text-sm">Moderate customer reviews and ratings</p>
        </div>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center">
          <div className="flex items-center w-full sm:w-auto bg-[#FAF8F5] px-3 py-2 rounded-sm border border-[#EFEFEF] focus-within:border-[#C7A17A] transition-colors">
            <Search className="w-4 h-4 text-[#999999] mr-2" />
            <input 
              type="text" 
              placeholder="Search by product, email or title..." 
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
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Review</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#666666]">Loading reviews...</td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#666666]">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#111111]">{review.profiles?.first_name} {review.profiles?.last_name}</p>
                      <p className="text-xs text-[#999999]">{review.profiles?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#666666]">{review.products?.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-[#EFEFEF]'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium text-[#111111] truncate">{review.title}</p>
                      <p className="text-xs text-[#666666] line-clamp-2">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {review.status !== 'approved' && (
                          <button onClick={() => updateReviewStatus(review.id, 'approved')} className="text-green-600 hover:bg-green-50 p-1.5 rounded-sm transition-colors" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button onClick={() => updateReviewStatus(review.id, 'rejected')} className="text-orange-600 hover:bg-orange-50 p-1.5 rounded-sm transition-colors" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => deleteReview(review.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-sm transition-colors ml-2" title="Delete">
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
