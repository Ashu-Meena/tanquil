"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Heart, Truck, ShieldCheck, RefreshCw, Share2, MessageCircle } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import SizeGuideModal from "@/components/product/SizeGuideModal";
import DOMPurify from "isomorphic-dompurify";
import ProductReviews from "./ProductReviews";

interface Color {
  name: string;
  hex: string;
}

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  colorImages?: Record<string, string[]>;
  colors: Color[];
  sizes: string[];
  variants?: { color_name: string; size: string; stock_quantity: number }[];
  details: string[];
  brand?: string;
  tags?: string[];
  fabric?: string;
  compare_at_price?: number;
}

interface ProductClientProps {
  product: ProductDetails;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedProducts: any[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : { name: "Default", hex: "#000000" });

  const activeImages = useMemo(() => {
    if (product.colorImages && product.colorImages[selectedColor.name] && product.colorImages[selectedColor.name].length > 0) {
      return product.colorImages[selectedColor.name];
    }
    return product.images;
  }, [selectedColor.name, product.colorImages, product.images]);

  const [selectedImage, setSelectedImage] = useState(activeImages[0] || product.images[0]);
  const [prevActiveImages, setPrevActiveImages] = useState(activeImages);

  if (activeImages !== prevActiveImages) {
    setPrevActiveImages(activeImages);
    setSelectedImage(activeImages[0] || product.images[0]);
  }
  
