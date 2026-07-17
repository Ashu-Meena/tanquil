"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useSearchStore } from "@/store/useSearchStore";
import AnnouncementBar from "./AnnouncementBar";
import { createClient } from "@/utils/supabase/client";
import FocusLock from "react-focus-lock";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const openSearch = useSearchStore((state) => state.openSearch);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('id, name, slug').eq('is_active', true).order('display_order', { ascending: true });
      if (data) setCategories(data);
    };
    fetchCategories();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);



  // Handle Escape key for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isHomePage = pathname === '/';
  const forceSolidHeader = !isHomePage;

  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col">
        <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? 'h-0' : 'h-8'}`}>
          <AnnouncementBar />
        </div>
        <div
          className={`w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border-b ${
            isScrolled || forceSolidHeader
              ? "bg-white/30 backdrop-blur-2xl border-white/40 py-4 text-rich-black shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
              : "bg-transparent border-transparent py-4 lg:py-6 text-white hover:bg-white/20 hover:backdrop-blur-xl hover:border-white/30 hover:text-rich-black"
          }`}
        >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 lg:hidden"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <nav className="hidden lg:flex gap-8 items-center text-sm tracking-wide font-medium">
              <Link href="/collections/all" className="whitespace-nowrap hover:text-gold transition-colors uppercase tracking-widest text-[11px] py-4">All Clothing</Link>
              <div 
                className="py-4"
                onMouseEnter={() => setIsShopHovered(true)}
                onMouseLeave={() => setIsShopHovered(false)}
              >
                <Link href="/collections/all" className="whitespace-nowrap hover:text-gold transition-colors uppercase tracking-widest text-[11px] cursor-pointer">Shop</Link>
              </div>
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" prefetch={true} className="font-serif text-2xl lg:text-3xl tracking-widest uppercase hover:opacity-80 transition-opacity">
              Tranquil
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6">
            <button onClick={openSearch} aria-label="Search" className="hover:text-gold transition-colors block">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account?tab=wishlist" aria-label="Wishlist" className="hover:text-gold transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/account" aria-label="Account" className="hover:text-gold transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={openCart} aria-label="Cart" className="hover:text-gold transition-colors relative hidden lg:block">
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Full-Width Mega Menu Dropdown */}
        <div 
          className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-3xl border-t border-border-light shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isShopHovered ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
          onMouseEnter={() => setIsShopHovered(true)}
          onMouseLeave={() => setIsShopHovered(false)}
        >
          <div className="container mx-auto px-6 lg:px-12 flex">
            {/* Categories Grid */}
            <div className="flex-1 py-12 pr-12 grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-serif text-2xl mb-6 text-rich-black">Categories</h3>
                <div className="flex flex-col gap-4">
                  {categories.slice(0, Math.ceil(categories.length / 2)).map((cat) => (
                    <Link key={cat.id} href={`/collections/${cat.slug}`} className="text-neutral-500 hover:text-gold hover:translate-x-2 transition-all text-sm uppercase tracking-widest font-medium">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-serif text-2xl mb-6 text-rich-black opacity-0">More</h3>
                <div className="flex flex-col gap-4">
                  {categories.slice(Math.ceil(categories.length / 2)).map((cat) => (
                    <Link key={cat.id} href={`/collections/${cat.slug}`} className="text-neutral-500 hover:text-gold hover:translate-x-2 transition-all text-sm uppercase tracking-widest font-medium">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaign Images */}
            <div className="w-[500px] bg-ivory relative p-8 flex gap-4 border-l border-border-light">
              <Link href="/collections/editorial" className="relative flex-1 h-[300px] group overflow-hidden block">
                <Image src="/images/fashion-1.jpg" alt="Campaign 1" fill sizes="250px" className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)]" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-serif text-2xl mb-1">Summer Edit</p>
                  <p className="text-white/80 text-[10px] uppercase tracking-widest">Explore Campaign &rarr;</p>
                </div>
              </Link>
              <Link href="/collections/new" className="relative flex-1 h-[300px] group overflow-hidden block">
                <Image src="/images/fashion-2.jpg" alt="Campaign 2" fill sizes="250px" className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)]" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-serif text-2xl mb-1">Vintage Core</p>
                  <p className="text-white/80 text-[10px] uppercase tracking-widest">Shop Collection &rarr;</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile Menu Overlay — sibling of header, not nested inside it */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, y: "10%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "10%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[70] bg-ivory text-rich-black flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <FocusLock returnFocus className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between p-6">
                <span className="font-serif text-2xl tracking-widest uppercase">Tranquil</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="hover:rotate-90 transition-transform bg-white/50 backdrop-blur-md rounded-full p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center">
                <nav className="flex flex-col gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href="/collections/all" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-[42px] leading-none tracking-wide hover:text-gold transition-colors inline-block">All Clothing</Link>
                  </motion.div>
                  {categories.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + (i * 0.08), duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link 
                        href={`/collections/${cat.slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="font-serif text-[42px] leading-none tracking-wide text-neutral-400 hover:text-rich-black transition-colors inline-block"
                      >
                        {cat.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-auto p-6 flex justify-between items-center pb-safe"
              >
                <Link href="/account" className="flex flex-col items-center gap-1 text-[10px] tracking-widest uppercase text-neutral-500 hover:text-rich-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-5 h-5 mb-1 text-rich-black" strokeWidth={1.5} />
                  Account
                </Link>
                <Link href="/account?tab=wishlist" className="flex flex-col items-center gap-1 text-[10px] tracking-widest uppercase text-neutral-500 hover:text-rich-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <Heart className="w-5 h-5 mb-1 text-rich-black" strokeWidth={1.5} />
                  Wishlist
                </Link>
                <button onClick={() => { setIsMobileMenuOpen(false); openSearch(); }} className="flex flex-col items-center gap-1 text-[10px] tracking-widest uppercase text-neutral-500 hover:text-rich-black transition-colors">
                  <Search className="w-5 h-5 mb-1 text-rich-black" strokeWidth={1.5} />
                  Search
                </button>
              </motion.div>
              </FocusLock>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
