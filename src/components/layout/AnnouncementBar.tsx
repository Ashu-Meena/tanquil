"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<string[]>([
    "✨ Welcome to Tranquil"
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMarquee, setIsMarquee] = useState(false);

  useEffect(() => {
    async function fetchAnnouncements() {
      const supabase = createClient();
      const { data } = await supabase.from('store_settings').select('value').eq('key', 'announcement').single();
      const val = data?.value as { messages: string[], isMarquee?: boolean } | null;
      if (val?.messages && val.messages.length > 0) {
        setAnnouncements(val.messages);
      }
      if (val?.isMarquee !== undefined) {
        setIsMarquee(val.isMarquee);
      }
    }
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (isMarquee) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [announcements.length, isMarquee]);

  return (
    <div className="bg-rich-black text-white text-[11px] uppercase tracking-[0.2em] py-2 overflow-hidden relative h-8 z-50 flex items-center">
      {isMarquee ? (
        <div className="whitespace-nowrap w-full overflow-hidden flex">
          <motion.div
            className="flex min-w-max gap-12 sm:gap-24 pl-12 sm:pl-24"
            initial={{ x: "0%" }}
            animate={{ x: "-50%" }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Render two sets for seamless loop */}
            {[...announcements, ...announcements, ...announcements, ...announcements].map((text, i) => (
              <span key={i} className="flex-shrink-0">
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
