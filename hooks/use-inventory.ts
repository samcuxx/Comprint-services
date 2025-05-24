import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
type InventoryInsert = Database["public"]["Tables"]["inventory"]["Insert"];
type InventoryUpdate = Database["public"]["Tables"]["inventory"]["Update"];

/**
 * Hook to fetch all inventory items with product details
 */
export const useInventory = () => {
  return useQuery<(Inventory & { product: any })[], Error>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(
          `
          *,
          product:product_id (
            id,
            name,
            sku,
            category_id,
            selling_price,
            cost_price,
            image_url,
            is_active
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};

/**
 * Hook to fetch a single inventory item by product ID
 */
export const useInventoryByProductId = (productId: string | undefined) => {
  return useQuery<Inventory, Error>({
    queryKey: ["inventory", "product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("product_id", productId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!productId,
  });
};

/**
 * Hook to fetch a single inventory item by ID
 */
export const useInventoryItem = (id: string | undefined) => {
  return useQuery<Inventory & { product: any }, Error>({
    queryKey: ["inventory", id],
    queryFn: async () => {
      if (!id) throw new Error("Inventory ID is required");

      const { data, error } = await supabase
        .from("inventory")
        .select(
          `
          *,
          product:product_id (
            id,
            name,
            sku,
            category_id,
            selling_price,
            cost_price,
            image_url,
            is_active
          )
        `
        )
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
 * Hook to create a new inventory item
 */
export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInventory: InventoryInsert) => {
      const { data, error } = await supabase
        .from("inventory")
        .insert([newInventory])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

/**
 * Hook to update an existing inventory item
 */
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...inventory
    }: InventoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("inventory")
        .update({
          ...inventory,
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
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.id] });
      if (variables.product_id) {
        queryClient.invalidateQueries({
          queryKey: ["inventory", "product", variables.product_id],
        });
      }
    },
  });
};

/**
 * Hook to delete an inventory item
 */
export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

/**
 * Hook to update inventory stock
 */
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      quantity,
      isRestock = false,
    }: {
      id: string;
      quantity: number;
      isRestock?: boolean;
    }) => {
      // First get the current inventory item
      const { data: currentInventory, error: fetchError } = await supabase
        .from("inventory")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const updateData: InventoryUpdate = {
        quantity: isRestock
          ? (currentInventory.quantity || 0) + quantity
          : quantity,
        updated_at: new Date().toISOString(),
      };

      // If it's a restock, update the last_restock_date
      if (isRestock) {
        updateData.last_restock_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("inventory")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.id] });
    },
  });
};
