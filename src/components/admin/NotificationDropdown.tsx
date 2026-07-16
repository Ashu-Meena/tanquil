"use client";

import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line react-hooks/immutability
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('admin_notifications' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && !error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNotifications(data as any);
    }
    setLoading(false);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('admin_notifications' as any)
      .update({ is_read: true })
      .eq('is_read', false);
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    
    setNotifications([]);
    
    await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('admin_notifications' as any)
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
        className="text-neutral-500 hover:text-rich-black relative p-1 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-sale text-white text-[10px] flex items-center justify-center rounded-full border border-white font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-border-light shadow-lg rounded-sm z-50 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-border-light flex justify-between items-center bg-ivory">
            <h3 className="font-serif text-rich-black font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs text-neutral-500 hover:text-sale flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 flex justify-center items-center text-neutral-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 opacity-20" />
                No new notifications
              </div>
            ) : (
              <ul className="divide-y divide-border-light">
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`p-4 hover:bg-ivory transition-colors ${!notification.is_read ? 'bg-orange-50/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.type === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-sale" />
                        ) : (
                          <Info className="w-4 h-4 text-gold" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-rich-black break-words">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">
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