  const availableSizesForColor = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      const fallback = product.sizes && product.sizes.length > 0 ? [...product.sizes] : ["XS", "S", "M", "L", "XL", "XXL", "3XL", "FS"];
      return fallback;
    }
    
    const sizes = product.variants
      .filter(v => v.color_name === selectedColor.name)
      .map(v => v.size);
      
    // Sort sizes logically if possible, or just return as is
    return sizes;
  }, [product.variants, product.sizes, selectedColor.name]);

  const [selectedSize, setSelectedSize] = useState(availableSizesForColor[0] || "");
  const [prevAvailableSizes, setPrevAvailableSizes] = useState(availableSizesForColor);

  if (availableSizesForColor !== prevAvailableSizes) {
    setPrevAvailableSizes(availableSizesForColor);
    if (availableSizesForColor.length > 0 && !availableSizesForColor.includes(selectedSize)) {
      setSelectedSize(availableSizesForColor[0]);
    }
  }

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
  };

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [customMeasurements, setCustomMeasurements] = useState({ bust: "", waist: "", hips: "", length: "" });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  
  const { addItem, openCart } = useCartStore();
  const { hasItem: isWishlisted, toggleItem: toggleWishlist } = useWishlistStore();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the main add to cart button is NOT intersecting (out of view)
        // Also check if we're not at the very top to avoid showing it immediately on load if it's below fold
        if (window.scrollY > 500) {
          setShowStickyBar(!entry.isIntersecting);
        } else {
          setShowStickyBar(false);
        }
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    
    if (addToCartRef.current) {
      observer.observe(addToCartRef.current);
    }
    
    const handleScroll = () => {
      if (window.scrollY < 500) setShowStickyBar(false);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Calculate out of stock status based on selected size and color
  const currentVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.find(
      (v) => v.color_name === selectedColor.name && v.size === selectedSize
    );
  }, [product.variants, selectedColor.name, selectedSize]);

  const isOutOfStock = (() => {
    if (selectedSize === "Custom") return false; // Custom sizes are made-to-order
    if (!product.variants || product.variants.length === 0) return false; // Fallback if no variants
    return currentVariant ? currentVariant.stock_quantity <= 0 : false;
  })();

  const isCustomValid = selectedSize !== "Custom" || 
    (customMeasurements.bust.trim() !== "" && 
     customMeasurements.waist.trim() !== "" && 
     customMeasurements.hips.trim() !== "" && 
     customMeasurements.length.trim() !== "");

  const maxQuantity = (() => {
    if (selectedSize === "Custom") return 99; // Arbitrary high number for custom
    if (!product.variants || product.variants.length === 0) return 99;
    return currentVariant ? currentVariant.stock_quantity : 0;
  })();

  const [prevMaxQuantity, setPrevMaxQuantity] = useState(maxQuantity);

  if (maxQuantity !== prevMaxQuantity) {
    setPrevMaxQuantity(maxQuantity);
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    } else if (quantity > maxQuantity && maxQuantity === 0) {
      setQuantity(1);
    }
  }

  const getFinalSizeString = () => {
    if (selectedSize === "Custom") {
      return `Custom (Bust: ${customMeasurements.bust || '-'}, Waist: ${customMeasurements.waist || '-'}, Hips: ${customMeasurements.hips || '-'}, Length: ${customMeasurements.length || '-'})`;
    }
    return selectedSize;
  };

  const handleAddToCart = () => {
    const nameParts = selectedColor.name.split("||");
    const baseColorName = nameParts[0] || selectedColor.name;
    const customProductTitle = nameParts.length > 1 ? nameParts[1] : product.name;

    addItem({
      id: product.id,
      name: customProductTitle,
      price: product.price,
      image: activeImages[0] || product.images[0],
      color: baseColorName,
      size: getFinalSizeString(),
      quantity,
    });
    openCart();
  };

  const handleBuyNow = () => {
    const nameParts = selectedColor.name.split("||");
    const baseColorName = nameParts[0] || selectedColor.name;
    const customProductTitle = nameParts.length > 1 ? nameParts[1] : product.name;

    addItem({
      id: product.id,
      name: customProductTitle,
      price: product.price,
      image: activeImages[0] || product.images[0],
      color: baseColorName,
      size: getFinalSizeString(),
      quantity,
    });
    router.push('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Tranquil!`,
          url,
        });
      } catch {
        // User cancelled share — no error needed
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <>
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      
      <div className="bg-white min-h-screen pt-36 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Breadcrumbs - Hidden on Mobile */}
          <div className="hidden md:flex text-[11px] uppercase tracking-widest text-neutral-500 mb-8 items-center gap-2">
            <Link href="/" className="hover:text-gold-text transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/collections/${product.category.toLowerCase()}`} className="hover:text-gold-text transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-rich-black">{selectedColor.name.includes("||") ? selectedColor.name.split("||")[1] : product.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20">
            {/* Mobile Swipeable Gallery (Edge-to-Edge) */}
            <div className="relative w-screen -mx-6 md:hidden">
              <div 
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                onScroll={(e) => {
                  const scrollLeft = (e.target as HTMLElement).scrollLeft;
                  const width = (e.target as HTMLElement).clientWidth;
                  const newIndex = Math.round(scrollLeft / width);
                  if (newIndex !== activeImages.indexOf(selectedImage)) {
                    setSelectedImage(activeImages[newIndex] || activeImages[0]);
                  }
                }}
              >
                {activeImages.map((img, i) => (
                  <div key={i} className="relative w-screen aspect-[4/5] flex-shrink-0 snap-center bg-ivory">
                    <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" priority={i === 0} />
                  </div>
                ))}
              </div>
              
              {/* Pagination Dots */}
              {activeImages.length > 1 && (
                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
                  {activeImages.map((img, i) => (
                    <div 
                      key={i} 
                      className={`h-1 transition-all duration-300 ${selectedImage === img ? 'w-4 bg-rich-black' : 'w-1.5 bg-black/30'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Gallery (Left) */}
            <div className="hidden md:flex w-full lg:w-[60%] flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-28 lg:h-[calc(100vh-120px)]">
              {/* Thumbnails */}
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 flex-shrink-0">
                {activeImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-28 md:w-full md:h-32 flex-shrink-0 border transition-all ${selectedImage === img ? 'border-rich-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
              
              {/* Main Image */}
              <div className="relative w-full aspect-[3/4] md:h-[calc(100vh-200px)] md:aspect-auto bg-ivory cursor-zoom-in group overflow-hidden">
                <Image 
                  src={selectedImage} 
                  alt={product.name} 
                  fill 
                  className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out origin-center" 
                  priority
                />
              </div>
            </div>

            {/* Product Info (Right) */}
            <div className="w-full lg:w-[40%] flex flex-col">
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <h1 className="font-serif text-2xl md:text-4xl text-rich-black leading-tight pr-4">
                  {selectedColor.name.includes("||") ? selectedColor.name.split("||")[1] : product.name}
                </h1>
                <button
                  onClick={handleShare}
                  title={shareCopied ? "Link Copied!" : "Share"}
                  className={`transition-colors p-1 md:p-2 flex-shrink-0 ${shareCopied ? 'text-success' : 'text-rich-black hover:text-gold-text'}`}
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <div className="text-lg md:text-xl font-medium text-rich-black mb-6 md:mb-8 flex items-center gap-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
                ₹{product.price.toLocaleString('en-IN')}
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-neutral-400 line-through text-lg">₹{product.compare_at_price.toLocaleString('en-IN')}</span>
                    <span className="bg-sale text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm">Sale</span>
                  </>
                )}
              </div>
              {shareCopied && (
                <p className="text-xs text-success mb-2 -mt-2">Link copied to clipboard!</p>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-4">
                    Color <span className="text-rich-black font-medium ml-2">{selectedColor.name.split("||")[0]}</span>
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map(color => (
                      <button 
                        key={color.name}
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${selectedColor.name === color.name ? 'border-rich-black p-[2px]' : 'border-transparent p-0'}`}
                        title={color.name.split("||")[0]}
                      >
                        {color.hex.includes(',') ? (
                          <span 
                            className="block w-full h-full rounded-full border border-black/10" 
                            style={{ background: `linear-gradient(135deg, ${color.hex.split(',')[0]} 50%, ${color.hex.split(',')[1]} 50%)` }}
                          />
                        ) : (
                          <span 
                            className="block w-full h-full rounded-full border border-black/10" 
                            style={{ backgroundColor: color.hex }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Size <span className="text-rich-black font-medium ml-2">{selectedSize}</span>
                  </p>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[10px] uppercase tracking-widest text-rich-black underline underline-offset-4 flex items-center gap-1 hover:text-gold-text transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2">
                  {availableSizesForColor.map(size => {
                    // Check stock for this specific size
                    let isSizeOutOfStock = false;
                    if (size !== "Custom" && product.variants && product.variants.length > 0) {
                      const v = product.variants.find((v) => v.color_name === selectedColor.name && v.size === size);
                      if (v && v.stock_quantity <= 0) isSizeOutOfStock = true;
                    }

                    return (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-[10px] uppercase tracking-widest border transition-colors relative ${
                          selectedSize === size 
                            ? 'border-rich-black bg-rich-black text-white' 
                            : isSizeOutOfStock 
                              ? 'border-border-light text-neutral-400 hover:border-[#CCCCCC]' 
                              : 'border-border-light hover:border-rich-black text-rich-black'
                        }`}
                      >
                        {size}
                        {isSizeOutOfStock && (
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                            <div className="w-[140%] h-[1px] bg-[#CCCCCC] transform -rotate-45 absolute"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedSize === "Custom" && (
                  <div className="mt-4 p-4 border border-border-light bg-ivory">
                    <p className="text-xs font-medium text-rich-black mb-4 uppercase tracking-widest">Enter Measurements (inches)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Bust</label>
                        <input type="number" value={customMeasurements.bust} onChange={e => setCustomMeasurements({...customMeasurements, bust: e.target.value})} className="w-full border border-border-light p-2 text-sm focus:outline-none focus:border-gold" placeholder="e.g. 34" />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Waist</label>
                        <input type="number" value={customMeasurements.waist} onChange={e => setCustomMeasurements({...customMeasurements, waist: e.target.value})} className="w-full border border-border-light p-2 text-sm focus:outline-none focus:border-gold" placeholder="e.g. 28" />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Hips</label>
                        <input type="number" value={customMeasurements.hips} onChange={e => setCustomMeasurements({...customMeasurements, hips: e.target.value})} className="w-full border border-border-light p-2 text-sm focus:outline-none focus:border-gold" placeholder="e.g. 38" />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Length</label>
                        <input type="number" value={customMeasurements.length} onChange={e => setCustomMeasurements({...customMeasurements, length: e.target.value})} className="w-full border border-border-light p-2 text-sm focus:outline-none focus:border-gold" placeholder="e.g. 42" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Quantity</p>
                <div className="flex items-center border border-border-light w-32 h-12">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="flex-1 hover:bg-ivory h-full transition-colors disabled:opacity-50"
                    disabled={isOutOfStock}
                  >-</button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} 
                    className="flex-1 hover:bg-ivory h-full transition-colors disabled:opacity-50"
                    disabled={isOutOfStock || quantity >= maxQuantity}
                  >+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mb-6 sticky bottom-[64px] z-[45] bg-white py-3 md:py-4 md:static md:p-0 border-t border-border-light md:border-none" ref={addToCartRef}>
                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !isCustomValid}
                  className={`w-full py-3 md:py-4 uppercase tracking-widest text-[11px] md:text-sm font-medium transition-colors ${
                    isOutOfStock 
                      ? 'bg-border-light text-neutral-400 cursor-not-allowed' 
                      : !isCustomValid
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-rich-black hover:bg-gold text-white'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : !isCustomValid ? 'Enter Measurements' : 'Add To Cart'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || !isCustomValid}
                    className={`flex-1 border py-3 md:py-4 uppercase tracking-widest text-[11px] md:text-sm font-medium transition-colors ${
                      isOutOfStock || !isCustomValid
                        ? 'border-border-light text-neutral-400 cursor-not-allowed' 
                        : 'border-rich-black text-rich-black hover:bg-rich-black hover:text-white'
                    }`}
                  >
                    Buy It Now
                  </button>
                  <button
                    onClick={handleWishlist}
                    title={isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    className={`w-12 md:w-14 border flex items-center justify-center transition-colors ${isWishlisted(product.id) ? 'border-sale bg-sale text-white' : 'border-border-light hover:border-sale text-rich-black hover:text-sale'}`}
                  >
                    <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full mt-2 flex items-center justify-center gap-2 text-success hover:text-rich-black py-2 text-[10px] uppercase tracking-widest transition-colors rounded-sm"
                >
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /> Need styling advice? WhatsApp Us
                </a>
              </div>

              {/* Trust Elements */}
              <div className="grid grid-cols-2 gap-4 border-t border-border-light py-6">
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <Truck className="w-5 h-5 text-rich-black" />
                  Free Shipping
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <RefreshCw className="w-5 h-5 text-rich-black" />
                  72-Hour Exchanges
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <ShieldCheck className="w-5 h-5 text-rich-black" />
                  Secure Checkout
                </div>
              </div>

              {/* Accordions */}
              <div className="border-t border-border-light mt-2">
                <div className="py-5 border-b border-border-light">
                  <button 
                    onClick={() => setActiveTab(activeTab === "desc" ? "" : "desc")}
                    aria-expanded={activeTab === "desc"}
                    className="w-full flex justify-between items-center text-left uppercase tracking-[0.2em] text-[10px] font-medium text-rich-black"
                  >
                    Description
                    <span className="text-lg font-light leading-none">{activeTab === "desc" ? "—" : "+"}</span>
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${activeTab === "desc" ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div 
                        className="text-neutral-500 leading-relaxed text-[13px] pb-2 whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                      />
                    </div>
                  </div>
                </div>
                <div className="py-5 border-b border-border-light">
                  <button 
                    onClick={() => setActiveTab(activeTab === "details" ? "" : "details")}
                    aria-expanded={activeTab === "details"}
                    className="w-full flex justify-between items-center text-left uppercase tracking-[0.2em] text-[10px] font-medium text-rich-black"
                  >
                    Details & Care
                    <span className="text-lg font-light leading-none">{activeTab === "details" ? "—" : "+"}</span>
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${activeTab === "details" ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <ul className="text-neutral-500 text-[13px] space-y-2 list-none pb-2">
                        {product.brand && <li><span className="font-medium text-rich-black">Brand:</span> {product.brand}</li>}
                        {product.fabric && <li><span className="font-medium text-rich-black">Fabric:</span> {product.fabric}</li>}
                        {product.tags && product.tags.length > 0 && <li><span className="font-medium text-rich-black">Tags:</span> {product.tags.join(', ')}</li>}
                        {!product.brand && !product.fabric && product.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      {/* Customer Reviews */}
      <div className="container mx-auto px-6 lg:px-12 mt-24">
        <div className="max-w-4xl mx-auto">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Complete The Look / Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
          <div className="container mx-auto px-6 lg:px-12 mt-32 border-t border-border-light pt-24">
            <h2 className="font-serif text-3xl lg:text-4xl text-rich-black mb-12 text-center">Complete The Look</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {relatedProducts.map((relProduct: any) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Mobile Sticky Add to Cart */}
      <div className={`md:hidden fixed bottom-[64px] left-0 w-full bg-white border-t border-border-light p-4 z-40 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-4 transition-transform duration-500 ${showStickyBar ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock || !isCustomValid}
          className={`flex-1 py-3 uppercase tracking-widest text-[10px] font-medium transition-colors ${isOutOfStock || !isCustomValid ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-rich-black text-white hover:bg-gold'}`}
        >
          {isOutOfStock ? 'Out of Stock' : !isCustomValid ? 'Enter Measurements' : 'Add To Cart'}
        </button>
        <button 
          onClick={handleBuyNow}
          disabled={isOutOfStock || !isCustomValid}
          className={`flex-1 border py-3 uppercase tracking-widest text-[10px] font-medium transition-colors ${isOutOfStock || !isCustomValid ? 'border-border-light text-neutral-400 cursor-not-allowed' : 'border-rich-black text-rich-black'}`}
        >
          Buy It Now
        </button>
      </div>
      {/* Desktop Sticky Add to Cart */}
      <div className={`hidden md:flex fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-border-light p-4 z-50 items-center justify-between px-6 lg:px-12 transform transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center gap-6">
          <div className="w-12 h-16 relative bg-ivory">
            <Image src={activeImages[0] || product.images[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-rich-black">
              {selectedColor.name.includes("||") ? selectedColor.name.split("||")[1] : product.name}
            </h3>
            <p className="text-sm font-medium text-rich-black">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-neutral-500">
            <span>Color: <span className="text-rich-black font-medium">{selectedColor.name.split("||")[0]}</span></span>
            <span>Size: <span className="text-rich-black font-medium">{selectedSize === 'Custom' ? 'Custom' : selectedSize}</span></span>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock || !isCustomValid}
            className={`px-8 py-3 uppercase tracking-widest text-xs font-medium transition-colors ${isOutOfStock || !isCustomValid ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-rich-black text-white hover:bg-gold'}`}
          >
            {isOutOfStock ? 'Out of Stock' : !isCustomValid ? 'Enter Measurements' : 'Add To Cart'}
          </button>
        </div>
      </div>
    </>
  );
}
