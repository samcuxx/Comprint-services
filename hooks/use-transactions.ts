"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/lib/types";

const QUERY_KEY = "transactions";

// Get all transactions
export function useTransactions() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Transaction[];
    },
  });
}

// Get transactions by user ID
export function useUserTransactions(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "user", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Transaction[];
    },
    enabled: !!userId, // Only run query if userId exists
  });
}

// Get transactions by type
export function useTransactionsByType(type: "commission" | "service") {
  return useQuery({
    queryKey: [QUERY_KEY, "type", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Transaction[];
    },
  });
}

// Get a single transaction by ID
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, transactionId],
    queryFn: async () => {
      if (!transactionId) return null;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (error) {
        throw error;
      }

      return data as Transaction;
    },
    enabled: !!transactionId, // Only run query if transactionId exists
  });
}

// Create transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      transactionData: Omit<Transaction, "id" | "created_at">
    ) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...transactionData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, "user", data.user_id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "type", data.type],
      });
    },
  });
}

// Update transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      transactionData,
    }: {
      transactionId: string;
      transactionData: Partial<Transaction>;
    }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", transactionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, "user", data.user_id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "type", data.type],
      });
    },
  });
}

// Delete transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      // First get the transaction to invalidate proper queries later
      const { data: transaction } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);

      if (error) {
        throw error;
      }

      return transaction;
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, "user", data.user_id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "type", data.type],
      });
    },
  });
}
