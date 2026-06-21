"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";

const reviews = [
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

export default function Reviews() {
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-[#FAF8F5] overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl lg:text-5xl text-[#111111] mb-4"
          >
            Tranquil Muses
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#666666] font-serif italic text-xl"
          >
            Real reviews from our community
          </motion.p>
        </div>

        <div className="relative w-full max-w-3xl min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 bg-white p-8 md:p-12 shadow-sm border border-[#EFEFEF] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-center items-center gap-1 mb-8 text-[#C7A17A]">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-[#111111] font-serif text-xl md:text-2xl leading-relaxed mb-8 italic text-center">
                  "{reviews[currentReview].text}"
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-auto">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#EFEFEF]">
                  <Image src={reviews[currentReview].image} alt={reviews[currentReview].name} fill className="object-cover" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-[#111111] font-medium tracking-wide">
                    {reviews[currentReview].name}
                    <BadgeCheck className="w-4 h-4 text-[#C7A17A]" />
                  </div>
                  <span className="text-[#666666] text-xs uppercase tracking-widest">{reviews[currentReview].product}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-3 mt-12">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentReview(i)}
              className={`w-10 h-1 transition-all duration-300 ${i === currentReview ? 'bg-[#C7A17A]' : 'bg-[#EFEFEF] hover:bg-[#C7A17A]/50'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
