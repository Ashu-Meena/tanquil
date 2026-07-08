"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    } catch (e) {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#EFEFEF] flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-[#666666] hover:text-[#111111]"
          onClick={toggleMobileSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
        <AdminSearch />
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        
        <button className="text-[#666666] hover:text-[#111111]">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-px bg-[#EFEFEF] mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C7A17A] rounded-full flex items-center justify-center text-white font-serif text-sm">
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[#111111]">Administrator</p>
            <p className="text-[10px] text-[#666666] uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="ml-2 text-[#666666] hover:text-[#E63946] transition-colors disabled:opacity-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
