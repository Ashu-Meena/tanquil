"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Filter, Check, X, Trash2, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { deleteReview } from "@/app/actions/admin";
import { toast } from "@/store/useToastStore";

export default function ReviewsPage() {
  const supabase = createClient();
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const supabase = createClient();
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



  const deleteReview = async (id: string) => {
    setReviewToDelete(id);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    const result = await deleteReview(reviewToDelete);
    if (result.success) {
      toast.success("Review deleted successfully");
    } else {
      toast.error(`Failed to delete review: ${result.error}`);
    }
    setReviewToDelete(null);
    fetchReviews();
  };

  const filteredReviews = reviews.filter(r => 
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl text-rich-black mb-1">Reviews</h1>
            <p className="text-neutral-500 text-sm">Moderate customer reviews and ratings</p>
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-border-light flex justify-between items-center">
            <div className="flex items-center w-full sm:w-auto bg-ivory px-3 py-2 rounded-sm border border-border-light focus-within:border-gold transition-colors">
              <Search className="w-4 h-4 text-neutral-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search by product, email or title..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-rich-black placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-ivory text-rich-black uppercase tracking-widest text-[11px] border-b border-border-light">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Review</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gold" />
                      Loading reviews...
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                      No reviews found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map(review => (
                    <tr key={review.id} className="border-b border-border-light hover:bg-ivory transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-rich-black">{review.profiles?.first_name} {review.profiles?.last_name}</p>
                        <p className="text-xs text-neutral-500">{review.profiles?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-[200px]">
                          {review.products?.images?.[0] && (
                            <div className="relative w-10 h-10 bg-ivory rounded-sm overflow-hidden flex-shrink-0">
                              <Image src={review.products.images[0]} alt="" fill className="object-cover" />
                            </div>
                          )}
                          <p className="font-medium text-rich-black truncate">{review.products?.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 text-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-border-light"}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="font-medium text-rich-black mb-1 break-words">{review.title}</p>
                        <p className="text-neutral-500 text-xs leading-relaxed break-words">{review.comment}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <button onClick={() => deleteReview(review.id)} className="text-error hover:bg-error/10 p-1.5 rounded-sm transition-colors ml-2" title="Delete">
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteReview}
        onClose={() => setReviewToDelete(null)}
      />
    </>
  );
}
