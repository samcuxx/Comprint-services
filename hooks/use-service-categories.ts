import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ServiceCategory } from "@/lib/database.types";
import { toast } from "sonner";

export const useServiceCategories = () => {
  return useQuery<ServiceCategory[], Error>({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 300000, // 5 minutes
  });
};

export const useServiceCategory = (id: string) => {
  return useQuery<ServiceCategory | null, Error>({
    queryKey: ["service-category", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!id,
  });
};

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      categoryData: Omit<ServiceCategory, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("service_categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      toast.success("Service category created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create service category: ${error.message}`);
    },
  });
};

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ServiceCategory>;
    }) => {
      const { data, error } = await supabase
        .from("service_categories")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["service-category", data.id],
      });
      toast.success("Service category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update service category: ${error.message}`);
    },
  });
};

export const useDeleteServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from("service_categories")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      toast.success("Service category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete service category: ${error.message}`);
    },
  });
};
