"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  sizes?: string[];
}

export default function ProductCard({ product }: { product: CardProduct }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [activeStep, setActiveStep] = useState<'none' | 'color' | 'size'>('none');
  const [selectedColor, setSelectedColor] = useState<{name: string, image?: string} | null>(null);
  
  const { hasItem: isWishlisted, toggleItem: toggleWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const defaultSizes = ["XS", "S", "M", "L", "XL", "FS"];
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;
  const images = product.images || [];

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(String(product.id));
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.slug || product.id}`);
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
    let imageToAdd = images[0] || "";

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
      <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-ivory mb-4">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {product.isNew && <span className="bg-white text-rich-black text-[10px] uppercase tracking-widest px-2 py-1">New In</span>}
          {product.isSale && <span className="bg-sale text-white text-[10px] uppercase tracking-widest px-2 py-1">Sale</span>}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          title={isWishlisted(String(product.id)) ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-100 duration-300 transform translate-y-0 ${isWishlisted(String(product.id)) ? 'bg-sale text-white' : 'bg-white/80 text-rich-black hover:text-sale hover:bg-white'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted(String(product.id)) ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button (Desktop Only) */}
        <button
          onClick={handleQuickView}
          title="Quick View"
          className="hidden md:flex absolute top-16 right-3 z-20 min-w-[44px] min-h-[44px] bg-white/80 backdrop-blur-sm rounded-full items-center justify-center text-rich-black hover:text-gold hover:bg-white transition-colors opacity-0 group-hover:opacity-100 duration-300 delay-75 transform translate-y-[-10px] group-hover:translate-y-0"
        >
          <Eye className="w-4 h-4" />
        </button>

        <Link href={`/products/${product.slug || product.id}`} className="block w-full h-full">
          {images[1] && (
            <Image 
              src={images[1]}
              alt={`${product.name} Alternate`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered ? 'opacity-100' : 'opacity-0'} z-10`}
            />
          )}
          {images[0] ? (
            <Image 
              src={images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered && images[1] ? 'opacity-0' : 'opacity-100'}`}
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs text-center">No Image</div>
          )}
        </Link>

        {/* Hover Actions Panel (Desktop Only) */}
        <div className="hidden md:block absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20 bg-gradient-to-t from-black/50 to-transparent">
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-sm shadow-xl">
            {activeStep === 'color' ? (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-center uppercase tracking-widest text-neutral-500">Select Color</span>
                <div className="flex justify-center gap-1 flex-wrap" role="radiogroup" aria-label="Select Color">
                  {product.colors?.map((color) => {
                    const baseColorName = color.name.split("||")[0];
                    return (
                      <button
                        key={color.name}
                        role="radio"
                        aria-checked={selectedColor?.name === color.name}
                        onClick={(e) => handleColorSelect(e, color)}
                        className={`min-w-[44px] px-2 h-11 flex items-center justify-center border text-[10px] transition-colors overflow-hidden whitespace-nowrap ${selectedColor?.name === color.name ? 'border-rich-black bg-rich-black text-white' : 'border-border-light hover:border-rich-black hover:bg-rich-black hover:text-white'}`}
                        title={baseColorName}
                      >
                        {baseColorName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeStep === 'size' ? (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-center uppercase tracking-widest text-neutral-500">Select Size</span>
                <div className="flex justify-center gap-1">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      aria-label={`Select size ${size} and add to cart`}
                      onClick={(e) => handleAddToCartWithSize(e, size)}
                      className="w-11 h-11 flex items-center justify-center border border-border-light text-xs hover:border-rich-black hover:bg-rich-black hover:text-white transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={startQuickAdd}
                className="w-full bg-rich-black hover:bg-gold text-white py-3 text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2"
              >
                Quick Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col text-left mt-3 md:mt-4 px-1">
        <Link href={`/products/${product.slug || product.id}`} className="group-hover:text-gold transition-colors">
          <h3 className="font-serif text-sm md:text-base leading-snug line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm md:text-base whitespace-nowrap mt-[2px]" style={{ fontFamily: 'var(--font-montserrat)' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {product.isSale && (
            <span className="font-sans text-[11px] md:text-[12px] text-neutral-400 line-through tracking-wider mt-[2px]">
              ₹{(product.price * 1.2).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
        
        {/* Quick View/Add Button */}
        {activeStep === 'color' ? (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <span className="text-[10px] text-center uppercase tracking-widest text-neutral-500">Select Color</span>
            <div className="flex justify-center gap-2 flex-wrap" role="radiogroup" aria-label="Select Color">
              {product.colors?.map((color) => {
                const baseColorName = color.name.split("||")[0];
                return (
                  <button
                    key={color.name}
                    role="radio"
                    aria-checked={selectedColor?.name === color.name}
                    onClick={(e) => handleColorSelect(e, color)}
                    className={`min-w-[44px] px-2 h-11 flex items-center justify-center border text-[10px] transition-colors whitespace-nowrap ${selectedColor?.name === color.name ? 'border-rich-black bg-rich-black text-white' : 'border-border-light bg-ivory hover:border-rich-black hover:bg-rich-black hover:text-white'}`}
                  >
                    {baseColorName}
                  </button>
                );
              })}
            </div>
          </div>
        ) : activeStep === 'size' ? (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <span className="text-[10px] text-center uppercase tracking-widest text-neutral-500">Select Size</span>
            <div className="flex justify-center gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  aria-label={`Select size ${size} and add to cart`}
                  onClick={(e) => handleAddToCartWithSize(e, size)}
                  className="w-11 h-11 flex items-center justify-center border border-border-light bg-ivory text-xs hover:border-rich-black hover:bg-rich-black hover:text-white transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button 
            onClick={startQuickAdd}
            className="mt-3 w-full bg-ivory text-rich-black py-2 text-xs uppercase tracking-widest font-medium border border-border-light hover:bg-rich-black hover:text-white transition-colors block text-center md:hidden"
          >
            Quick Add to Cart
          </button>
        )}
    </div>
  );
}
