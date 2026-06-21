"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useSearchStore } from "@/store/useSearchStore";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const openCart = useCartStore((state) => state.openCart);
  const openSearch = useSearchStore((state) => state.openSearch);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isScrolled
          ? "top-0 bg-white/70 backdrop-blur-lg border-b border-white/20 py-3 text-[#111111] shadow-sm"
          : "top-8 bg-transparent py-6 text-white hover:bg-white/90 hover:backdrop-blur-md hover:text-[#111111]"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle / Desktop Menu (minimal) */}
        <div className="flex-1 flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 lg:hidden"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <nav className="hidden lg:flex gap-8 items-center text-sm tracking-wide font-medium">
            <Link href="/collections/new" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px]">New In</Link>
            <Link href="/collections/clothing" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px]">Clothing</Link>
            <Link href="/collections/dresses" className="hover:text-[#CDAA5D] transition-colors uppercase tracking-widest text-[11px]">Dresses</Link>
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="font-serif text-2xl lg:text-3xl tracking-widest uppercase hover:opacity-80 transition-opacity">
            Tanquil
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
            <span className="absolute -top-1.5 -right-1.5 bg-[#C7A17A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
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
              <span className="font-serif text-2xl tracking-widest uppercase">Tanquil</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="hover:rotate-90 transition-transform">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-6 gap-6 text-lg font-medium tracking-wide">
              <Link href="/collections/new" onClick={() => setIsMobileMenuOpen(false)} className="hover:translate-x-2 transition-transform">New In</Link>
              <Link href="/collections/clothing" onClick={() => setIsMobileMenuOpen(false)} className="hover:translate-x-2 transition-transform">Clothing</Link>
              <Link href="/collections/dresses" onClick={() => setIsMobileMenuOpen(false)} className="hover:translate-x-2 transition-transform">Dresses</Link>
              <Link href="/collections/partywear" onClick={() => setIsMobileMenuOpen(false)} className="hover:translate-x-2 transition-transform">Party Wear</Link>
              <Link href="/collections/sale" className="text-[#E63946] hover:translate-x-2 transition-transform" onClick={() => setIsMobileMenuOpen(false)}>Sale</Link>
            </nav>
            <div className="mt-auto p-6 bg-[#FAF8F5] border-t border-[#EFEFEF] flex justify-around">
              <Link href="/account" className="flex flex-col items-center gap-2 text-sm text-[#666666] hover:text-[#111111] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <User className="w-5 h-5" />
                Account
              </Link>
              <Link href="/account/wishlist" className="flex flex-col items-center gap-2 text-sm text-[#666666] hover:text-[#111111] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <Heart className="w-5 h-5" />
                Wishlist
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
