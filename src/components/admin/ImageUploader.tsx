"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { MediaSelectorModal } from "./MediaSelectorModal";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploader({ value, onChange, label = "Upload Image", className = "" }: ImageUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const baseUrl = url.split('?')[0];
    return baseUrl.match(/\.(mp4|mov|webm|ogg|m4v)$/i) !== null;
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="flex items-center gap-2 text-sm font-medium text-[#111111] mb-2">
        {label}
      </label>
      
      <div 
        onClick={() => !value && setIsModalOpen(true)}
        className={`relative border-2 border-dashed border-[#EFEFEF] rounded-sm flex flex-col items-center justify-center text-center transition-colors aspect-square w-full overflow-hidden ${!value ? "hover:bg-[#FAF8F5] cursor-pointer" : ""}`}
      >
        {value ? (
          <div className="relative w-full h-full flex-1 group">
            {isVideo(value) ? (
              <video 
                src={value} 
                muted 
                loop 
                playsInline
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={value} 
                alt="Uploaded Preview" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                className="bg-white text-black px-4 py-2 text-sm font-medium rounded-sm hover:bg-[#FAF8F5] transition-colors"
              >
                Change
              </button>
              <button 
                onClick={handleRemove}
                className="bg-red-500 text-white px-4 py-2 text-sm font-medium rounded-sm hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <UploadCloud className="w-8 h-8 text-[#C7A17A] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#111111]">Click to select or upload media</p>
            <p className="text-xs text-[#999999] mt-1">From Media Library or Computer</p>
          </div>
        )}
      </div>

      <MediaSelectorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
}
