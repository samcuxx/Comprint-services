"use client";

import { ImgHTMLAttributes } from "react";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspectRatio?: string;
  wrapperClassName?: string;
}

export function OptimizedImage({
  src,
  alt = "",
  className,
  fallbackSrc = "/placeholder.png",
  aspectRatio = "aspect-square",
  wrapperClassName,
  ...props
}: OptimizedImageProps) {
  const { currentSrc, isLoading, error } = useLazyImage({
    src: src || "",
    fallbackSrc,
  });

  return (
    <div
      className={cn("relative overflow-hidden", aspectRatio, wrapperClassName)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-all",
          {
            "opacity-80": error,
            "scale-105 blur-sm": isLoading,
          },
          className
        )}
        {...props}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-sm text-muted-foreground">
            Failed to load image
          </span>
        </div>
      )}
    </div>
  );
}
