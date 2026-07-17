"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Category {
  id: string | number;
  title: string;
  image: string;
  link: string;
}

export default function ShopByCategory({ categories }: { categories: Category[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-10 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl text-rich-black mb-2"
          >
            Shop By Category
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 font-serif italic text-lg"
          >
            Find your perfect piece
          </motion.p>
        </div>

        {/* Circular Avatars Layout */}
        <div className="flex overflow-x-auto justify-start md:justify-center gap-6 md:gap-10 pb-8 pt-4 px-2 no-scrollbar">
          {categories.map((category, index) => {
            const isHovered = hoveredIndex === index;
            const isNotHovered = hoveredIndex !== null && !isHovered;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
                className="flex-shrink-0"
              >
                <Link
                  href={category.link}
                  className="group flex flex-col items-center gap-4"
                  aria-label={`Shop ${category.title}`}
                  onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                  onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                >
                  {/* Fixed Height Container to prevent text jumping */}
                  <div className="flex items-center justify-center h-[140px] md:h-[200px]">
                    {/* Circular Image Container with dynamic sizing */}
                    <div 
                      className={`relative rounded-full overflow-hidden border border-gray-100 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isMobile 
                          ? "w-[110px] h-[110px]"
                          : hoveredIndex === null 
                            ? "w-[110px] h-[110px] md:w-[150px] md:h-[150px]" 
                            : isHovered 
                              ? "w-[140px] h-[140px] md:w-[200px] md:h-[200px] -translate-y-2 shadow-lg"
                              : "w-[90px] h-[90px] md:w-[120px] md:h-[120px] opacity-60 grayscale-[30%]"
                      }`}
                    >
                      <Image 
                        src={category.image || "/images/placeholder-portrait.jpg"} 
                        alt={category.title} 
                        fill 
                        sizes="(max-width: 768px) 140px, 200px"
                        className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] md:group-hover:scale-110"
                      />
                      {/* Subtle Dark Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                  </div>
                  
                  {/* Text Label */}
                  <span className={`uppercase tracking-[0.15em] text-[10px] md:text-xs font-semibold text-center max-w-[120px] transition-colors duration-700 ${!isMobile && isNotHovered ? 'text-gray-400' : 'text-rich-black'}`}>
                    {category.title}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
