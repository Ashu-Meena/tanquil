"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface LookbookItem {
  id: string | number;
  url: string;
  height: string;
  link: string;
}

const defaultItems: LookbookItem[] = [
  { id: 'def-1', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600', link: 'https://instagram.com/tranquil.co.in', height: 'h-[400px]' },
  { id: 'def-2', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600', link: 'https://instagram.com/tranquil.co.in', height: 'h-[500px]' },
  { id: 'def-3', url: 'https://images.unsplash.com/photo-1550614000-4b95d46664d3?q=80&w=600', link: 'https://instagram.com/tranquil.co.in', height: 'h-[400px]' },
  { id: 'def-4', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600', link: 'https://instagram.com/tranquil.co.in', height: 'h-[500px]' },
];

const isVideo = (url: string) => {
  if (!url) return false;
  const baseUrl = url.split('?')[0];
  return baseUrl.match(/\.(mp4|mov|webm|ogg|m4v)$/i) !== null;
};

const isInstagramPost = (url: string) => {
  if (!url) return false;
  return url.includes('instagram.com/p/') || url.includes('instagram.com/reel/');
};

const MediaItem = ({ item, index }: { item: LookbookItem, index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const video = isVideo(item.url);
  const isInstaPost = isInstagramPost(item.url);

  const handleMouseEnter = () => {
    // We autoPlay now, so no need to play on hover
  };

  const handleMouseLeave = () => {
    // Keep playing
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className={`relative group overflow-hidden break-inside-avoid aspect-[9/16] w-[75vw] sm:w-[45vw] lg:w-full flex-shrink-0 snap-center bg-neutral-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 ease-out ${index % 2 !== 0 ? 'lg:translate-y-12' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isInstaPost ? (
        <iframe
          src={`${item.url}${item.url.endsWith('/') ? '' : '/'}embed`}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          scrolling="no"
          allowTransparency
        />
      ) : video ? (
        <>
          <video
            ref={videoRef}
            src={item.url}
            muted={isMuted}
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
          <button 
            onClick={toggleMute}
            className="absolute top-6 right-6 z-20 bg-white/20 backdrop-blur-md p-3 rounded-full text-white md:hidden hover:bg-white/40 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </>
      ) : (
        <Image 
          src={item.url}
          alt={`Lookbook ${item.id}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        />
      )}

      {/* Floating Instagram Overlay */}
      <a
        href={item.link !== 'https://instagram.com/tranquil.co.in' ? item.link : item.url}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center z-10"
        aria-label={`View on Instagram`}
      >
        <div className="bg-white/90 backdrop-blur-sm text-rich-black hover:bg-gold hover:text-white rounded-full p-5 shadow-xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
          <InstagramIcon className="w-6 h-6" />
        </div>
      </a>
    </motion.div>
  );
};

export default function Lookbook({ items }: { items?: LookbookItem[] }) {
  const displayItems = items && items.length > 0 ? items : defaultItems;
  return (
    <section className="py-20 md:py-32 bg-ivory overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-5xl lg:text-6xl text-rich-black mb-6 flex justify-center items-center gap-4"
          >
            <InstagramIcon className="w-8 h-8 md:w-12 md:h-12 text-gold" />
            Join The Journey
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 uppercase tracking-[0.2em] text-sm font-medium"
          >
            @tranquil.co.in
          </motion.p>
        </div>

        {/* Staggered Layout */}
        <div className="flex overflow-x-auto gap-6 pb-12 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-16 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {displayItems.map((item, index) => (
            <MediaItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
