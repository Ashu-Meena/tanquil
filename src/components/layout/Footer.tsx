"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
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

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.625 0 12.017 0z" />
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const [storeInfo, setStoreInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchInfo() {
      const { data } = await supabase.from('store_settings').select('value').eq('key', 'store_info').single();
      if (data?.value) setStoreInfo(data.value);
    }
    fetchInfo();
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#111111] text-white pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Top Section: Newsletter & Instagram Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 border-b border-[#333333] pb-16">
          {/* Newsletter */}
          <div className="flex flex-col justify-center">
            <h2 className="font-serif text-3xl lg:text-4xl mb-4 text-[#C7A17A]">Join Our Fashion Circle</h2>
            <p className="text-[#666666] mb-8 max-w-md">
              Subscribe to get 10% off your first purchase, exclusive access to new arrivals, and styling tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#1A1A1A] text-white border border-[#333333] rounded-none py-4 pl-12 pr-4 focus:outline-none focus:border-[#C7A17A] transition-colors"
                  required
                />
              </div>
              <MagneticButton>
                <button
                  type="submit"
                  className="bg-[#C7A17A] hover:bg-[#CDAA5D] text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </MagneticButton>
            </form>
          </div>

          {/* Instagram Feed Preview */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="font-serif text-2xl mb-1">Follow Us</h3>
                <a href="https://instagram.com/tranquil.co.in" target="_blank" rel="noreferrer" className="text-[#666666] hover:text-[#C7A17A] transition-colors text-sm">@tranquil.co.in</a>
              </div>
              <InstagramIcon className="w-6 h-6 text-[#C7A17A]" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-[#1A1A1A] relative overflow-hidden group cursor-pointer">
                  {/* Placeholder for Instagram Images */}
                  <img src={`https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80&auto=format&fit=crop`} alt="Instagram Feed" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <InstagramIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-sm">
          {/* Brand */}
          <div>
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
          <div>
            <h4 className="font-medium uppercase tracking-widest mb-6 text-[#C7A17A]">Shop</h4>
            <ul className="flex flex-col gap-4 text-[#666666]">
              <li><Link href="/collections/new" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/collections/bestsellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/collections/sale" className="hover:text-white transition-colors">Sale</Link></li>
              <li><Link href="/collections/all" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-medium uppercase tracking-widest mb-6 text-[#C7A17A]">Categories</h4>
            <ul className="flex flex-col gap-4 text-[#666666]">
              <li><Link href="/collections/dresses" className="hover:text-white transition-colors">Dresses</Link></li>
              <li><Link href="/collections/corsets" className="hover:text-white transition-colors">Corsets</Link></li>
              <li><Link href="/collections/coord" className="hover:text-white transition-colors">Co-Ords</Link></li>
              <li><Link href="/collections/tops" className="hover:text-white transition-colors">Tops</Link></li>
              <li><Link href="/collections/ethnic" className="hover:text-white transition-colors">Ethnic Wear</Link></li>
            </ul>
          </div>

          {/* About & Policies */}
          <div>
            <h4 className="font-medium uppercase tracking-widest mb-6 text-[#C7A17A]">About</h4>
            <ul className="flex flex-col gap-4 text-[#666666]">
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
