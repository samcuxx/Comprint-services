"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Branch } from "@/lib/types";

const QUERY_KEY = "branches";

// Get all branches
export function useBranches() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      return data as Branch[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get a single branch by ID
export function useBranch(branchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, branchId],
    queryFn: async () => {
      if (!branchId) return null;

      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();

      if (error) {
        throw error;
      }

      return data as Branch;
    },
    enabled: !!branchId, // Only run query if branchId exists
  });
}

// Create branch
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchData: Omit<Branch, "id">) => {
      const { data, error } = await supabase
        .from("branches")
        .insert(branchData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the branches query
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update branch
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      branchId,
      branchData,
    }: {
      branchId: string;
      branchData: Partial<Branch>;
    }) => {
      const { data, error } = await supabase
        .from("branches")
        .update(branchData)
        .eq("id", branchId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the branches queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.branchId],
      });
    },
  });
}

// Delete branch
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchId: string) => {
      // Use the API route for deletion since it might have complex logic
      const response = await fetch(`/api/branches/${branchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete branch");
      }

      return branchId;
    },
    onSuccess: () => {
      // Invalidate and refetch the branches query
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
