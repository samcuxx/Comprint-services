"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

const QUERY_KEY = "users";

type User = Database["public"]["Tables"]["users"]["Row"];

// Get all users
export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("full_name");

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
}

// Get a single user by ID
export function useUser(userId: string) {
  return useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      // Get the current user's session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
      }

      // Get the user data from the users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionData.session.user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: Partial<User>;
    }) => {
      const { data, error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the user and users queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.userId],
      });
    },
  });
}

// Create user (for admin)
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Omit<User, "id">) => {
      const { data, error } = await supabase
        .from("users")
        .insert(userData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the users query
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Delete user (for admin)
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        throw new Error(error.message);
      }

      return userId;
    },
    onSuccess: () => {
      // Invalidate and refetch the users query
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
