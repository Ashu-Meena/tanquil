"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<string[]>([
    "✨ Welcome to Tranquil"
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase.from('store_settings').select('value').eq('key', 'announcement').single();
      if (data?.value?.messages && data.value.messages.length > 0) {
        setAnnouncements(data.value.messages);
      }
    }
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-[#111111] text-white text-[11px] uppercase tracking-[0.2em] py-2 overflow-hidden relative h-8 z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-center w-full"
        >
          {announcements[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
