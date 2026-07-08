"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "../ui/MagneticButton";

interface Slide {
  id: string | number;
  image_url: string;
  title: string;
  subtitle: string;
}

export default function HeroSection({ slides }: { slides: Slide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <section ref={containerRef} className="relative w-full h-[100dvh] lg:h-[100vh] overflow-hidden bg-[#111111]">
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
            style={{ y }}
          >
            <Image
              src={slides[currentSlide].image_url}
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
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white mb-4 lg:mb-6 leading-tight tracking-wide">
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
              className="bg-white text-[#111111] px-12 py-5 uppercase tracking-widest text-sm font-bold hover:bg-[#C7A17A] hover:text-[#111111] transition-colors duration-300 w-full sm:w-auto text-center inline-block shadow-xl"
            >
              Shop New Arrivals
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

      {/* Scroll Indicator */}
      <div className="hidden md:flex absolute bottom-8 right-8 z-20 flex-col items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest text-white/70 transform rotate-90 translate-y-6">Scroll</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/70 to-transparent mt-8"
        />
      </div>
    </section>
  );
}
