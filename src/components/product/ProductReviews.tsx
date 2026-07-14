"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Star, MessageSquare, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchSessionAndReviews();
  }, [productId]);

  const fetchSessionAndReviews = async () => {
    setLoading(true);
    // Get Session
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);

    // Get Reviews
    const { data } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
      
    if (data) setReviews(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/account");
      return;
    }
    
    if (!title.trim() || !comment.trim()) {
      setMessage({ type: "error", text: "Please provide both a title and a comment." });
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      status: "pending"
    });

    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: "Failed to submit review. Please try again." });
    } else {
      setMessage({ type: "success", text: "Thank you! Your review has been submitted and is pending moderation." });
      setTitle("");
      setComment("");
      setRating(5);
      setTimeout(() => setShowForm(false), 3000);
    }
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      router.push("/account");
    } else {
      setShowForm(!showForm);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-serif text-3xl text-rich-black">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-neutral-500">Based on {reviews.length} reviews</span>
          </div>
        </div>
        
        <button 
          onClick={handleWriteReviewClick}
          className="bg-rich-black text-white px-6 py-3 uppercase tracking-widest text-xs font-medium hover:bg-gold transition-colors"
        >
          Write a Review
        </button>
      </div>

      {showForm && (
        <div className="bg-ivory border border-border-light p-6 md:p-8 rounded-sm mb-12">
          <h3 className="font-serif text-xl text-rich-black mb-6">Write a Review</h3>
          {message.text && (
            <div className={`p-4 mb-6 text-sm rounded-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-gold text-gold' : 'text-neutral-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold transition-colors text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Review Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you liked or didn't like"
                rows={4}
                className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold transition-colors text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-xs uppercase tracking-widest text-neutral-500 font-medium hover:text-rich-black transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-rich-black text-white px-8 py-3 uppercase tracking-widest text-xs font-medium hover:bg-gold transition-colors flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-ivory/50 border border-border-light rounded-sm">
          <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
          <h4 className="font-medium text-rich-black mb-2">No reviews yet</h4>
          <p className="text-sm text-neutral-500 mb-6">Be the first to share your thoughts on this product.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border-light pb-8 last:border-0">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-gold text-gold' : 'text-neutral-200'}`} />
                ))}
              </div>
              <h4 className="font-serif text-lg text-rich-black mb-2">{review.title}</h4>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">{review.comment}</p>
              
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="w-6 h-6 bg-ivory rounded-full flex items-center justify-center text-rich-black border border-border-light">
                  <User className="w-3 h-3" />
                </div>
                <span className="font-medium text-rich-black uppercase tracking-widest">
                  {review.profiles?.first_name ? `${review.profiles.first_name} ${review.profiles.last_name || ''}` : 'Verified Customer'}
                </span>
                <span>•</span>
                <span>{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
