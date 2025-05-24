"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Branch } from "@/lib/types";

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBranches() {
      try {
        console.log("Fetching branches...");
        const { data, error } = await supabase
          .from("branches")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        console.log("Fetched branches:", data);
        setBranches(data || []);
      } catch (err) {
        console.error("Error fetching branches:", err);
        setError("Failed to fetch branches");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBranches();
  }, []);

  return { branches, isLoading, error };
}

export default useBranches;
