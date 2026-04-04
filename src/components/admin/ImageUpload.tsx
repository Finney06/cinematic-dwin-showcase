import { useCallback, useState } from "react";
import { uploadFile } from "@/lib/adminApi";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  previewType?: "image" | "video" | "auto";
}

const isVideoUrl = (url: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

const ImageUpload = ({
  value,
  onChange,
  label = "Image",
  accept = "image/*",
  previewType = "auto",
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const shouldPreviewVideo =
    previewType === "video" ||
    (previewType === "auto" && (accept.includes("video") || isVideoUrl(value)));

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const result = await uploadFile(file);
        onChange(result.url);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium">
        {label}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-white/40 bg-white/[0.04]"
            : "border-white/[0.08] hover:border-white/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = accept;
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        {uploading ? (
          <div className="py-8 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            <span className="text-xs text-white/30">Uploading...</span>
          </div>
        ) : value ? (
          <div className="relative group">
            {shouldPreviewVideo ? (
              <video
                src={value}
                className="max-h-40 mx-auto rounded object-cover"
                muted
                playsInline
                controls
              />
            ) : (
              <img
                src={value}
                alt={label}
                className="max-h-40 mx-auto rounded object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
              <span className="text-xs text-white/70">Click to change</span>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16V4m0 0l-4 4m4-4l4 4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
              />
            </svg>
            <span className="text-xs text-white/30">
              Drop file here or click to upload
            </span>
          </div>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste URL..."
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
      />
    </div>
  );
};

export default ImageUpload;
