"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Heart, Ruler, Truck, ShieldCheck, RefreshCw, ChevronDown, ChevronUp, Share2, MessageCircle } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import SizeGuideModal from "@/components/product/SizeGuideModal";

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
  colors: Color[];
  sizes: string[];
  details: string[];
}

interface ProductClientProps {
  product: ProductDetails;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedProducts: any[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : { name: "Default", hex: "#000000" });
  const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Custom"];
  const [selectedSize, setSelectedSize] = useState(sizesList[0] || "Custom");
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

  const getFinalSizeString = () => {
    if (selectedSize === "Custom") {
      return `Custom (Bust: ${customMeasurements.bust || '-'}, Waist: ${customMeasurements.waist || '-'}, Hips: ${customMeasurements.hips || '-'}, Length: ${customMeasurements.length || '-'})`;
    }
    return selectedSize;
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor.name,
      size: getFinalSizeString(),
      quantity,
    });
    openCart();
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor.name,
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
          {/* Breadcrumbs */}
          <div className="text-[11px] uppercase tracking-widest text-[#666666] mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-[#C7A17A] transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/collections/${product.category.toLowerCase()}`} className="hover:text-[#C7A17A] transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-[#111111]">{product.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Mobile Swipeable Gallery */}
            <div className="w-full md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-6 px-6 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {product.images.map((img, i) => (
                <div key={i} className="relative w-full aspect-[3/4] flex-shrink-0 snap-center bg-[#FAF8F5]">
                  <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" priority={i === 0} />
                </div>
              ))}
            </div>

            {/* Gallery (Left) */}
            <div className="hidden md:flex w-full lg:w-[60%] flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-28 lg:h-[calc(100vh-120px)]">
              {/* Thumbnails */}
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 flex-shrink-0">
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-28 md:w-full md:h-32 flex-shrink-0 border transition-all ${selectedImage === img ? 'border-[#111111] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
              
              {/* Main Image */}
              <div className="relative w-full aspect-[3/4] md:h-[calc(100vh-200px)] md:aspect-auto bg-[#FAF8F5] cursor-zoom-in group overflow-hidden">
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
              <div className="flex justify-between items-start mb-4">
                <h1 className="font-serif text-3xl md:text-4xl text-[#111111]">{product.name}</h1>
                <button
                  onClick={handleShare}
                  title={shareCopied ? "Link Copied!" : "Share"}
                  className={`transition-colors p-2 ${shareCopied ? 'text-[#2F855A]' : 'text-[#111111] hover:text-[#C7A17A]'}`}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              {shareCopied && (
                <p className="text-xs text-[#2F855A] mb-2 -mt-2">Link copied to clipboard!</p>
              )}
              
              <p className="text-2xl text-[#111111] mb-8" style={{ fontFamily: 'var(--font-montserrat)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </p>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[#666666] mb-4">
                    Color: <span className="text-[#111111] font-medium">{selectedColor.name}</span>
                  </p>
                  <div className="flex gap-3">
                    {product.colors.map(color => (
                      <button 
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor.name === color.name ? 'border-[#111111] p-[2px]' : 'border-transparent p-0'}`}
                      >
                        <span 
                          className="block w-full h-full rounded-full border border-[#EFEFEF]" 
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs uppercase tracking-widest text-[#666666]">
                    Size: <span className="text-[#111111] font-medium">{selectedSize}</span>
                  </p>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs uppercase tracking-widest text-[#111111] underline underline-offset-4 flex items-center gap-1 hover:text-[#C7A17A] transition-colors"
                  >
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2">
                  {sizesList.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-[10px] uppercase tracking-widest border transition-colors ${selectedSize === size ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#EFEFEF] hover:border-[#111111] text-[#111111]'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {selectedSize === "Custom" && (
                  <div className="mt-4 p-4 border border-[#EFEFEF] bg-[#FAF8F5]">
                    <p className="text-xs font-medium text-[#111111] mb-4 uppercase tracking-widest">Enter Measurements (inches)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#666666] mb-1 block">Bust</label>
                        <input type="number" value={customMeasurements.bust} onChange={e => setCustomMeasurements({...customMeasurements, bust: e.target.value})} className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. 34" />
                      </div>
                      <div>
                        <label className="text-xs text-[#666666] mb-1 block">Waist</label>
                        <input type="number" value={customMeasurements.waist} onChange={e => setCustomMeasurements({...customMeasurements, waist: e.target.value})} className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. 28" />
                      </div>
                      <div>
                        <label className="text-xs text-[#666666] mb-1 block">Hips</label>
                        <input type="number" value={customMeasurements.hips} onChange={e => setCustomMeasurements({...customMeasurements, hips: e.target.value})} className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. 38" />
                      </div>
                      <div>
                        <label className="text-xs text-[#666666] mb-1 block">Length</label>
                        <input type="number" value={customMeasurements.length} onChange={e => setCustomMeasurements({...customMeasurements, length: e.target.value})} className="w-full border border-[#EFEFEF] p-2 text-sm focus:outline-none focus:border-[#C7A17A]" placeholder="e.g. 42" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-[#666666] mb-4">Quantity</p>
                <div className="flex items-center border border-[#EFEFEF] w-32 h-12">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 hover:bg-[#FAF8F5] h-full transition-colors">-</button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="flex-1 hover:bg-[#FAF8F5] h-full transition-colors">+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 mb-10" ref={addToCartRef}>
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-[#111111] hover:bg-[#C7A17A] text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors"
                >
                  Add To Cart
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors"
                  >
                    Buy It Now
                  </button>
                  <button
                    onClick={handleWishlist}
                    title={isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    className={`w-14 border flex items-center justify-center transition-colors ${isWishlisted(product.id) ? 'border-[#E63946] bg-[#E63946] text-white' : 'border-[#EFEFEF] hover:border-[#E63946] text-[#111111] hover:text-[#E63946]'}`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full mt-2 flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white py-3 text-sm font-medium transition-colors rounded-sm"
                >
                  <MessageCircle className="w-5 h-5" /> Need styling advice? Chat on WhatsApp
                </a>
              </div>

              {/* Trust Elements */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#EFEFEF] py-6">
                <div className="flex items-center gap-3 text-sm text-[#666666]">
                  <Truck className="w-5 h-5 text-[#111111]" />
                  Free Shipping
                </div>
                <div className="flex items-center gap-3 text-sm text-[#666666]">
                  <RefreshCw className="w-5 h-5 text-[#111111]" />
                  7-Day Returns
                </div>
                <div className="flex items-center gap-3 text-sm text-[#666666]">
                  <ShieldCheck className="w-5 h-5 text-[#111111]" />
                  Secure Checkout
                </div>
              </div>

              {/* Accordions */}
              <div className="border-t border-[#EFEFEF]">
                <div className="py-4 border-b border-[#EFEFEF]">
                  <button 
                    onClick={() => setActiveTab(activeTab === "desc" ? "" : "desc")}
                    className="w-full flex justify-between items-center text-left uppercase tracking-widest text-sm font-medium text-[#111111]"
                  >
                    Description
                    {activeTab === "desc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {activeTab === "desc" && (
                    <div className="pt-4 text-[#666666] leading-relaxed text-sm">
                      {product.description}
                    </div>
                  )}
                </div>
                <div className="py-4 border-b border-[#EFEFEF]">
                  <button 
                    onClick={() => setActiveTab(activeTab === "details" ? "" : "details")}
                    className="w-full flex justify-between items-center text-left uppercase tracking-widest text-sm font-medium text-[#111111]"
                  >
                    Details & Care
                    {activeTab === "details" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {activeTab === "details" && (
                    <ul className="pt-4 text-[#666666] text-sm space-y-2 list-disc pl-4">
                      {product.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Complete The Look / Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="container mx-auto px-6 lg:px-12 mt-32 border-t border-[#EFEFEF] pt-24">
            <h2 className="font-serif text-3xl lg:text-4xl text-[#111111] mb-12 text-center">Complete The Look</h2>
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
      <div className={`md:hidden fixed bottom-[64px] left-0 w-full bg-white border-t border-[#EFEFEF] p-4 z-40 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-4 transition-transform duration-500 ${showStickyBar ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-[#111111] text-white py-3 uppercase tracking-widest text-[10px] font-medium transition-colors"
        >
          Add To Cart
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 border border-[#111111] text-[#111111] py-3 uppercase tracking-widest text-[10px] font-medium transition-colors"
        >
          Buy It Now
        </button>
      </div>
      {/* Desktop Sticky Add to Cart */}
      <div className={`hidden md:flex fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#EFEFEF] p-4 z-50 items-center justify-between px-6 lg:px-12 transform transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center gap-6">
          <div className="w-12 h-16 relative bg-[#FAF8F5]">
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#111111]">{product.name}</h3>
            <p className="text-sm font-medium text-[#111111]">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-[#666666]">
            <span>Color: <span className="text-[#111111] font-medium">{selectedColor.name}</span></span>
            <span>Size: <span className="text-[#111111] font-medium">{selectedSize === 'Custom' ? 'Custom' : selectedSize}</span></span>
          </div>
          <button 
            onClick={handleAddToCart}
            className="bg-[#111111] text-white px-8 py-3 uppercase tracking-widest text-xs font-medium hover:bg-[#C7A17A] transition-colors"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </>
  );
}
