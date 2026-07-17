"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, User, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/collections/all", icon: LayoutGrid },
    { name: "Wishlist", href: "/account?tab=wishlist", icon: Heart },
    { name: "Cart", action: openCart, icon: ShoppingBag, badge: totalItems },
    { name: "Profile", href: "/account?tab=home", icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden pb-safe pointer-events-none flex justify-center">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-2 py-2 flex items-center justify-between w-full max-w-sm pointer-events-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Determine if tab is active
          const isActive = 
            item.href === "/" ? pathname === "/" : 
            (item.href && pathname.startsWith(item.href.split('?')[0]) && item.href !== "/");

          const content = (
            <motion.div 
              whileTap={{ scale: 0.85 }}
              className={`relative flex flex-col items-center justify-center w-12 h-12 z-10 transition-colors duration-300 ${isActive ? 'text-rich-black' : 'text-neutral-400 hover:text-rich-black'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="mobileNavBubble"
                  className="absolute inset-0 bg-[#f5f5f5] rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
                <span 
                  className={`absolute -top-1.5 -right-2 bg-sale text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    mounted && item.badge !== undefined && item.badge > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                >
                  {item.badge || 0}
                </span>
              </div>
            </motion.div>
          );

          return item.href ? (
            <Link key={item.name} href={item.href} prefetch={true} className="flex-shrink-0">
              {content}
            </Link>
          ) : (
            <button key={item.name} onClick={item.action} className="flex-shrink-0">
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
