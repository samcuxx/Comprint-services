import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

/**
 * Hook to fetch the current user's information
 */
export const useCurrentUser = () => {
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
};
