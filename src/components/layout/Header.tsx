"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const openSearch = useSearchStore((state) => state.openSearch);

  useEffect(() => {
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
          {/* Left: Mobile Menu Toggle / Desktop Menu */}
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 lg:hidden"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <nav className="hidden lg:flex gap-8 items-center text-sm tracking-wide font-medium relative group">
              <Link href="/collections/all" className="whitespace-nowrap hover:text-gold transition-colors uppercase tracking-widest text-[11px] py-4">All Clothing</Link>
              <div className="relative py-4 group/menu">
                <span className="whitespace-nowrap hover:text-gold transition-colors uppercase tracking-widest text-[11px] cursor-pointer">Shop</span>
                
                {/* Mega Menu Dropdown */}
                <div className="absolute top-[100%] left-0 w-[600px] bg-white border border-border-light shadow-2xl opacity-0 translate-y-4 invisible group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:visible transition-all duration-300 ease-out flex text-rich-black">
                  <div className="flex-1 p-8">
                    <h3 className="font-serif text-lg mb-4 text-gold">Categories</h3>
                    <div className="flex flex-col gap-3">
                      {categories.map((cat) => (
                        <Link key={cat.id} href={`/collections/${cat.slug}`} className="hover:translate-x-2 transition-transform hover:text-gold">
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="w-[250px] bg-ivory relative p-6 flex flex-col justify-end">
                    <div className="absolute inset-0 z-0">
                      <img src="/images/placeholder-landscape.jpg" alt="Featured" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 text-center">
                      <p className="font-serif text-lg">New Arrivals</p>
                      <Link href="/collections/all" className="text-xs uppercase tracking-widest mt-2 hover:text-gold inline-block">Shop Now &rarr;</Link>
                    </div>
                  </div>
                </div>
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
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ type: "tween", duration: 0.4, ease: "circOut" }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm z-[70] bg-white text-rich-black flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <FocusLock returnFocus className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <span className="font-serif text-2xl tracking-widest uppercase">Tranquil</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="hover:rotate-90 transition-transform">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col p-8 gap-8 mt-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <Link href="/collections/all" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl tracking-wide hover:text-gold transition-colors inline-block">All Clothing</Link>
                  </motion.div>
                  {categories.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + (i * 0.05), duration: 0.4 }}
                    >
                      <Link 
                        href={`/collections/${cat.slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="font-serif text-2xl tracking-wide hover:text-gold transition-colors inline-block"
                      >
                        {cat.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
              <div className="mt-auto p-8 bg-ivory border-t border-border-light flex justify-between items-center">
                <div className="flex gap-8">
                  <Link href="/account" className="flex items-center gap-3 text-sm tracking-widest uppercase text-neutral-500 hover:text-rich-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-5 h-5" />
                    Account
                  </Link>
                </div>
                <Link href="/account?tab=wishlist" className="flex items-center gap-3 text-sm tracking-widest uppercase text-neutral-500 hover:text-rich-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <Heart className="w-5 h-5" />
                  Wishlist
                </Link>
              </div>
              </FocusLock>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
