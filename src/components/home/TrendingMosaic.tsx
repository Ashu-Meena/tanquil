"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Collection {
  id: string | number;
  title: string;
  slug: string;
  image: string;
}

const getBentoClass = (index: number, total: number) => {
  if (total === 4) {
    if (index === 0) return "col-span-2 md:col-span-2 row-span-2 aspect-[4/5] md:aspect-auto min-h-[300px] md:min-h-[400px]";
    if (index === 1) return "col-span-2 md:col-span-2 row-span-1 aspect-square md:aspect-[16/9]";
    if (index === 2) return "col-span-1 md:col-span-1 row-span-1 aspect-[4/5] md:aspect-square";
    if (index === 3) return "col-span-1 md:col-span-1 row-span-1 aspect-[4/5] md:aspect-square";
  }
  return "col-span-1 md:col-span-1 row-span-1 aspect-[4/5] md:aspect-[3/4]";
};

export default function TrendingMosaic({ collections }: { collections: Collection[] }) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-24 bg-[#FAF8F5]">
      <div className="container mx-auto px-6 lg:px-12">
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

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense gap-3 md:gap-6">
          {collections.map((col, index) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className={`relative overflow-hidden group rounded-sm bg-[#EFEFEF] ${getBentoClass(index, collections.length)}`}
              aria-label={`Shop ${col.title}`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                className="w-full h-full relative"
              >
                <Image 
                  src={col.image} 
                  alt={col.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]" 
                />
                
                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-8 flex items-end justify-between">
                  <div className="transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="text-[#C7A17A] text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-3 block md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 md:delay-100">
                      Collection {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-xl md:text-4xl text-white font-light tracking-wide">{col.title}</h3>
                  </div>
                  
                  {/* Floating Action Button */}
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-100 group-hover:bg-white group-hover:text-[#111111] text-white">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
