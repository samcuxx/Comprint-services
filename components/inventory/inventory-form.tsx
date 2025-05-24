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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/use-products";
import {
  useCreateInventory,
  useUpdateInventory,
  useInventoryItem,
  useInventoryByProductId,
} from "@/hooks/use-inventory";
import { Database } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { Package, PackageSearch } from "lucide-react";

// Zod schema for inventory validation
const inventorySchema = z.object({
  product_id: z.string().uuid("Please select a product"),
  quantity: z.coerce
    .number()
    .int()
    .nonnegative("Quantity must be 0 or greater"),
  reorder_level: z.coerce
    .number()
    .int()
    .nonnegative("Reorder level must be 0 or greater")
    .optional(),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  inventoryId?: string;
}

export const InventoryForm = ({ inventoryId }: InventoryFormProps) => {
  const [isNewProduct, setIsNewProduct] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!inventoryId;

  // Fetch inventory data if in edit mode
  const { data: inventoryItem, isLoading: isInventoryLoading } =
    useInventoryItem(inventoryId);

  // Fetch products
  const { data: products = [], isLoading: isProductsLoading } = useProducts();

  // Mutations for creating and updating inventory
  const createInventoryMutation = useCreateInventory();
  const updateInventoryMutation = useUpdateInventory();

  // Create a conditional schema based on whether we're in edit mode
  const formSchema = isEditMode
    ? z.object({
        product_id: z.string().optional(), // Optional in edit mode
        quantity: z.coerce
          .number()
          .int()
          .nonnegative("Quantity must be 0 or greater"),
        reorder_level: z.coerce
          .number()
          .int()
          .nonnegative("Reorder level must be 0 or greater")
          .optional(),
      })
    : inventorySchema; // Use original schema for new inventory

  // Set up form with default values
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "",
      quantity: 0,
      reorder_level: 10,
    },
    mode: "onChange",
  });

  // When edit mode changes, reset form validation
  useEffect(() => {
    form.reset(form.getValues());
  }, [isEditMode, form]);

  const selectedProductId = form.watch("product_id");
  const { data: existingInventory, isLoading: isExistingInventoryLoading } =
    useInventoryByProductId(selectedProductId || undefined);

  // Check if the selected product already has inventory
  useEffect(() => {
    if (selectedProductId && !isEditMode && existingInventory) {
      toast({
        variant: "destructive",
        title: "Product Already Has Inventory",
        description:
          "This product already has an inventory record. Please select another product or edit the existing inventory.",
      });
      form.setValue("product_id", "");
    }
  }, [selectedProductId, existingInventory, isEditMode, form, toast]);

  // When in edit mode and inventory data is loaded, reset the form
  // with the loaded data and set form as valid
  useEffect(() => {
    if (inventoryItem && isEditMode) {
      form.reset({
        product_id: inventoryItem.product_id,
        quantity: inventoryItem.quantity || 0,
        reorder_level: inventoryItem.reorder_level || 10,
      });

      // This triggers validation after setting values
      form.trigger();
    }
  }, [inventoryItem, form, isEditMode]);

  const onSubmit = async (data: InventoryFormValues) => {
    try {
      if (isEditMode && inventoryId) {
        // Update existing inventory - only update quantity and reorder_level
        await updateInventoryMutation.mutateAsync({
          id: inventoryId,
          quantity: data.quantity,
          reorder_level: data.reorder_level,
        });

        toast({
          title: "Success",
          description: "Inventory updated successfully",
        });
      } else {
        // Create new inventory
        await createInventoryMutation.mutateAsync(data);

        toast({
          title: "Success",
          description: "Inventory created successfully",
        });
      }

      // Redirect to inventory page
      router.push("/dashboard/inventory");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const isLoading =
    isInventoryLoading ||
    isProductsLoading ||
    isExistingInventoryLoading ||
    createInventoryMutation.isPending ||
    updateInventoryMutation.isPending;

  // Filter out products that already have inventory (for new inventory creation)
  const availableProducts = isEditMode
    ? products
    : products.filter(
        (product) =>
          !existingInventory || product.id !== existingInventory.product_id
      );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isEditMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableProducts.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        <PackageSearch className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                        <p>No available products found</p>
                        <p className="text-xs">
                          All products already have inventory
                        </p>
                      </div>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="mr-2 h-6 w-6 rounded-sm object-cover"
                              />
                            ) : (
                              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            )}
                            <span>
                              {product.name} ({product.sku})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {isEditMode && inventoryItem?.product && (
                  <div className="mt-2 flex items-center rounded-md border p-2">
                    {inventoryItem.product.image_url ? (
                      <img
                        src={inventoryItem.product.image_url}
                        alt={inventoryItem.product.name}
                        className="mr-2 h-10 w-10 rounded-sm object-cover"
                      />
                    ) : (
                      <Package className="mr-2 h-6 w-6 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        {inventoryItem.product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {inventoryItem.product.sku}
                      </p>
                    </div>
                  </div>
                )}
                <FormDescription>
                  {isEditMode
                    ? "Product cannot be changed after inventory is created"
                    : "Select a product to manage inventory for"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Current stock quantity</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reorder_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="10"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Alert when stock falls below this level
                  </FormDescription>
                  <FormMessage />
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
          <Button
            type="submit"
            disabled={isLoading || availableProducts.length === 0}
          >
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Inventory"
              : "Create Inventory"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
