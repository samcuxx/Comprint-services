"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onUploading: (isUploading: boolean) => void;
}

export const ImageUpload = ({
  value,
  onChange,
  onUploading,
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      onUploading(true);

      // Check file type
      if (!file.type.includes("image")) {
        throw new Error("Please upload an image file");
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB");
      }

      // Create a preview URL
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Generate a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        if (
          uploadError.message.includes("Bucket not found") ||
          uploadError.message.includes("404")
        ) {
          const errorMsg =
            "Storage bucket not configured. Please contact the administrator.";
          toast({
            title: "Storage Error",
            description: errorMsg,
            variant: "destructive",
          });
          throw new Error(errorMsg);
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Keep the file preview if there was an error with the storage, not with the file itself
      if (
        !preview ||
        (error instanceof Error && error.message.includes("file"))
      ) {
        setPreview(null);
      }
    } finally {
      setIsUploading(false);
      onUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    setError(null);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        {preview ? (
          <div className="relative w-40 h-40 overflow-hidden rounded-md aspect-square">
            <Image
              src={preview}
              alt="Product image"
              fill
              className="object-cover"
              sizes="160px"
            />
            {!isUploading && (
              <button
                className="absolute p-1 text-white rounded-full shadow-sm right-2 top-2 bg-rose-500 hover:bg-rose-600"
                type="button"
                onClick={handleRemove}
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-40 h-40 p-4 text-center border border-dashed rounded-md">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Uploading...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <p className="mt-2 text-xs text-destructive">{error}</p>
              </div>
            ) : (
              <>
                <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload image
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {!isUploading && (
        <div className="flex justify-center">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
            id="imageUpload"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("imageUpload")?.click()}
            disabled={isUploading}
            type="button"
          >
            {preview ? "Change image" : error ? "Try again" : "Upload image"}
          </Button>
        </div>
      )}
    </div>
  );
};
