"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import MagneticButton from "../ui/MagneticButton";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);



export default function Footer() {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [storeInfo, setStoreInfo] = useState<any>(null);

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  useEffect(() => {
    async function fetchInfo() {
      const { data } = await supabase.from('store_settings').select('value').eq('key', 'store_info').single();
      if (data?.value) setStoreInfo(data.value);
    }
    fetchInfo();
  }, []);


  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#111111] text-white pt-12 pb-24 md:pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-12 border-b border-[#333333] pb-12">
          {/* Newsletter / Community */}
          <div className="flex flex-col items-center max-w-xl w-full">
            <h2 className="font-serif text-2xl lg:text-3xl mb-3 text-white">Join the List</h2>
            <p className="text-[#999999] text-xs mb-8 uppercase tracking-widest">
              Exclusive access to new arrivals & styling tips
            </p>
            <div className="flex w-full relative">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-transparent border-b border-[#333333] pb-3 text-xs tracking-widest text-white focus:outline-none focus:border-white transition-colors"
              />
              <button className="absolute right-0 top-0 text-[10px] uppercase tracking-widest text-white hover:text-[#C7A17A] transition-colors pb-3 border-b border-transparent">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16 text-[10px] uppercase tracking-widest">
          {/* Brand */}
          <div className="mb-8 md:mb-0">
            <h4 className="font-serif text-xl tracking-widest uppercase mb-4 text-white">Tranquil</h4>
            <p className="text-[#666666] mb-6 leading-relaxed text-[10px] uppercase tracking-widest">
              Designed to be remembered.<br/>Luxury pieces for women.
            </p>
            <div className="flex gap-4">
              {storeInfo?.instagram && (
                <a href={storeInfo.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[#666666] hover:text-white transition-colors">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {storeInfo?.facebook && (
                <a href={storeInfo.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-[#666666] hover:text-white transition-colors">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="border-b border-[#222222] md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleAccordion("shop")}
              className="w-full flex justify-between items-center md:cursor-default"
            >
              <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] md:mb-6 text-white">Shop</h4>
              <span className="text-lg font-light leading-none md:hidden text-[#666666]">{activeAccordion === "shop" ? "—" : "+"}</span>
            </button>
            <ul className={`flex flex-col gap-3 text-[#666666] text-[10px] uppercase tracking-widest overflow-hidden transition-all duration-300 md:h-auto md:opacity-100 md:mt-0 ${activeAccordion === "shop" ? "h-auto opacity-100 mt-4" : "h-0 opacity-0 md:h-auto md:opacity-100"}`}>
              <li><Link href="/collections/new" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/collections/bestsellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/collections/sale" className="hover:text-white transition-colors">Sale</Link></li>
              <li><Link href="/collections/all" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="border-b border-[#222222] md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleAccordion("categories")}
              className="w-full flex justify-between items-center md:cursor-default"
            >
              <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] md:mb-6 text-white">Categories</h4>
              <span className="text-lg font-light leading-none md:hidden text-[#666666]">{activeAccordion === "categories" ? "—" : "+"}</span>
            </button>
            <ul className={`flex flex-col gap-3 text-[#666666] text-[10px] uppercase tracking-widest overflow-hidden transition-all duration-300 md:h-auto md:opacity-100 md:mt-0 ${activeAccordion === "categories" ? "h-auto opacity-100 mt-4" : "h-0 opacity-0 md:h-auto md:opacity-100"}`}>
              <li><Link href="/collections/dresses" className="hover:text-white transition-colors">Dresses</Link></li>
              <li><Link href="/collections/corsets" className="hover:text-white transition-colors">Corsets</Link></li>
              <li><Link href="/collections/coord" className="hover:text-white transition-colors">Co-Ords</Link></li>
              <li><Link href="/collections/tops" className="hover:text-white transition-colors">Tops</Link></li>
              <li><Link href="/collections/ethnic" className="hover:text-white transition-colors">Ethnic Wear</Link></li>
            </ul>
          </div>

          {/* About & Policies */}
          <div className="pb-4 md:pb-0">
            <button 
              onClick={() => toggleAccordion("about")}
              className="w-full flex justify-between items-center md:cursor-default"
            >
              <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] md:mb-6 text-white">About</h4>
              <span className="text-lg font-light leading-none md:hidden text-[#666666]">{activeAccordion === "about" ? "—" : "+"}</span>
            </button>
            <ul className={`flex flex-col gap-3 text-[#666666] text-[10px] uppercase tracking-widest overflow-hidden transition-all duration-300 md:h-auto md:opacity-100 md:mt-0 ${activeAccordion === "about" ? "h-auto opacity-100 mt-4" : "h-0 opacity-0 md:h-auto md:opacity-100"}`}>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#333333] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#666666]">
          <p>&copy; {new Date().getFullYear()} Tranquil. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
