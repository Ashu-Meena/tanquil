"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800", link: "/collections/dresses" },
  { name: "Co-ord Sets", image: "https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=800", link: "/collections/coord-sets" },
  { name: "Party Wear", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800", link: "/collections/party-wear" },
  { name: "Vacation Wear", image: "https://images.unsplash.com/photo-1515347619362-e610058bdaee?q=80&w=800", link: "/collections/vacation" },
  { name: "Mini Dresses", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800", link: "/collections/mini-dresses" },
  { name: "Gowns", image: "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800", link: "/collections/gowns" }
];

export default function FeaturedCategories() {
  return (
    <section className="py-24 bg-[#FAF8F5]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl lg:text-5xl text-[#111111] mb-4"
          >
            Shop By Category
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#666666] uppercase tracking-widest text-sm"
          >
            Curated pieces for every occasion
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
          {categories.map((category, index) => (
            <Link href={category.link} key={index}>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative aspect-[3/4] group overflow-hidden cursor-pointer bg-white"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
                  <h3 className="text-white font-serif text-2xl lg:text-3xl tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {category.name}
                  </h3>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <span className="text-white text-sm uppercase tracking-widest border-b border-[#C7A17A] pb-1">
                      Explore
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
