import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Category = Database["public"]["Tables"]["product_categories"]["Row"];

/**
 * Hook to fetch all product categories
 */
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};

/**
 * Hook to fetch a single product category by ID
 */
export const useCategory = (id: string | undefined) => {
  return useQuery<Category, Error>({
    queryKey: ["categories", id],
    queryFn: async () => {
      if (!id) throw new Error("Category ID is required");

      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new product category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newCategory: Omit<Category, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("product_categories")
        .insert([newCategory])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Hook to update an existing product category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...category
    }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("product_categories")
        .update({
          ...category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", variables.id] });
    },
  });
};

/**
 * Hook to delete a product category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_categories")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
