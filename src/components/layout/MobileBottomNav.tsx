"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useSearchStore } from "@/store/useSearchStore";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const openSearch = useSearchStore((state) => state.openSearch);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", action: openSearch, icon: Search },
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Cart", action: openCart, icon: ShoppingBag, badge: totalItems },
    { name: "Profile", href: "/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-[#EFEFEF] z-50 lg:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href && pathname === item.href;

          const content = (
            <div className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#C7A17A]' : 'text-[#666666]'} hover:text-[#111111] transition-colors relative`}>
              <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
              {mounted && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0 right-1/4 translate-x-2 -translate-y-1 bg-[#C7A17A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          );

          return item.href ? (
            <Link key={item.name} href={item.href} className="flex-1 h-full flex items-center justify-center">
              {content}
            </Link>
          ) : (
            <button key={item.name} onClick={item.action} className="flex-1 h-full flex items-center justify-center">
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
