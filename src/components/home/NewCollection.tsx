"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../product/ProductCard";

const initialProducts = [
  {
    id: 101,
    name: "Pleated Chiffon Midi",
    price: 4299,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600"
    ],
    isNew: true
  },
  {
    id: 102,
    name: "Embroidered Mesh Top",
    price: 2499,
    images: [
      "https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=600",
      "https://images.unsplash.com/photo-1588117305388-c2631a279f82?q=80&w=600"
    ]
  },
  {
    id: 103,
    name: "Satin Draped Gown",
    price: 8999,
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600"
    ],
    isNew: true
  },
  {
    id: 104,
    name: "Ruched Silk Skirt",
    price: 3299,
    images: [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600"
    ]
  }
];

export default function NewCollection() {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  const loadMore = () => {
    setLoading(true);
    // Simulate infinite loading
    setTimeout(() => {
      setProducts([...products, ...initialProducts.map(p => ({ ...p, id: p.id + Math.random() }))]);
      setLoading(false);
    }, 1500);
  };

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
            New Arrivals
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif italic text-xl text-[#666666]"
          >
            Fresh off the editorial floor
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <button 
            onClick={loadMore}
            disabled={loading}
            className="border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white px-12 py-4 uppercase tracking-widest text-sm font-medium transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      </div>
    </section>
  );
}
