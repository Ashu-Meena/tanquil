"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bell, Menu, LogOut, Settings } from "lucide-react";
import AdminSearch from "./AdminSearch";
import { NotificationDropdown } from "./NotificationDropdown";
import { useAdminStore } from "@/store/useAdminStore";

export function AdminHeader() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const toggleMobileSidebar = useAdminStore(state => state.toggleMobileSidebar);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-neutral-500 hover:text-rich-black"
          onClick={toggleMobileSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
        <AdminSearch />
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        
        <button className="text-neutral-500 hover:text-rich-black">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-px bg-border-light mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white font-serif text-sm">
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-rich-black">Administrator</p>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="ml-2 text-neutral-500 hover:text-sale transition-colors disabled:opacity-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
