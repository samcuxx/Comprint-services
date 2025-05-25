import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];
type SaleInsert = Database["public"]["Tables"]["sales"]["Insert"];
type SaleUpdate = Database["public"]["Tables"]["sales"]["Update"];

type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
type SaleItemInsert = Database["public"]["Tables"]["sale_items"]["Insert"];

export interface SaleWithItems extends Sale {
  items?: (SaleItem & { product: any })[];
  customer?: Database["public"]["Tables"]["customers"]["Row"];
  sales_person?: Database["public"]["Tables"]["users"]["Row"];
}

/**
 * Hook to fetch all sales
 */
export const useSales = (
  filters: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    salesPersonId?: string;
    status?: string;
  } = {}
) => {
  return useQuery<SaleWithItems[], Error>({
    queryKey: ["sales", filters],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select(
          `
          *,
          customer:customer_id (*),
          sales_person:sales_person_id (*)
        `
        )
        .order("sale_date", { ascending: false });

      // Apply filters if they exist
      if (filters.startDate) {
        query = query.gte("sale_date", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("sale_date", filters.endDate);
      }
      if (filters.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      if (filters.salesPersonId) {
        query = query.eq("sales_person_id", filters.salesPersonId);
      }
      if (filters.status) {
        query = query.eq("payment_status", filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};

/**
 * Hook to fetch a single sale with items
 */
export const useSale = (id: string | undefined) => {
  return useQuery<SaleWithItems, Error>({
    queryKey: ["sales", id],
    queryFn: async () => {
      if (!id) throw new Error("Sale ID is required");

      // Fetch the sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select(
          `
          *,
          customer:customer_id (*),
          sales_person:sales_person_id (*)
        `
        )
        .eq("id", id)
        .single();

      if (saleError) {
        throw new Error(saleError.message);
      }

      // Fetch the sale items with product details
      const { data: items, error: itemsError } = await supabase
        .from("sale_items")
        .select(
          `
          *,
          product:product_id (*)
        `
        )
        .eq("sale_id", id)
        .order("created_at", { ascending: true });

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      return {
        ...sale,
        items: items || [],
      };
    },
    enabled: !!id,
  });
};

/**
 * Generate a unique invoice number
 */
export const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const prefix = `INV-${year}${month}${day}-`;

  // Get the latest invoice number with the same prefix
  const { data, error } = await supabase
    .from("sales")
    .select("invoice_number")
    .ilike("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);

  let sequenceNumber = 1;

  if (!error && data && data.length > 0) {
    // Extract the sequence number from the latest invoice number
    const latestInvoice = data[0].invoice_number;
    const latestSequence = parseInt(latestInvoice.split("-")[2], 10);
    sequenceNumber = isNaN(latestSequence) ? 1 : latestSequence + 1;
  }

  return `${prefix}${sequenceNumber.toString().padStart(4, "0")}`;
};

/**
 * Hook to create a new sale with items
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sale,
      saleItems,
    }: {
      sale: SaleInsert;
      saleItems: SaleItemInsert[];
    }) => {
      // Start a transaction to ensure data consistency
      const { data: newSale, error: saleError } = await supabase
        .from("sales")
        .insert([sale])
        .select()
        .single();

      if (saleError) {
        throw new Error(saleError.message);
      }

      // Add the sale_id to each item
      const itemsWithSaleId = saleItems.map((item) => ({
        ...item,
        sale_id: newSale.id,
      }));

      // Insert the sale items
      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(itemsWithSaleId);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      return newSale;
    },
    onSuccess: () => {
      // Invalidate sales cache
      queryClient.invalidateQueries({ queryKey: ["sales"] });

      // Invalidate commissions cache since database trigger creates commission records
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["commissions-summary"] });
      queryClient.invalidateQueries({ queryKey: ["commission-stats"] });
    },
  });
};

/**
 * Hook to update an existing sale
 */
export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...sale }: SaleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("sales")
        .update({
          ...sale,
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
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales", variables.id] });
    },
  });
};

/**
 * Hook to delete a sale and its items
 */
export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Sale items will be deleted automatically due to CASCADE
      const { error } = await supabase.from("sales").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate sales cache
      queryClient.invalidateQueries({ queryKey: ["sales"] });

      // Invalidate commissions cache since associated commission is deleted
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["commissions-summary"] });
      queryClient.invalidateQueries({ queryKey: ["commission-stats"] });
    },
  });
};

/**
 * Hook to get products with inventory for sale creation
 */
export const useProductsWithInventory = () => {
  return useQuery<any[], Error>({
    queryKey: ["products-with-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:category_id (id, name),
          inventory:inventory!product_id (id, quantity, reorder_level)
        `
        )
        .eq("is_active", true)
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      // Filter products that have inventory and quantity > 0
      return (
        data?.filter(
          (product) =>
            product.inventory &&
            product.inventory.length > 0 &&
            product.inventory[0].quantity > 0
        ) || []
      );
    },
  });
};

/**
 * Hook to get all sales persons (users with role 'sales')
 */
export const useSalesPersons = () => {
  return useQuery<Database["public"]["Tables"]["users"]["Row"][], Error>({
    queryKey: ["sales-persons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "sales")
        .eq("is_active", true)
        .order("full_name");

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};
