"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploader({ value, onChange, label = "Upload Image", className = "" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('public-assets').getPublicUrl(filePath);
      onChange(data.publicUrl);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        onClick={() => !value && !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed border-[#EFEFEF] rounded-sm flex flex-col items-center justify-center text-center transition-colors min-h-[150px] overflow-hidden ${!value ? "hover:bg-[#FAF8F5] cursor-pointer" : ""}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*,video/*" 
          className="hidden" 
        />
        
        {uploading ? (
          <div className="flex flex-col items-center text-[#999999]">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#C7A17A]" />
            <p className="text-sm">Uploading to Supabase...</p>
          </div>
        ) : value ? (
          <div className="relative w-full h-full group">
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
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
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
            <p className="text-sm font-medium text-[#111111]">Click to upload image</p>
            <p className="text-xs text-[#999999] mt-1">SVG, PNG, JPG or GIF</p>
          </div>
        )}
      </div>
    </div>
  );
}
