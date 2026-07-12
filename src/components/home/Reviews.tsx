"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";

const defaultReviews = [
  {
    id: 1,
    name: "Aanya S.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200",
    text: "The quality of the satin slip dress is incredible. It feels like second skin and fits perfectly. Truly a luxury experience.",
    product: "Satin Slip Midi Dress"
  },
  {
    id: 2,
    name: "Meera K.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    text: "Wore the draped halter gown for my engagement party and received endless compliments. The finishing is flawless.",
    product: "Draped Halter Gown"
  },
  {
    id: 3,
    name: "Riya M.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200",
    text: "Beautiful packaging and fast shipping. The corset top is even better in person. Will definitely shop again!",
    product: "Embellished Corset Top"
  }
];

interface Review {
  id: string | number;
  name: string;
  image: string;
  text: string;
  product: string;
}

export default function Reviews({ reviews: initialReviews }: { reviews?: Review[] }) {
  const [currentReview, setCurrentReview] = useState(0);

  const displayReviews = initialReviews && initialReviews.length > 0 ? initialReviews : defaultReviews;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % displayReviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayReviews.length]);

  return (
    <section className="py-12 md:py-32 bg-[#FAF8F5] overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#111111] mb-4"
          >
            Tranquil Muses
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#666666] font-serif italic text-lg md:text-xl"
          >
            Real reviews from our community
          </motion.p>
        </div>

        <div className="relative w-full max-w-4xl min-h-[400px] md:min-h-[350px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col justify-center items-center text-center px-4"
            >
              <div className="flex justify-center items-center gap-1.5 mb-8 text-[#C7A17A]">
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </div>
              
              <p className="text-[#111111] font-serif text-2xl md:text-4xl lg:text-5xl leading-relaxed md:leading-snug mb-12 italic tracking-wide max-w-3xl font-light">
                "{displayReviews[currentReview].text}"
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 mt-auto">
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-100 shadow-md">
                  <Image src={displayReviews[currentReview].image} alt={displayReviews[currentReview].name} fill className="object-cover" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1 text-[#111111] font-medium tracking-widest text-xs md:text-sm uppercase mb-1">
                    {displayReviews[currentReview].name}
                    <BadgeCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C7A17A]" />
                  </div>
                  <span className="text-[#666666] text-[10px] md:text-xs uppercase tracking-widest">{displayReviews[currentReview].product}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-4 mt-16 md:mt-24">
          {displayReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentReview(i)}
              aria-label={`Go to review ${i + 1}`}
              className={`transition-all duration-500 ease-out rounded-full ${
                i === currentReview 
                  ? 'w-10 h-1.5 bg-[#C7A17A]' 
                  : 'w-1.5 h-1.5 bg-[#111111]/20 hover:bg-[#111111]/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
