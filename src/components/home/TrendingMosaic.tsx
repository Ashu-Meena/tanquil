"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Collection {
  id: string | number;
  title: string;
  slug: string;
  image: string;
  className: string;
}

export default function TrendingMosaic({ collections }: { collections: Collection[] }) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#111111] mb-4"
            >
              Trending Edits
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif italic text-xl text-[#666666]"
            >
              Curated collections for your lifestyle
            </motion.p>
          </div>
          <Link href="/collections/all" className="uppercase tracking-widest text-xs font-medium text-[#111111] hover:text-[#C7A17A] flex items-center gap-2 transition-colors border-b border-[#111111] hover:border-[#C7A17A] pb-1">
            View All Edits <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pinterest Inspired Asymmetrical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {collections.map((col, index) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              aria-label={`Shop ${col.title}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`relative overflow-hidden group cursor-pointer bg-[#FAF8F5] ${col.className}`}
              >
                <Image 
                  src={col.image} 
                  alt={col.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                {/* Floating Glass Label */}
                <div className="absolute inset-x-6 bottom-6 flex justify-between items-end">
                  <div className="bg-white/20 backdrop-blur-md px-6 py-4 border border-white/30 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <h3 className="font-serif text-2xl text-white mb-1">{col.title}</h3>
                    <span className="text-white/90 text-[10px] uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex items-center gap-2">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
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
