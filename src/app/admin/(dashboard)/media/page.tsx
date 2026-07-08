"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, Trash2, UploadCloud, Search, Check, ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "@/store/useToastStore";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function MediaLibraryPage() {
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);
const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bucketName = "public-assets";

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      
    if (data) {
      // Filter out any hidden/empty placeholder files
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { contentType: file.type || 'image/jpeg' });

      if (uploadError) throw uploadError;
      
      fetchFiles();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      const { data, error } = await supabase.storage.from(bucketName).remove([imageToDelete]);
      if (error) {
        toast.error("Failed to delete: " + error.message);
      } else {
        toast.success("Image deleted successfully");
      }
    } catch (err: any) {
      toast.error("Error deleting image: " + err.message);
    }
    fetchFiles();
    setImageToDelete(null);
  };

  const handleDelete = (fileName: string) => {
    setImageToDelete(fileName);
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-full">
            <ConfirmModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? It will break any links pointing to it. This action cannot be undone."
        confirmText="Delete"
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#111111] mb-1">Media Library</h1>
          <p className="text-[#666666] text-sm">Manage all uploaded images across your store</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" /> 
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center">
          <div className="flex items-center w-full sm:w-auto bg-[#FAF8F5] px-3 py-2 rounded-sm border border-[#EFEFEF] focus-within:border-[#C7A17A] transition-colors">
            <Search className="w-4 h-4 text-[#999999] mr-2" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-64 text-[#111111] placeholder:text-[#999999]"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-[#666666]">Loading media...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-[#666666]">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-[#EFEFEF]" />
              <p>No media files found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const url = getPublicUrl(file.name);
                return (
                  <div key={file.id} className="group relative border border-[#EFEFEF] rounded-sm overflow-hidden bg-[#FAF8F5] aspect-square">
                    <img 
                      src={url} 
                      alt={file.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => copyToClipboard(url, file.id)}
                          className="bg-white p-1.5 rounded-sm text-[#111111] hover:text-[#C7A17A] transition-colors"
                          title="Copy URL"
                        >
                          {copiedId === file.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(file.name)}
                          className="bg-white p-1.5 rounded-sm text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-black/70 px-2 py-1 rounded-sm">
                        <p className="text-white text-[10px] truncate" title={file.name}>{file.name}</p>
                      </div>
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
