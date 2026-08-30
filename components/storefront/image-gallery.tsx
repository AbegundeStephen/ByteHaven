"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: { url: string }[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center rounded-xl">
        No image available
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div>
      <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-xl">
        <Image
          src={active.url}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
              }
              aria-label="Previous image"
              className="bg-background/80 hover:bg-background absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-2 shadow"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
              }
              aria-label="Next image"
              className="bg-background/80 hover:bg-background absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 shadow"
            >
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                i === activeIndex ? "border-secondary" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
