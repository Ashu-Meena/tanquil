"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";

const defaultReviews = [
  {
    id: 1,
    name: "Aanya S.",
    image: "/images/avatar-1.jpg",
    text: "The quality of the satin slip dress is incredible. It feels like second skin and fits perfectly. Truly a luxury experience.",
    product: "Satin Slip Midi Dress"
  },
  {
    id: 2,
    name: "Meera K.",
    image: "/images/avatar-2.jpg",
    text: "Wore the draped halter gown for my engagement party and received endless compliments. The finishing is flawless.",
    product: "Draped Halter Gown"
  },
  {
    id: 3,
    name: "Riya M.",
    image: "/images/avatar-3.jpg",
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
  const displayReviews = initialReviews && initialReviews.length > 0 ? initialReviews : defaultReviews;

  return (
    <section className="py-16 md:py-24 bg-ivory overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-rich-black mb-4"
          >
            Tranquil Muses
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 font-serif italic text-lg md:text-xl"
          >
            Real reviews from our community
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {displayReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center p-8 bg-white/60 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border-light hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center items-center gap-1 mb-6 text-gold">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              
              <p className="text-rich-black font-serif text-lg leading-relaxed mb-8 italic flex-grow">
                &quot;{review.text}&quot;
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 mt-auto">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 shadow-sm border border-white">
                  <Image src={review.image} alt={review.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1 text-rich-black font-medium tracking-widest text-xs uppercase mb-1">
                    {review.name}
                    <BadgeCheck className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span className="text-neutral-500 text-[10px] md:text-xs uppercase tracking-widest">{review.product}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
