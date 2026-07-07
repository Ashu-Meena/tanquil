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
    <footer className="bg-[#111111] text-white pt-12 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-12 border-b border-[#333333] pb-12">
          {/* WhatsApp Community */}
          <div className="flex flex-col items-center max-w-2xl">
            <h2 className="font-serif text-3xl lg:text-4xl mb-4 text-[#C7A17A]">Join Our Fashion Circle</h2>
            <p className="text-[#666666] mb-8">
              Join our WhatsApp Community to get 10% off your first purchase, exclusive access to new arrivals, and styling tips.
            </p>
            <div className="flex justify-center">
              <MagneticButton>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors flex items-center justify-center gap-3 rounded-full"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Join WhatsApp
                </a>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16 text-sm">
          {/* Brand */}
          <div className="mb-8 md:mb-0">
            <h4 className="font-serif text-2xl tracking-widest uppercase mb-6 text-white">Tranquil</h4>
            <p className="text-[#666666] mb-6 leading-relaxed">
              Designed to be remembered. Luxury pieces for women who love standing out.
            </p>
            <div className="flex gap-4">
              {storeInfo?.instagram && (
                <a href={storeInfo.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center hover:border-[#C7A17A] hover:text-[#C7A17A] transition-colors">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {storeInfo?.facebook && (
                <a href={storeInfo.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center hover:border-[#C7A17A] hover:text-[#C7A17A] transition-colors">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="border-b border-[#333333] md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleAccordion("shop")}
              className="w-full flex justify-between items-center md:cursor-default"
            >
              <h4 className="font-medium uppercase tracking-widest md:mb-6 text-[#C7A17A]">Shop</h4>
              <ChevronDown className={`w-4 h-4 text-[#C7A17A] transition-transform md:hidden ${activeAccordion === "shop" ? "rotate-180" : ""}`} />
            </button>
            <ul className={`flex flex-col gap-4 text-[#666666] overflow-hidden transition-all duration-300 md:h-auto md:opacity-100 md:mt-0 ${activeAccordion === "shop" ? "h-auto opacity-100 mt-4" : "h-0 opacity-0 md:h-auto md:opacity-100"}`}>
              <li><Link href="/collections/new" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/collections/bestsellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/collections/sale" className="hover:text-white transition-colors">Sale</Link></li>
              <li><Link href="/collections/all" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="border-b border-[#333333] md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleAccordion("categories")}
              className="w-full flex justify-between items-center md:cursor-default"
            >
              <h4 className="font-medium uppercase tracking-widest md:mb-6 text-[#C7A17A]">Categories</h4>
              <ChevronDown className={`w-4 h-4 text-[#C7A17A] transition-transform md:hidden ${activeAccordion === "categories" ? "rotate-180" : ""}`} />
            </button>
            <ul className={`flex flex-col gap-4 text-[#666666] overflow-hidden transition-all duration-300 md:h-auto md:opacity-100 md:mt-0 ${activeAccordion === "categories" ? "h-auto opacity-100 mt-4" : "h-0 opacity-0 md:h-auto md:opacity-100"}`}>
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
              <h4 className="font-medium uppercase tracking-widest md:mb-6 text-[#C7A17A]">About</h4>
              <ChevronDown className={`w-4 h-4 text-[#C7A17A] transition-transform md:hidden ${activeAccordion === "about" ? "rotate-180" : ""}`} />
            </button>
            <ul className={`flex flex-col gap-4 text-[#666666] overflow-hidden transition-all duration-300 md:h-auto md:opacity-100 md:mt-0 ${activeAccordion === "about" ? "h-auto opacity-100 mt-4" : "h-0 opacity-0 md:h-auto md:opacity-100"}`}>
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
