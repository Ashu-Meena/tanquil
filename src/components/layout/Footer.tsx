"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail, Volume2, VolumeX } from "lucide-react";
import MagneticButton from "../ui/MagneticButton";
import { useState, useEffect, useRef } from "react";
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

const isVideo = (url: string) => {
  if (!url) return false;
  const baseUrl = url.split('?')[0];
  return baseUrl.match(/\.(mp4|mov|webm|ogg|m4v)$/i) !== null;
};

const FooterMediaItem = ({ post }: { post: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const video = isVideo(post.image_url);

  const handleMouseEnter = () => {
    if (video && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (video && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className="aspect-[9/16] bg-[#1A1A1A] relative overflow-hidden group cursor-pointer block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {video ? (
        <>
          <video
            ref={videoRef}
            src={post.image_url}
            muted={isMuted}
            loop
            playsInline
            autoPlay
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
          />
          <button 
            onClick={toggleMute}
            className="absolute top-2 right-2 z-20 bg-black/50 p-1.5 rounded-full text-white md:hidden"
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
        </>
      ) : (
        <img 
          src={post.image_url} 
          alt="Instagram Feed" 
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
        />
      )}
      
      <a 
        href={post.button_link || "https://instagram.com/tranquil.co.in"} 
        target="_blank" 
        rel="noreferrer" 
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
      >
        <InstagramIcon className="w-6 h-6 text-white" />
      </a>
    </div>
  );
};

export default function Footer() {
  const pathname = usePathname();
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchInfo() {
      const { data } = await supabase.from('store_settings').select('value').eq('key', 'store_info').single();
      if (data?.value) setStoreInfo(data.value);

      const { data: instaData } = await supabase
        .from('homepage_sections')
        .select('image_url, button_link')
        .eq('section_type', 'instagram')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4);
      if (instaData) setInstagramPosts(instaData);
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
