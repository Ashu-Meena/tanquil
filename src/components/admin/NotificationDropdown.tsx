"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, AlertCircle, Info, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/store/useToastStore";

interface Notification {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && !error) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('is_read', false);
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    
    setNotifications([]);
    
    await supabase
      .from('admin_notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
    toast.success("Notifications cleared");
  };

  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      fetchNotifications();
      // Wait 1 second before marking as read to allow user to see badge
      setTimeout(() => {
        markAllAsRead();
      }, 1000);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="text-[#666666] hover:text-[#111111] relative p-1 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#E63946] text-white text-[10px] flex items-center justify-center rounded-full border border-white font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-[#EFEFEF] shadow-lg rounded-sm z-50 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
            <h3 className="font-serif text-[#111111] font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs text-[#666666] hover:text-[#E63946] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 flex justify-center items-center text-[#666666]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[#999999] text-sm flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 opacity-20" />
                No new notifications
              </div>
            ) : (
              <ul className="divide-y divide-[#EFEFEF]">
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`p-4 hover:bg-[#FAF8F5] transition-colors ${!notification.is_read ? 'bg-orange-50/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.type === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-[#E63946]" />
                        ) : (
                          <Info className="w-4 h-4 text-[#C7A17A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#111111] break-words">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-[#999999] mt-1 uppercase tracking-wider">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
