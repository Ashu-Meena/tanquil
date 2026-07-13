"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const defaultStories = [
  {
    id: 1,
    title: "Summer In Italy",
    description: "Embrace la dolce vita with our curated collection of breezy linens, floral midis, and sunset-ready silhouettes. Designed for wandering cobblestone streets and sipping spritzes by the coast.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200",
    align: "left"
  },
  {
    id: 2,
    title: "Vintage Core",
    description: "A nod to the glamorous eras of the past. Think delicate lace, structured corsets, and timeless draping that brings old-Hollywood elegance to the modern wardrobe.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200",
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

const StoryCard = ({ story }: { story: Story }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  
  return (
    <div 
      ref={containerRef}
      className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 lg:gap-24 ${story.align === 'right' ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Image Block */}
      <motion.div 
        initial={{ opacity: 0, x: story.align === 'left' ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full md:w-1/2 lg:w-3/5"
      >
        <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden group">
          <motion.div style={{ y: y1 }} className="absolute inset-[-15%] w-[130%] h-[130%]">
            <Image 
              src={story.image} 
              alt={story.title} 
              fill 
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Text Block */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center"
      >
        <span className="text-gold text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium mb-2 md:mb-6 block">Editorial</span>
        <h3 className="font-serif text-3xl md:text-3xl lg:text-5xl text-rich-black mb-2 md:mb-6 leading-tight">
          {story.title}
        </h3>
        <p className="text-neutral-500 leading-relaxed mb-6 md:mb-10 text-sm md:text-lg">
          {story.description}
        </p>
        <Link 
          href="/collections/editorial" 
          className="inline-flex items-center gap-1.5 md:gap-3 text-rich-black uppercase tracking-wider md:tracking-widest text-[8px] md:text-sm font-medium hover:text-gold transition-colors group self-start"
        >
          Read The Story 
          <ArrowRight className="w-3 h-3 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
};

export default function FashionStories({ stories: initialStories }: { stories?: Story[] }) {
  const displayStories = initialStories && initialStories.length > 0 ? initialStories : defaultStories;

  return (
    <section className="py-16 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-rich-black mb-4"
          >
            Fashion Stories
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif italic text-xl text-neutral-500"
          >
            Editorial inspiration and curations
          </motion.p>
        </div>

        <div className="space-y-16 md:space-y-32">
          {displayStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}
