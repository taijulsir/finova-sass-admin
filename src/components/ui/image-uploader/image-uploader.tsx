"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

/**
 * ImageUploader
 *
 * - Shows a local preview instantly when the user picks a file. NO network call.
 * - Calls onChange(File) so the parent form holds the pending File object.
 * - When the form submits, call resolveAvatar(value) to upload and get back a URL.
 */

interface ImageUploaderProps {
  /** Committed CDN URL already uploaded, OR a File object pending upload */
  value?: File | string | null;
  /**
   * Called with a File when the user picks a new image.
   * Called with undefined when the user removes the image.
   */
  onChange: (fileOrUrl: File | string | undefined) => void;
  folder?: string;
  width?: number;
  height?: number;
  className?: string;
  shape?: "circle" | "square";
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "general",   // kept for resolveAvatar context — not used in component itself
  width = 500,          // kept for resolveAvatar context
  height = 500,         // kept for resolveAvatar context
  className,
  shape = "square",
  label = "Upload Image",
}: ImageUploaderProps) {
  /** Local data-URL for the newly picked file (shown immediately, no upload) */
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When parent resets value to empty/null, clear local preview too
  React.useEffect(() => {
    if (!value) setLocalPreview(null);
  }, [value]);

  // What to display: local blob preview > committed CDN string > nothing
  const displayPreview =
    localPreview ?? (typeof value === "string" ? value : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview — zero network calls here
    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Hand the raw File to the form so it can upload on submit
    onChange(file);
  };

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLocalPreview(null);
      onChange(undefined);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onChange]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      )}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-center overflow-hidden bg-muted/30 group",
          shape === "circle"
            ? "rounded-full aspect-square w-32"
            : "rounded-xl aspect-video w-full max-w-sm"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {displayPreview ? (
          <>
            <img
              src={displayPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-red-500 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
            <Upload className="h-8 w-8" />
            <span className="text-xs text-center">Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload helper — call ONLY inside the form's onSubmit handler
// ---------------------------------------------------------------------------

/**
 * If value is a File (newly picked), upload it and return the CDN URL.
 * If value is already a string URL (unchanged), return it as-is.
 * If value is undefined/null/empty, return "".
 */
export async function resolveAvatar(
  value: File | string | undefined | null,
  folder = "general",
  width = 400,
  height = 400
): Promise<string> {
  if (!value) return "";
  if (typeof value === "string") return value;

  // It's a File — upload now
  const { useAuthStore: store } = await import("@/lib/store");
  const token = store.getState().token;

  const formData = new FormData();
  formData.append("image", value);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const res = await fetch(
    `${apiBase}/upload/image?folder=${folder}&width=${width}&height=${height}`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }
  );

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Image upload failed");
  }

  return json.data.url as string;
}
