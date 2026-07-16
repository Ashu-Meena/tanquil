"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { UploadCloud, Search, ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "@/store/useToastStore";

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaSelectorModal({ isOpen, onClose, onSelect }: MediaSelectorModalProps) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bucketName = "public-assets";

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/immutability
      fetchFiles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchFiles = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      
    if (data) {
      const validFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder');
      setFiles(validFiles);
    }
    setLoading(false);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        setUploading(false);
        return;
      }

      // Validate file type
      const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
      const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm|ogg|m4v)$/i);
      
      if (!file.type.startsWith('image/') && !isHeic && !isVideo) {
        toast.error("Invalid file format");
        setUploading(false);
        return;
      }
      let fileToUpload: File = file;
      let fileExt = file.name.split('.').pop() || "jpg";

      if (isHeic) {
        try {
          toast.success(`Converting ${file.name} to JPG...`);
          const heic2any = (await import("heic2any")).default;
          const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg" });
          const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          
          const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          fileToUpload = new File([blobToUse], `${originalNameWithoutExt}.jpg`, { type: "image/jpeg" });
          fileExt = "jpg";
        } catch (e) {
          console.error("HEIC conversion error:", e);
          toast.error(`Failed to convert ${file.name}`);
          setUploading(false);
          return;
        }
      }

      // eslint-disable-next-line react-hooks/purity
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, { contentType: fileToUpload.type || 'image/jpeg' });

      if (uploadError) throw uploadError;
      
      // Auto-select the newly uploaded file
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      onSelect(data.publicUrl);
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to complete operation. Please try again or check the logs.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-ivory rounded-sm shadow-2xl max-w-5xl w-full h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white p-4 border-b border-border-light flex justify-between items-center shrink-0">
          <h2 className="font-serif text-2xl text-rich-black">Select Media</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-rich-black transition-colors p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 border-b border-border-light flex justify-between items-center shrink-0">
          <div className="flex items-center w-full sm:w-auto bg-ivory px-3 py-2 rounded-sm border border-border-light focus-within:border-gold transition-colors">
            <Search className="w-4 h-4 text-neutral-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-rich-black placeholder:text-neutral-400"
            />
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              accept="image/*,video/*,.heic,.heif" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-rich-black text-white px-4 py-2.5 text-sm font-medium hover:bg-gold transition-colors rounded-sm disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> 
                  Upload New
                </>
              )}
            </button>
          </div>
        </div>

        {/* Paste URL Section */}
        <PasteUrlSection onSelect={onSelect} onClose={onClose} />

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-ivory">
          {loading ? (
            <div className="flex h-full items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-neutral-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-border-light" />
              <p>No media files found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const url = getPublicUrl(file.name);
                const isVideo = url.match(/\.(mp4|mov|webm|ogg|m4v)$/i) !== null;
                return (
                  <div 
                    key={file.id} 
                    onClick={() => {
                      onSelect(url);
                      onClose();
                    }}
                    className="group relative border border-border-light rounded-sm overflow-hidden bg-white aspect-square cursor-pointer hover:border-gold transition-colors"
                  >
                    {isVideo ? (
                      <video src={url} className="w-full h-full object-cover" muted />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={url} 
                        alt={file.name} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] truncate" title={file.name}>{file.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function PasteUrlSection({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleUse = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onSelect(trimmed);
    onClose();
  };

  return (
    <div className="bg-white border-b border-border-light px-4 shrink-0">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between py-3 text-sm text-neutral-500 hover:text-rich-black transition-colors"
      >
        <span className="font-medium">Or paste an image URL</span>
        <span className="text-xs text-neutral-400">{expanded ? "▲ Hide" : "▼ Show"}</span>
      </button>
      {expanded && (
        <div className="pb-4 flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUse()}
            placeholder="/images/placeholder-landscape.jpg"
            className="flex-1 border border-border-light px-3 py-2 text-sm focus:outline-none focus:border-gold rounded-sm transition-colors"
            autoFocus
          />
          <button
            onClick={handleUse}
            disabled={!url.trim()}
            className="bg-gold text-white px-4 py-2 text-sm font-medium rounded-sm hover:bg-[#b8926b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Use URL
          </button>
        </div>
      )}
    </div>
  );
}
