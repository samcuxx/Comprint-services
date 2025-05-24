"use client";

import { useState, useEffect } from "react";

interface UseLazyImageProps {
  src: string;
  fallbackSrc?: string;
}

interface UseLazyImageReturn {
  currentSrc: string;
  isLoading: boolean;
  error: boolean;
}

/**
 * A hook for lazy loading images with loading and error states
 */
export function useLazyImage({
  src,
  fallbackSrc = "/placeholder.png",
}: UseLazyImageProps): UseLazyImageReturn {
  const [currentSrc, setCurrentSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);

    // Skip loading if src is empty or undefined
    if (!src) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // Create a new image element to load the image in background
    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setCurrentSrc(fallbackSrc);
      setError(true);
      setIsLoading(false);
    };

    img.src = src;

    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return { currentSrc, isLoading, error };
}
