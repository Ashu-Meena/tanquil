"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "../ui/MagneticButton";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=2000",
    title: "Luxury Crafted For Every Occasion",
    subtitle: "Designed to make you unforgettable.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2000",
    title: "Elegance In Every Detail",
    subtitle: "Explore our latest editorial curations.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=2000",
    title: "Statement Pieces That Inspire",
    subtitle: "Embrace the art of standing out.",
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[100dvh] lg:h-[100vh] overflow-hidden bg-[#111111]">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {/* Ken Burns effect via scale animation */}
          <motion.div
            className="w-full h-full relative"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
          >
            <Image
              src={slides[currentSlide].image}
              alt="Luxury Fashion"
              fill
              className="object-cover object-center opacity-70"
              priority
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl px-4"
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-4 lg:mb-6 leading-tight tracking-wide">
              {slides[currentSlide].title}
            </h1>
            <p className="font-serif italic text-lg md:text-2xl text-white/90 mb-8 lg:mb-10">
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
        >
          <MagneticButton>
            <Link
              href="/collections/new"
              className="bg-white text-[#111111] px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-[#C7A17A] hover:text-white transition-colors duration-300 w-full sm:w-auto text-center inline-block"
            >
              Shop New Arrivals
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link
              href="/collections/all"
              className="bg-transparent border border-white text-white px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-white hover:text-[#111111] transition-colors duration-300 w-full sm:w-auto text-center inline-block"
            >
              Explore Collections
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-12 h-1 transition-all duration-300 ${i === currentSlide ? 'bg-[#C7A17A]' : 'bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  );
}
