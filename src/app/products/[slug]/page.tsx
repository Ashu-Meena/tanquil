"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { Heart, Ruler, Truck, ShieldCheck, RefreshCw, ChevronDown, ChevronUp, Share2, MessageCircle } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

// Placeholder data for PDP
const product = {
  id: "prod-1",
  name: "Satin Slip Midi Dress",
  price: 4999,
  description: "Cut from heavy, lustrous satin, this slip dress drapes beautifully over your frame. It has a flattering cowl neckline, adjustable delicate straps, and a sultry side slit. The champagne hue ensures you'll stand out at any evening event.",
  images: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop&sig=1",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop&sig=2",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop&sig=3",
  ],
  colors: [
    { name: "Champagne", hex: "#C7A17A" },
    { name: "Black", hex: "#111111" },
    { name: "Emerald", hex: "#2F855A" }
  ],
  sizes: ["XS", "S", "M", "L", "XL"],
  details: [
    "100% Polyester Satin",
    "Cowl neckline",
    "Adjustable spaghetti straps",
    "Side slit",
    "Concealed side zipper",
    "Dry clean only"
  ]
};

const relatedProducts = [
  {
    id: "rel-1",
    name: "Embellished Corset Top",
    price: 3499,
    images: ["https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=600", "https://images.unsplash.com/photo-1588117305388-c2631a279f82?q=80&w=600"]
  },
  {
    id: "rel-2",
    name: "Draped Halter Gown",
    price: 6999,
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600", "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600"]
  },
  {
    id: "rel-3",
    name: "Sequin Mini Skirt",
    price: 2999,
    images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600", "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600"]
  },
  {
    id: "rel-4",
    name: "Silk Wrap Blouse",
    price: 3999,
    images: ["https://images.unsplash.com/photo-1515347619362-e610058bdaee?q=80&w=600", "https://images.unsplash.com/photo-1515347619362-e610058bdaee?q=80&w=600"]
  }
];

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor.name,
      size: selectedSize,
      quantity,
    });
    openCart();
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Breadcrumbs */}
        <div className="text-[11px] uppercase tracking-widest text-[#666666] mb-8">
          Home / Dresses / {product.name}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Gallery (Left) */}
          <div className="w-full lg:w-[60%] flex flex-col-reverse md:flex-row gap-4 h-full sticky top-28">
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
              <button className="text-[#111111] hover:text-[#E63946] transition-colors p-2">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-2xl text-[#111111] mb-8" style={{ fontFamily: 'var(--font-montserrat)' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            {/* Colors */}
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

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs uppercase tracking-widest text-[#666666]">
                  Size: <span className="text-[#111111] font-medium">{selectedSize}</span>
                </p>
                <button className="text-xs uppercase tracking-widest text-[#111111] underline underline-offset-4 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Size Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm transition-all border ${selectedSize === size ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#EFEFEF] hover:border-[#111111] text-[#111111]'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
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
            <div className="flex flex-col gap-4 mb-10">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-[#111111] hover:bg-[#C7A17A] text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors"
              >
                Add To Cart
              </button>
              <div className="flex gap-4">
                <button className="flex-1 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors">
                  Buy It Now
                </button>
                <button className="w-14 border border-[#EFEFEF] flex items-center justify-center hover:border-[#111111] transition-colors">
                  <Heart className="w-5 h-5" />
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
      <div className="container mx-auto px-6 lg:px-12 mt-32 border-t border-[#EFEFEF] pt-24">
        <h2 className="font-serif text-3xl lg:text-4xl text-[#111111] mb-12 text-center">Complete The Look</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {relatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
