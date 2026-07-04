"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useSearchStore } from "@/store/useSearchStore";
import AnnouncementBar from "./AnnouncementBar";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const openSearch = useSearchStore((state) => state.openSearch);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isHomePage = pathname === '/';
  const forceSolidHeader = !isHomePage;

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col">
        <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? 'h-0' : 'h-8'}`}>
          <AnnouncementBar />
        </div>
        <div
          className={`w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isScrolled || forceSolidHeader
              ? "bg-white/70 backdrop-blur-lg border-b border-[#EFEFEF] py-4 text-[#111111] shadow-sm"
              : "bg-transparent py-4 lg:py-6 text-white hover:bg-white/90 hover:backdrop-blur-md hover:text-[#111111]"
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
            <nav className="hidden lg:flex gap-8 items-center text-sm tracking-wide font-medium">
              <Link href="/collections/new" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px]">New Arrivals</Link>
              <Link href="/collections/clothing" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px]">All Clothing</Link>
              <Link href="/collections/dresses" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px]">Dresses & Gowns</Link>
              <Link href="/collections/partywear" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px]">Party Wear</Link>
              <Link href="/collections/sale" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px] text-[#C7A17A]">Sale</Link>
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="font-serif text-2xl lg:text-3xl tracking-widest uppercase hover:opacity-80 transition-opacity">
              Tranquil
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6">
            <button onClick={openSearch} aria-label="Search" className="hover:text-[#CDAA5D] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account/wishlist" aria-label="Wishlist" className="hover:text-[#CDAA5D] transition-colors hidden sm:block">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/account" aria-label="Account" className="hover:text-[#CDAA5D] transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={openCart} aria-label="Cart" className="hover:text-[#CDAA5D] transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C7A17A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "circOut" }}
            className="fixed inset-0 z-[60] bg-white text-[#111111] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[#EFEFEF]">
              <span className="font-serif text-2xl tracking-widest uppercase">Tranquil</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="hover:rotate-90 transition-transform">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-8 gap-8 mt-10">
              <Link href="/collections/new" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-4xl hover:translate-x-3 transition-transform">New Arrivals</Link>
              <Link href="/collections/clothing" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-4xl hover:translate-x-3 transition-transform">All Clothing</Link>
              <Link href="/collections/dresses" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-4xl hover:translate-x-3 transition-transform">Dresses & Gowns</Link>
              <Link href="/collections/partywear" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-4xl hover:translate-x-3 transition-transform">Party Wear</Link>
              <Link href="/collections/sale" className="font-serif text-4xl text-[#C7A17A] hover:translate-x-3 transition-transform" onClick={() => setIsMobileMenuOpen(false)}>Sale</Link>
            </nav>
            <div className="mt-auto p-8 bg-[#FAF8F5] border-t border-[#EFEFEF] flex justify-between items-center">
              <div className="flex gap-8">
                <Link href="/account" className="flex items-center gap-3 text-sm tracking-widest uppercase text-[#666666] hover:text-[#111111] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  Account
                </Link>
              </div>
              <Link href="/account/wishlist" className="flex items-center gap-3 text-sm tracking-widest uppercase text-[#666666] hover:text-[#111111] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <Heart className="w-5 h-5" />
                Wishlist
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
