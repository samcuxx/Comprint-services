"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

type Category = Database["public"]["Tables"]["product_categories"]["Row"];

// Zod schema for category validation
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded?: () => void;
  onCategoryUpdated?: () => void;
}

export const CategoryModal = ({
  category,
  isOpen,
  onClose,
  onCategoryAdded,
  onCategoryUpdated,
}: CategoryModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode && category) {
        // Update existing category
        const { error } = await supabase
          .from("product_categories")
          .update({
            name: data.name,
            description: data.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", category.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category updated successfully",
        });

        onCategoryUpdated?.();
      } else {
        // Create new category
        const { error } = await supabase.from("product_categories").insert([
          {
            name: data.name,
            description: data.description,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category created successfully",
        });

        onCategoryAdded?.();
      }

      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of this product category."
              : "Create a new product category."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Category description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
