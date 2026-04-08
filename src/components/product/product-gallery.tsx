"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  mainImage,
  gallery,
  name,
}: {
  mainImage: string;
  gallery: string[];
  name: string;
}) {
  const allImages = [mainImage, ...gallery.filter((url) => url !== mainImage)];
  const [activeImage, setActiveImage] = useState(allImages[0]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
        <Image
          src={activeImage}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {allImages.slice(0, 5).map((image) => (
          <button
            type="button"
            key={image}
            className={`relative aspect-square overflow-hidden rounded-xl border ${
              activeImage === image ? "border-primary" : "border-border"
            }`}
            onClick={() => setActiveImage(image)}
          >
            <Image
              src={image}
              alt={name}
              fill
              unoptimized
              sizes="20vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
