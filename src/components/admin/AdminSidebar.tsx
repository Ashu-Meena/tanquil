"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon,
  Settings,
  CreditCard,
  Truck,
  MessageSquare,
  FileText,
  Tag,
  LogOut,
  Package
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Inventory", href: "/admin/inventory", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Discounts", href: "/admin/discounts", icon: Tag },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Storefront", href: "/admin/storefront/homepage", icon: LayoutDashboard },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Shipping", href: "/admin/shipping", icon: Truck },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-[#EFEFEF] min-h-screen flex-col hidden md:flex sticky top-0 h-screen">
      <div className="p-6 border-b border-[#EFEFEF]">
        <Link href="/admin" className="font-serif text-2xl text-[#111111] tracking-widest uppercase">
          Tranquil<span className="text-[#C7A17A] text-xs align-top font-sans normal-case tracking-normal ml-1">Admin</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition-colors ${
                isActive 
                  ? "bg-[#FAF8F5] text-[#C7A17A] font-medium" 
                  : "text-[#666666] hover:bg-[#FAF8F5] hover:text-[#111111]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#EFEFEF]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
