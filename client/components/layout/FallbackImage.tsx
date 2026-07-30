"use client";

import { useState } from "react";

interface FallbackImageProps {
  src?: string;
  fallback: string;
  alt: string;
  className?: string;
}

export function FallbackImage({
  src,
  fallback,
  alt,
  className,
}: FallbackImageProps) {
  const [imageSrc, setImageSrc] = useState(src || fallback);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setImageSrc(fallback)}
    />
  );
}
