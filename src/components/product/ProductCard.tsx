"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";

interface CardProduct {
  id: string | number;
  slug?: string;
  name: string;
  price: number;
  images: string[];
  isNew?: boolean;
  isSale?: boolean;
}

export default function ProductCard({ product }: { product: CardProduct }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { hasItem: isWishlisted, toggleItem: toggleWishlist } = useWishlistStore();

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(String(product.id));
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/products/${product.slug || product.id}`;
  };

  return (
    <div 
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-[#FAF8F5] mb-4">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {product.isNew && <span className="bg-white text-[#111111] text-[10px] uppercase tracking-widest px-2 py-1">New In</span>}
          {product.isSale && <span className="bg-[#E63946] text-white text-[10px] uppercase tracking-widest px-2 py-1">Sale</span>}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          title={isWishlisted(String(product.id)) ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`absolute top-3 right-3 z-20 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-100 duration-300 transform translate-y-0 ${isWishlisted(String(product.id)) ? 'bg-[#E63946] text-white' : 'bg-white/80 text-[#111111] hover:text-[#E63946] hover:bg-white'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted(String(product.id)) ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={handleQuickView}
          title="Quick View"
          className="hidden md:flex absolute top-14 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center text-[#111111] hover:text-[#C7A17A] hover:bg-white transition-colors opacity-0 group-hover:opacity-100 duration-300 delay-75 transform translate-y-[-10px] group-hover:translate-y-0"
        >
          <Eye className="w-4 h-4" />
        </button>

        <Link href={`/products/${product.slug || product.id}`} className="block w-full h-full">
          {product.images[1] && (
            <Image 
              src={product.images[1]}
              alt={`${product.name} Alternate`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered ? 'opacity-100' : 'opacity-0'} z-10`}
            />
          )}
          <Image 
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered && product.images[1] ? 'opacity-0' : 'opacity-100'}`}
          />
        </Link>

        {/* Hover Actions Panel (Desktop Only) */}
        <div className="hidden md:block absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 bg-gradient-to-t from-black/50 to-transparent">
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-sm shadow-xl">
            <button
              onClick={handleQuickView}
              className="w-full bg-[#111111] hover:bg-[#C7A17A] text-white py-3 text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2"
            >
              Select Options
            </button>
          </div>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col text-left mt-4 px-1">
        <Link href={`/products/${product.slug || product.id}`} className="group/link block">
          <h3 className="font-serif text-[15px] md:text-[17px] text-[#111111] group-hover/link:text-[#C7A17A] transition-colors leading-snug tracking-wide line-clamp-1 mb-1.5">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="font-sans text-[13px] md:text-[14px] font-medium tracking-wider text-[#111111]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.isSale && (
            <span className="font-sans text-[11px] md:text-[12px] text-[#999999] line-through tracking-wider">
              ₹{(product.price * 1.2).toLocaleString('en-IN')}
            </span>
          )}
        </div>
        
        {/* Quick View/Add Button */}
        <Link 
          href={`/products/${product.slug || product.id}`}
          className="mt-3 w-full bg-[#FAF8F5] text-[#111111] py-2 text-xs uppercase tracking-widest font-medium border border-[#EFEFEF] hover:bg-[#111111] hover:text-white transition-colors block text-center md:hidden"
        >
          Select Options
        </Link>
      </div>
    </div>
  );
}
