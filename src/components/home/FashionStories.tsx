"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";

const defaultStories = [
  {
    id: 1,
    title: "Summer In Italy",
    description: "Embrace la dolce vita with our curated collection of breezy linens, floral midis, and sunset-ready silhouettes. Designed for wandering cobblestone streets and sipping spritzes by the coast.",
    image: "/images/fashion-1.jpg",
    align: "left"
  },
  {
    id: 2,
    title: "Vintage Core",
    description: "A nod to the glamorous eras of the past. Think delicate lace, structured corsets, and timeless draping that brings old-Hollywood elegance to the modern wardrobe.",
    image: "/images/fashion-2.jpg",
    align: "right"
  }
];

interface Story {
  id: string | number;
  title: string;
  description: string;
  image: string;
  align: string;
}

const StoryCard = ({ story, index }: { story: Story, index: number }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const isMobile = useIsMobile();
  
  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col md:flex-row items-center gap-10 lg:gap-20 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Editorial Number */}
      <div className={`absolute top-0 ${index % 2 !== 0 ? 'right-0' : 'left-0'} text-[80px] lg:text-[140px] font-serif font-light text-white/5 select-none leading-none z-0`}>
        0{index + 1}
      </div>

      {/* Image Block */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
        className="w-full md:w-1/2 relative z-10 flex justify-center"
      >
        <div className="relative w-full max-w-[380px] aspect-[4/5] overflow-hidden rounded-t-[10rem] lg:rounded-t-[14rem] rounded-b-2xl group">
          <motion.div style={{ y: isMobile ? 0 : y1 }} className="absolute inset-[-15%] w-[130%] h-[130%]">
            <Image 
              src={story.image} 
              alt={story.title} 
              fill 
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)] filter brightness-95 group-hover:brightness-100"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Text Block */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
        className="w-full md:w-1/2 flex flex-col justify-center z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-[1px] bg-gold"></span>
          <span className="text-gold text-[10px] uppercase tracking-[0.2em] font-medium">Editorial</span>
        </div>
        <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 leading-snug">
          {story.title}
        </h3>
        <p className="text-neutral-400 leading-relaxed mb-8 text-sm md:text-base max-w-md font-light">
          {story.description}
        </p>
        <Link 
          href="/collections/editorial" 
          className="inline-flex items-center gap-3 text-white uppercase tracking-[0.15em] text-[10px] font-medium hover:text-gold transition-colors group self-start pb-1.5 border-b border-white/20 hover:border-gold"
        >
          Read The Story 
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform duration-500" />
        </Link>
      </motion.div>
    </div>
  );
};

export default function FashionStories({ stories: initialStories }: { stories?: Story[] }) {
  const displayStories = initialStories && initialStories.length > 0 ? initialStories : defaultStories;

  return (
    <section className="py-20 md:py-32 bg-rich-black overflow-hidden relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-24 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4"
          >
            The Editorials
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-serif italic text-lg lg:text-xl text-neutral-400 max-w-xl mx-auto"
          >
            Curated narratives and seasonal inspirations from our design house.
          </motion.p>
        </div>

        <div className="space-y-20 md:space-y-32">
          {displayStories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
