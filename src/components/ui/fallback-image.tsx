"use client";

import { useState, type ReactElement } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

interface FallbackImageProps extends Omit<ImageProps, "onError"> {
  /** Custom fallback element — defaults to a generic placeholder */
  readonly fallback?: ReactElement;
}

/**
 * next/image wrapper that shows a fallback UI when the image fails to load.
 * Drop-in replacement: same API as `<Image>` with an optional `fallback` prop.
 */
export default function FallbackImage({
  fallback,
  alt,
  className,
  ...props
}: FallbackImageProps): ReactElement {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      fallback ?? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <ImageOff className="h-5 w-5 text-muted-foreground/40" />
        </div>
      )
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
