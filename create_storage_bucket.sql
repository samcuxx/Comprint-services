-- SQL script to create a storage bucket for product images in Supabase

-- Create the storage bucket for images
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('images', 'images', true, false);

-- Set RLS (Row Level Security) policies for the bucket
-- Allow public access to read images (important for displaying images on your site)
CREATE POLICY "Public Access for Images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload images to the products folder
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'products'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'products'
) 
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'products'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'products'
);

-- Create a database function to clean up orphaned images when a product is deleted
CREATE OR REPLACE FUNCTION delete_product_image() RETURNS TRIGGER AS $$
BEGIN
  -- If the product had an image_url, extract the filename and delete it from storage
  IF OLD.image_url IS NOT NULL THEN
    -- Extract filename from the URL - this is dependent on your URL structure
    -- Assuming the URL looks like: https://[supabase-project].supabase.co/storage/v1/object/public/images/products/[filename]
    -- We need to extract products/[filename] part
    DECLARE
      filename TEXT;
    BEGIN
      filename := substring(OLD.image_url from '.*images/(.*)');
      IF filename IS NOT NULL THEN
        -- Call Supabase storage API to delete the file
        PERFORM pg_sleep(0.1); -- Add a small delay to prevent race conditions
        DELETE FROM storage.objects
        WHERE bucket_id = 'images' AND name = filename;
      END IF;
    END;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to clean up images when products are deleted
DROP TRIGGER IF EXISTS trigger_delete_product_image ON public.products;
CREATE TRIGGER trigger_delete_product_image
AFTER DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION delete_product_image(); 