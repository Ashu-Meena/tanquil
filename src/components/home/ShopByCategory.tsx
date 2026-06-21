"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { id: 1, title: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000", link: "/collections/dresses" },
  { id: 2, title: "Corsets", image: "https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=1000", link: "/collections/corsets" },
  { id: 3, title: "Co-Ords", image: "https://images.unsplash.com/photo-1515347619362-e610058bdaee?q=80&w=1000", link: "/collections/coord" },
  { id: 4, title: "Accessories", image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1000", link: "/collections/accessories" },
];

export default function ShopByCategory() {
  return (
    <section className="py-24 bg-[#FAF8F5]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#111111] mb-4"
          >
            Shop By Category
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif italic text-xl text-[#666666]"
          >
            Find your perfect piece
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative aspect-square md:aspect-[3/4] overflow-hidden group"
            >
              <Link href={category.link} className="absolute inset-0 z-20" aria-label={`Shop ${category.title}`} />
              <Image 
                src={category.image} 
                alt={category.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
                <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-white tracking-wider uppercase group-hover:scale-110 transition-transform duration-700">
                  {category.title}
                </h3>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="bg-white text-[#111111] px-6 py-2 uppercase tracking-widest text-[10px] font-medium whitespace-nowrap">
                  Explore
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
