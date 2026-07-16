"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Star, MessageSquare, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const router = useRouter();

  const fetchSessionAndReviews = useCallback(async () => {
    const supabase = createClient();
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
      
    if (data) setReviews(data as Review[]);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessionAndReviews();
  }, [fetchSessionAndReviews]);



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

    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      status: "approved"
    });

    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: "Failed to submit review. Please try again." });
    } else {
      setMessage({ type: "success", text: "Thank you! Your review has been submitted." });
      setTitle("");
      setComment("");
      setRating(5);
      fetchSessionAndReviews();
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

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="w-full border-t border-border-light pt-16 lg:pt-24 mt-16 lg:mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Left Column: Summary & CTA */}
        <div className="lg:col-span-4 flex flex-col items-start">
          <span className="text-gold text-[10px] uppercase tracking-[0.2em] font-medium mb-3 block">Testimonials</span>
          <h2 className="font-serif text-3xl md:text-4xl text-rich-black mb-6">Client Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="flex items-center gap-5 mb-8">
              <div className="text-5xl font-serif text-rich-black">
                 {averageRating}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-neutral-200 fill-current'}`} />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">Based on {reviews.length} reviews</span>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex text-neutral-200 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">No reviews yet</span>
            </div>
          )}
          
          <button 
            onClick={handleWriteReviewClick}
            className="w-full sm:w-auto bg-white border border-rich-black text-rich-black px-8 py-3.5 uppercase tracking-widest text-[10px] md:text-xs font-medium hover:bg-rich-black hover:text-white transition-colors duration-300"
          >
            Write a Review
          </button>
        </div>

        {/* Right Column: Reviews List, Form, or Empty State */}
        <div className="lg:col-span-8">
          {showForm && (
            <div className="bg-ivory/30 border border-border-light p-6 md:p-10 mb-12">
              <h3 className="font-serif text-2xl text-rich-black mb-6">Share Your Experience</h3>
              {message.text && (
                <div className={`p-4 mb-6 text-sm ${message.type === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-gold text-gold' : 'text-neutral-200 fill-current'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Review Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full bg-white border border-border-light p-3.5 focus:outline-none focus:border-gold transition-colors text-sm rounded-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Review Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you loved about this piece"
                    rows={5}
                    className="w-full bg-white border border-border-light p-3.5 focus:outline-none focus:border-gold transition-colors text-sm rounded-none resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3.5 text-[10px] uppercase tracking-widest text-neutral-500 font-medium hover:text-rich-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-rich-black text-white px-8 py-3.5 uppercase tracking-widest text-[10px] font-medium hover:bg-gold transition-colors flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : reviews.length === 0 && !showForm ? (
            <div className="py-16 md:py-24 border-t border-border-light lg:border-t-0 flex flex-col items-center justify-center text-center">
              <span className="text-gold text-[10px] uppercase tracking-[0.2em] font-medium mb-4">Share Your Thoughts</span>
              <h4 className="font-serif text-2xl md:text-3xl text-rich-black mb-4">We Value Your Feedback</h4>
              <p className="text-neutral-500 max-w-md mx-auto text-sm leading-relaxed">
                Be the first to review this piece. Your insights help us refine our craft and guide others in their journey.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border-light pb-12 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                    <div>
                      <h4 className="font-serif text-xl text-rich-black mb-2">{review.title}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-gold text-gold' : 'text-neutral-200 fill-current'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">{review.comment}</p>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-8 h-8 bg-ivory rounded-full flex items-center justify-center text-rich-black border border-border-light">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-rich-black uppercase tracking-widest text-[10px]">
                        {review.profiles?.first_name ? `${review.profiles.first_name} ${review.profiles.last_name || ''}` : 'Verified Customer'}
                      </span>
                      <span className="text-neutral-400 text-[10px] uppercase tracking-widest">Purchased Item</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
