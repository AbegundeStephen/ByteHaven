"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export interface ImageEntry {
  url: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    if (images.length + files.length > 12) {
      setError("Maximum 12 images per product.");
      return;
    }

    setUploading(true);
    const uploaded: ImageEntry[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Failed to upload ${file.name}`);
        continue;
      }
      const data = await res.json();
      uploaded.push({ url: data.url, isPrimary: false });
    }
    setUploading(false);

    if (uploaded.length === 0) return;
    const next = [...images, ...uploaded];
    if (!next.some((img) => img.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      void uploadFiles(e.dataTransfer.files);
    }
  }

  function setPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  function remove(index: number) {
    const wasPrimary = images[index].isPrimary;
    const next = images.filter((_, i) => i !== index);
    if (wasPrimary && next.length > 0) next[0].isPrimary = true;
    onChange(next);
  }

  function move(index: number, direction: "left" | "right") {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center text-sm transition-colors ${
          dragOver ? "border-secondary bg-secondary/5" : "border-border"
        }`}
      >
        <p className="text-muted-foreground">
          Drag and drop images here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-secondary font-medium underline"
          >
            browse
          </button>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          JPEG, PNG, WebP, or GIF — up to 5MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploading && <p className="text-muted-foreground text-sm">Uploading…</p>}
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.url}
              className="border-border relative overflow-hidden rounded-lg border"
            >
              <Image
                src={img.url}
                alt=""
                width={160}
                height={120}
                className="h-28 w-full object-cover"
                unoptimized
              />
              {img.isPrimary && (
                <span className="bg-accent text-accent-foreground absolute top-1 left-1 rounded-full px-2 py-0.5 text-xs font-medium">
                  Cover
                </span>
              )}
              <div className="bg-card flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, "left")}
                    disabled={i === 0}
                    className="border-input rounded border px-1.5 text-xs disabled:opacity-30"
                    aria-label="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, "right")}
                    disabled={i === images.length - 1}
                    className="border-input rounded border px-1.5 text-xs disabled:opacity-30"
                    aria-label="Move right"
                  >
                    →
                  </button>
                </div>
                <div className="flex gap-1">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      className="border-input rounded border px-1.5 text-xs"
                    >
                      Set cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="border-destructive text-destructive rounded border px-1.5 text-xs"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
