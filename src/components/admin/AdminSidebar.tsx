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
  Tag,
  LogOut,
  Package,
  Percent,
  Globe,
  X
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAdminStore } from "@/store/useAdminStore";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Inventory", href: "/admin/inventory", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Discounts", href: "/admin/discounts", icon: Percent },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Storefront", href: "/admin/storefront/homepage", icon: Globe },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Shipping", href: "/admin/shipping", icon: Truck },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { isMobileSidebarOpen, closeMobileSidebar } = useAdminStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-light flex-col transition-transform duration-300 ease-in-out md:flex md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
        }`}
      >
        <div className="p-6 border-b border-border-light flex justify-between items-center">
          <Link href="/admin" className="font-serif text-2xl text-rich-black tracking-widest uppercase" onClick={closeMobileSidebar}>
            Tranquil<span className="text-gold text-xs align-top font-sans normal-case tracking-normal ml-1">Admin</span>
          </Link>
          <button 
            className="md:hidden text-neutral-500 hover:text-rich-black"
            onClick={closeMobileSidebar}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileSidebar}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition-colors ${
                isActive 
                  ? "bg-ivory text-gold font-medium" 
                  : "text-neutral-500 hover:bg-ivory hover:text-rich-black"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 pb-6 border-t border-border-light pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
