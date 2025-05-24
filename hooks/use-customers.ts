import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

/**
 * Hook to fetch all customers
 */
export const useCustomers = (query: string = "") => {
  return useQuery<Customer[], Error>({
    queryKey: ["customers", query],
    queryFn: async () => {
      let supabaseQuery = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (query) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`
        );
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};

/**
 * Hook to fetch a single customer
 */
export const useCustomer = (id: string | undefined) => {
  return useQuery<Customer, Error>({
    queryKey: ["customers", id],
    queryFn: async () => {
      if (!id) throw new Error("Customer ID is required");

      const { data, error } = await supabase
        .from("customers")
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
 * Hook to create a new customer
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCustomer: CustomerInsert) => {
      const { data, error } = await supabase
        .from("customers")
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

/**
 * Hook to update an existing customer
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...customer
    }: CustomerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("customers")
        .update({
          ...customer,
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
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
  });
};

/**
 * Hook to delete a customer
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
