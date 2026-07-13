"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

interface CardProduct {
  id: string | number;
  slug?: string;
  name: string;
  price: number;
  images: string[];
  isNew?: boolean;
  isSale?: boolean;
  colors?: { name: string; image?: string }[];
}

export default function ProductCard({ product }: { product: CardProduct }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeStep, setActiveStep] = useState<'none' | 'color' | 'size'>('none');
  const [selectedColor, setSelectedColor] = useState<{name: string, image?: string} | null>(null);
  
  const { hasItem: isWishlisted, toggleItem: toggleWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const sizes = ["XS", "S", "M", "L", "XL"];

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

  const startQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.colors && product.colors.length > 0) {
      setActiveStep('color');
    } else {
      setActiveStep('size');
    }
  };

  const handleColorSelect = (e: React.MouseEvent, color: {name: string, image?: string}) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
    setActiveStep('size');
  };

  const handleAddToCartWithSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Determine the color to add
    let colorToAdd = "Default";
    let imageToAdd = product.images[0] || "";

    if (product.colors && product.colors.length > 1 && selectedColor) {
      colorToAdd = selectedColor.name;
      imageToAdd = selectedColor.image || imageToAdd;
    } else if (product.colors && product.colors.length === 1) {
      colorToAdd = product.colors[0].name;
      imageToAdd = product.colors[0].image || imageToAdd;
    }

    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: imageToAdd,
      color: colorToAdd,
      size: size,
      quantity: 1,
    });
    setActiveStep('none');
    setSelectedColor(null);
    openCart();
  };

  return (
    <div 
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveStep('none');
        setSelectedColor(null);
      }}
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

        {/* Quick View Button (Desktop Only) */}
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
        <div className="hidden md:block absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20 bg-gradient-to-t from-black/50 to-transparent">
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-sm shadow-xl">
            {activeStep === 'color' ? (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-center uppercase tracking-widest text-[#666666]">Select Color</span>
                <div className="flex justify-center gap-1 flex-wrap">
                  {product.colors?.map((color) => (
                    <button
                      key={color.name}
                      onClick={(e) => handleColorSelect(e, color)}
                      className="w-16 h-8 flex items-center justify-center border border-[#EFEFEF] text-[10px] hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-colors overflow-hidden whitespace-nowrap px-1"
                      title={color.name}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeStep === 'size' ? (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-center uppercase tracking-widest text-[#666666]">Select Size</span>
                <div className="flex justify-center gap-1">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => handleAddToCartWithSize(e, size)}
                      className="w-8 h-8 flex items-center justify-center border border-[#EFEFEF] text-xs hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={startQuickAdd}
                className="w-full bg-[#111111] hover:bg-[#C7A17A] text-white py-3 text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2"
              >
                Quick Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col text-left mt-3 md:mt-4 px-1">
        <Link href={`/products/${product.slug || product.id}`} className="group-hover:text-[#C7A17A] transition-colors">
          <h3 className="font-serif text-sm md:text-base leading-snug line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm md:text-base whitespace-nowrap mt-[2px]" style={{ fontFamily: 'var(--font-montserrat)' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {product.isSale && (
            <span className="font-sans text-[11px] md:text-[12px] text-[#999999] line-through tracking-wider mt-[2px]">
              ₹{(product.price * 1.2).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
        
        {/* Quick View/Add Button */}
        {activeStep === 'color' ? (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <span className="text-[10px] text-center uppercase tracking-widest text-[#666666]">Select Color</span>
            <div className="flex justify-center gap-2 flex-wrap">
              {product.colors?.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => handleColorSelect(e, color)}
                  className="px-2 h-10 flex items-center justify-center border border-[#EFEFEF] bg-[#FAF8F5] text-[10px] hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-colors whitespace-nowrap"
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        ) : activeStep === 'size' ? (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <span className="text-[10px] text-center uppercase tracking-widest text-[#666666]">Select Size</span>
            <div className="flex justify-center gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleAddToCartWithSize(e, size)}
                  className="w-10 h-10 flex items-center justify-center border border-[#EFEFEF] bg-[#FAF8F5] text-xs hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button 
            onClick={startQuickAdd}
            className="mt-3 w-full bg-[#FAF8F5] text-[#111111] py-2 text-xs uppercase tracking-widest font-medium border border-[#EFEFEF] hover:bg-[#111111] hover:text-white transition-colors block text-center md:hidden"
          >
            Quick Add to Cart
          </button>
        )}
    </div>
  );
}
