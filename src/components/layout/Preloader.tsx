"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Total animation time is 5s
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const letters = "TRANQUIL".split("");

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center pointer-events-none overflow-hidden"
        >
          {/* Container for logo to apply shimmer */}
          <div className="relative flex flex-col items-center overflow-hidden px-4 py-8">
            
            {/* 
              Cinematic Logo Reveal 
              Adds a subtle "breathing" scale alongside the elegant top-to-bottom wipe.
              Fully responsive across all device sizes.
            */}
            <div className="w-48 sm:w-56 md:w-72 lg:w-96 max-w-[85vw] relative">
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.05 }}
                animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                transition={{ duration: 3.5, ease: "easeInOut" }}
                className="w-full origin-center"
              >
                <img 
                  src="/logo.jpg" 
                  alt="Tranquil Logo" 
                  className="w-full h-auto object-contain" 
                />
              </motion.div>
            </div>

            {/* Premium Shimmer Effect */}
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "200%" }}
              transition={{ delay: 2.8, duration: 2.0, ease: "easeInOut" }}
              className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[30deg] opacity-60 pointer-events-none z-10"
            />
          </div>

          {/* Minimalist Luxury Progress Bar */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 4.8, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-full h-[1px] md:h-[2px] bg-rich-black origin-left opacity-30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
