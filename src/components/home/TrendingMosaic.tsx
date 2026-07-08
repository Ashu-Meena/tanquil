"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

interface Collection {
  id: string | number;
  title: string;
  slug: string;
  image: string;
}

export default function TrendingMosaic({ collections }: { collections: Collection[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-24 bg-[#FAF8F5]">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#111111] mb-6 leading-tight"
            >
              The Editorial <span className="italic text-[#C7A17A]">Edits</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#666666] leading-relaxed max-w-lg"
            >
              Discover our most coveted pieces, curated into distinctive aesthetics to elevate your everyday wardrobe.
            </motion.p>
          </div>
          <Link href="/collections/all" className="group flex items-center justify-center w-32 h-32 rounded-full border border-[#EFEFEF] bg-white hover:bg-[#111111] hover:border-[#111111] transition-all duration-500 flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest font-medium text-[#111111] group-hover:text-white transition-colors text-center leading-relaxed">
              View All <br/> Collections
            </span>
          </Link>
        </div>

        {/* Hover Accordion Layout */}
        <div className="flex flex-col md:flex-row h-[700px] md:h-[500px] lg:h-[600px] gap-2 md:gap-4 w-full">
          {collections.map((col, index) => {
            const isHovered = hoveredIndex === index;
            const isNotHovered = hoveredIndex !== null && !isHovered;
            
            return (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative overflow-hidden rounded-sm group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] flex-1 min-h-[100px] md:min-w-[80px]"
                style={{
                  flex: hoveredIndex === null ? 1 : isHovered ? 4 : 0.5,
                }}
                aria-label={`Shop ${col.title}`}
              >
                <div className="w-full h-full relative">
                  <Image 
                    src={col.image} 
                    alt={col.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)]" 
                  />
                  
                  {/* Elegant Overlay */}
                  <div className={`absolute inset-0 transition-colors duration-700 ${isNotHovered ? 'bg-black/60' : 'bg-black/20 group-hover:bg-black/40'}`} />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700 ${isNotHovered ? 'opacity-40' : 'opacity-80'}`} />
                  
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 flex items-end justify-between h-full">
                    <div className={`transform transition-all duration-700 ease-out flex flex-col justify-end h-full ${isHovered ? 'translate-y-0' : 'translate-y-2 md:translate-y-4'}`}>
                      <span className={`text-[#C7A17A] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 block transition-all duration-700 ${isNotHovered ? 'opacity-50' : 'opacity-100'}`}>
                        Collection {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className={`font-serif text-2xl md:text-4xl lg:text-5xl text-white font-light tracking-wide mb-2 md:mb-4 transition-all duration-700 ${isNotHovered ? 'opacity-0 md:opacity-100 md:-rotate-90 md:origin-bottom-left md:translate-x-4 md:-translate-y-4 md:text-2xl whitespace-nowrap' : 'opacity-100 md:rotate-0 md:origin-bottom-left md:translate-x-0 md:translate-y-0'}`}>
                        {col.title}
                      </h3>
                      
                      <div className={`overflow-hidden transition-all duration-700 ease-out ${isHovered ? 'max-h-[50px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                         <span className="inline-flex items-center gap-2 text-white uppercase tracking-widest text-[10px] md:text-xs font-medium hover:text-[#C7A17A] transition-colors">
                           Explore Edit <ArrowUpRight className="w-4 h-4" />
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
