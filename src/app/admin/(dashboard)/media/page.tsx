"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Copy, Trash2, UploadCloud, Search, Check, ImageIcon, Video, AlertTriangle, Film } from "lucide-react";
import { toast } from "@/store/useToastStore";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const VIDEO_LIMIT = 6;
const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "ogg", "m4v", "avi"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "heic", "heif"];

function isVideoFile(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.includes(ext);
}

function isImageFile(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.includes(ext);
}

export default function MediaLibraryPage() {
  const supabase = createClient();

  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");
  const [showVideoLimitModal, setShowVideoLimitModal] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const bucketName = "public-assets";

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .storage
      .from(bucketName)
      .list("", {
        limit: 200,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (data) {
      const validFiles = data.filter((f) => f.name !== ".emptyFolderPlaceholder");
      setFiles(validFiles);
    }
    setLoading(false);
  }, [supabase]);;

  const videoFiles = files.filter((f) => isVideoFile(f.name));
  const imageFiles = files.filter((f) => isImageFile(f.name));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const filesToUpload = Array.from(event.target.files);
      let successCount = 0;
      let failCount = 0;

      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is over 10MB`);
          failCount++;
          continue;
        }
        const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
        if (!file.type.startsWith("image/") && !isHeic) {
          failCount++;
          continue;
        }

        let fileToUpload: File = file;
        let fileExt = file.name.split(".").pop() || "jpg";

        if (isHeic) {
          try {
            toast.success(`Converting ${file.name} to JPG...`);
            const heic2any = (await import("heic2any")).default;
            const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg" });
            const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            
            // Create a new file with the original name but .jpg extension
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            fileToUpload = new File([blobToUse], `${originalNameWithoutExt}.jpg`, { type: "image/jpeg" });
            fileExt = "jpg";
          } catch (e) {
            console.error("HEIC conversion error:", e);
            toast.error(`Failed to convert ${file.name}`);
            failCount++;
            continue;
          }
        }

        const fileName = `${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileToUpload, { contentType: fileToUpload.type });

        if (error) {
          failCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) toast.success(`Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}`);
      if (failCount > 0) toast.error(`Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`);
      
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleVideoUploadClick = () => {
    // Refresh count from latest files state
    if (videoFiles.length >= VIDEO_LIMIT) {
      setShowVideoLimitModal(true);
      return;
    }
    videoInputRef.current?.click();
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const filesToUpload = Array.from(event.target.files);
      const spaceLeft = VIDEO_LIMIT - videoFiles.length;

      if (spaceLeft <= 0) {
        setShowVideoLimitModal(true);
        setUploading(false);
        return;
      }

      const filesWeCanUpload = filesToUpload.slice(0, spaceLeft);
      if (filesWeCanUpload.length < filesToUpload.length) {
        toast.error(`You can only upload ${spaceLeft} more video(s). Limit reached.`);
      }

      let successCount = 0;
      let failCount = 0;

      for (const file of filesWeCanUpload) {
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`${file.name} is over 100MB`);
          failCount++;
          continue;
        }
        if (!file.type.startsWith("video/")) {
          failCount++;
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, { contentType: file.type });

        if (error) {
          failCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) toast.success(`Successfully uploaded ${successCount} video(s)`);
      if (failCount > 0) toast.error(`Failed to upload ${failCount} video(s)`);
      
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      const { error } = await supabase.storage.from(bucketName).remove([fileToDelete]);
      if (error) {
        toast.error("Failed to delete. Please try again.");
      } else {
        toast.success("File deleted successfully");
      }
    } catch {
      toast.error("Failed to delete. Please try again.");
    }
    fetchFiles();
    setFileToDelete(null);
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

  const displayFiles = (activeTab === "images" ? imageFiles : videoFiles).filter(
    (f) => f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full">
      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete ${isVideoFile(fileToDelete ?? "") ? "Video" : "Image"}`}
        message="Are you sure you want to delete this file? It will break any links pointing to it. This action cannot be undone."
        confirmText="Delete"
      />

      {/* Video Limit Warning Modal */}
      {showVideoLimitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="font-serif text-2xl text-rich-black mb-2">Video Limit Reached</h2>
            <p className="text-neutral-500 text-sm mb-1">
              You can only store <span className="font-semibold text-rich-black">{VIDEO_LIMIT} videos</span> at a time.
            </p>
            <p className="text-neutral-500 text-sm mb-6">
              You currently have <span className="font-semibold text-amber-600">{videoFiles.length}/{VIDEO_LIMIT}</span> videos uploaded.
              Please delete an existing video before uploading a new one.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowVideoLimitModal(false)}
                className="px-5 py-2.5 text-sm font-medium border border-border-light rounded-sm hover:bg-ivory transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowVideoLimitModal(false);
                  setActiveTab("videos");
                }}
                className="px-5 py-2.5 text-sm font-medium bg-rich-black text-white rounded-sm hover:bg-gold transition-colors"
              >
                Go to Videos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-rich-black mb-1">Media Library</h1>
          <p className="text-neutral-500 text-sm">Manage all uploaded images and videos across your store</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Hidden inputs */}
          <input
            type="file"
            multiple
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*,.heic,.heif"
            className="hidden"
          />
          <input
            type="file"
            multiple
            ref={videoInputRef}
            onChange={handleVideoUpload}
            accept="video/mp4,video/mov,video/webm,video/ogg,video/m4v,video/*"
            className="hidden"
          />

          {/* Upload Image */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-rich-black text-white px-4 py-2.5 text-sm font-medium hover:bg-gold transition-colors rounded-sm disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading && activeTab === "images" ? "Uploading..." : "Upload Image"}
          </button>

          {/* Upload Video */}
          <button
            onClick={handleVideoUploadClick}
            disabled={uploading}
            className="flex items-center gap-2 bg-gold text-white px-4 py-2.5 text-sm font-medium hover:bg-[#b8926b] transition-colors rounded-sm disabled:opacity-50 relative"
          >
            <Film className="w-4 h-4" />
            {uploading && activeTab === "videos" ? "Uploading..." : "Upload Video"}
            {/* Video count badge */}
            <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              videoFiles.length >= VIDEO_LIMIT
                ? "bg-error text-white"
                : videoFiles.length >= VIDEO_LIMIT - 1
                ? "bg-amber-400 text-white"
                : "bg-white/30 text-white"
            }`}>
              {videoFiles.length}/{VIDEO_LIMIT}
            </span>
          </button>
        </div>
      </div>

      {/* Video limit progress bar */}
      {videoFiles.length > 0 && (
        <div className="bg-white border border-border-light rounded-sm px-4 py-3 flex items-center gap-4">
          <Video className="w-4 h-4 text-gold shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
              <span>Video storage</span>
              <span className={videoFiles.length >= VIDEO_LIMIT ? "text-error font-semibold" : "font-medium"}>
                {videoFiles.length} / {VIDEO_LIMIT} videos used
              </span>
            </div>
            <div className="w-full h-1.5 bg-border-light rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  videoFiles.length >= VIDEO_LIMIT
                    ? "bg-error"
                    : videoFiles.length >= VIDEO_LIMIT - 1
                    ? "bg-amber-400"
                    : "bg-gold"
                }`}
                style={{ width: `${Math.min((videoFiles.length / VIDEO_LIMIT) * 100, 100)}%` }}
              />
            </div>
          </div>
          {videoFiles.length >= VIDEO_LIMIT && (
            <span className="text-xs text-error font-medium shrink-0">Limit reached — delete a video to upload more</span>
          )}
        </div>
      )}

      <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
        {/* Tabs + Search toolbar */}
        <div className="p-4 border-b border-border-light flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-ivory p-1 rounded-sm border border-border-light">
            <button
              onClick={() => setActiveTab("images")}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                activeTab === "images"
                  ? "bg-white text-rich-black shadow-sm"
                  : "text-neutral-500 hover:text-rich-black"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Images
              <span className="text-[10px] bg-border-light text-neutral-500 px-1.5 py-0.5 rounded-full font-bold">
                {imageFiles.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                activeTab === "videos"
                  ? "bg-white text-rich-black shadow-sm"
                  : "text-neutral-500 hover:text-rich-black"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Videos
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                videoFiles.length >= VIDEO_LIMIT
                  ? "bg-error/10 text-error"
                  : "bg-border-light text-neutral-500"
              }`}>
                {videoFiles.length}/{VIDEO_LIMIT}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center w-full sm:w-auto bg-ivory px-3 py-2 rounded-sm border border-border-light focus-within:border-gold transition-colors">
            <Search className="w-4 h-4 text-neutral-400 mr-2" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full sm:w-52 text-rich-black placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-16 text-neutral-500">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading media...
            </div>
          ) : displayFiles.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              {activeTab === "images" ? (
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-border-light" />
              ) : (
                <Video className="w-12 h-12 mx-auto mb-3 text-border-light" />
              )}
              <p className="font-medium mb-1">No {activeTab} found</p>
              <p className="text-xs text-neutral-400">
                {search ? `No results for "${search}"` : `Upload your first ${activeTab === "images" ? "image" : "video"} to get started`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayFiles.map((file) => {
                const url = getPublicUrl(file.name);
                const isVideo = isVideoFile(file.name);
                return (
                  <div
                    key={file.id}
                    className="group relative border border-border-light rounded-sm overflow-hidden bg-ivory aspect-square"
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                          onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                          onMouseOut={(e) => {
                            const v = e.currentTarget as HTMLVideoElement;
                            v.pause();
                            v.currentTime = 0;
                          }}
                        />
                        {/* Video badge */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Film className="w-2.5 h-2.5" /> VIDEO
                        </div>
                      </>
                    ) : (
                      <img
                        src={url}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(url, file.id)}
                          className="bg-white p-1.5 rounded-sm text-rich-black hover:text-gold transition-colors"
                          title="Copy URL"
                        >
                          {copiedId === file.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setFileToDelete(file.name)}
                          className="bg-white p-1.5 rounded-sm text-error hover:text-error transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-black/70 px-2 py-1 rounded-sm">
                        <p className="text-white text-[10px] truncate" title={file.name}>
                          {file.name}
                        </p>
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
