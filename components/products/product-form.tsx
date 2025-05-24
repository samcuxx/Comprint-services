"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateProduct,
  useUpdateProduct,
  useProduct,
} from "@/hooks/use-products";
import { generateSku } from "@/lib/utils";
import { Database } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";

type Product = Database["public"]["Tables"]["products"]["Row"];

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters").max(50),
  category_id: z.string().uuid().nullable(),
  cost_price: z.coerce.number().positive("Cost price must be positive"),
  selling_price: z.coerce.number().positive("Selling price must be positive"),
  commission_rate: z.coerce
    .number()
    .min(0, "Commission rate must be non-negative")
    .max(100, "Commission rate cannot exceed 100%"),
  image_url: z.string().url().nullable().optional(),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export const ProductForm = ({ productId }: ProductFormProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!productId;

  // Fetch product data if in edit mode
  const { data: product, isLoading: isProductLoading } = useProduct(productId);

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();

  // Mutations for creating and updating products
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Set up form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: generateSku(),
      category_id: null,
      cost_price: 0,
      selling_price: 0,
      commission_rate: 0,
      image_url: null,
      is_active: true,
    },
  });

  // Update form values when product data is loaded
  useEffect(() => {
    if (product && isEditMode) {
      form.reset({
        name: product.name,
        description: product.description || "",
        sku: product.sku,
        category_id: product.category_id,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        commission_rate: product.commission_rate,
        image_url: product.image_url,
        is_active: product.is_active,
      });
      setImageUrl(product.image_url);
    }
  }, [product, form, isEditMode]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      // Include image URL in the data
      const productData = {
        ...data,
        image_url: imageUrl,
      };

      if (isEditMode && productId) {
        // Update existing product
        await updateProductMutation.mutateAsync({
          id: productId,
          ...productData,
        });

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        await createProductMutation.mutateAsync(productData);

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      // Redirect to products page
      router.push("/dashboard/products");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    form.setValue("image_url", url);
  };

  const isLoading =
    isProductLoading ||
    isCategoriesLoading ||
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product SKU"
                      {...field}
                      disabled={isEditMode}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditMode
                      ? "SKU cannot be changed after creation"
                      : "Unique identifier for product"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value || "all"}
                    onValueChange={(value) => field.onChange(value === "all" ? null : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          GHS
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          GHS
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="commission_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Rate (%)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Commission percentage for sales staff
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={imageUrl}
                      onChange={handleImageUpload}
                      onUploading={setIsUploading}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a product image (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Make this product available for sales
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
 