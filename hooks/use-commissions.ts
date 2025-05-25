import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Commission = Database["public"]["Tables"]["sales_commissions"]["Row"];
type CommissionUpdate =
  Database["public"]["Tables"]["sales_commissions"]["Update"];

export interface CommissionWithDetails extends Commission {
  sale?: Database["public"]["Tables"]["sales"]["Row"];
  sales_person?: Database["public"]["Tables"]["users"]["Row"];
}

/**
 * Hook to fetch all commissions with filtering
 */
export const useCommissions = (
  filters: {
    startDate?: string;
    endDate?: string;
    salesPersonId?: string;
    isPaid?: boolean;
  } = {}
) => {
  return useQuery<CommissionWithDetails[], Error>({
    queryKey: ["commissions", filters],
    queryFn: async () => {
      let query = supabase
        .from("sales_commissions")
        .select(
          `
          *,
          sale:sale_id (*),
          sales_person:sales_person_id (*)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters if they exist
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }
      if (filters.salesPersonId) {
        query = query.eq("sales_person_id", filters.salesPersonId);
      }
      if (filters.isPaid !== undefined) {
        query = query.eq("is_paid", filters.isPaid);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 0, // Always consider data stale to refetch frequently
    refetchOnWindowFocus: true, // Refetch when user focuses window
    refetchOnMount: true, // Always refetch when component mounts
  });
};

/**
 * Hook to fetch a specific commission with details
 */
export const useCommission = (id: string | undefined) => {
  return useQuery<CommissionWithDetails, Error>({
    queryKey: ["commissions", id],
    queryFn: async () => {
      if (!id) throw new Error("Commission ID is required");

      const { data, error } = await supabase
        .from("sales_commissions")
        .select(
          `
          *,
          sale:sale_id (*),
          sales_person:sales_person_id (*)
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
 * Hook to fetch commissions summary for a sales person
 */
export const useCommissionsSummary = (salesPersonId: string | undefined) => {
  return useQuery<
    {
      totalCommission: number;
      paidCommission: number;
      unpaidCommission: number;
      commissionsCount: number;
    },
    Error
  >({
    queryKey: ["commissions-summary", salesPersonId],
    queryFn: async () => {
      if (!salesPersonId) throw new Error("Sales person ID is required");

      // Get all commissions for the sales person
      const { data, error } = await supabase
        .from("sales_commissions")
        .select("*")
        .eq("sales_person_id", salesPersonId);

      if (error) {
        throw new Error(error.message);
      }

      // Calculate summary
      const commissions = data || [];
      const totalCommission = commissions.reduce(
        (sum, commission) => sum + (commission.commission_amount || 0),
        0
      );
      const paidCommission = commissions
        .filter((commission) => commission.is_paid)
        .reduce(
          (sum, commission) => sum + (commission.commission_amount || 0),
          0
        );
      const unpaidCommission = totalCommission - paidCommission;

      return {
        totalCommission,
        paidCommission,
        unpaidCommission,
        commissionsCount: commissions.length,
      };
    },
    enabled: !!salesPersonId,
    staleTime: 30000, // 30 seconds stale time for summary data
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to update a commission (mark as paid)
 */
export const useUpdateCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: CommissionUpdate & { id: string }) => {
      const { data: updatedCommission, error } = await supabase
        .from("sales_commissions")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          ...(data.is_paid ? { payment_date: new Date().toISOString() } : {}),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return updatedCommission;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({
        queryKey: ["commissions", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["commissions-summary"],
      });
    },
  });
};

/**
 * Hook to mark all commissions for a sales person on a specific date as paid
 */
export const useBulkPayCommissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      salesPersonId,
      date,
    }: {
      salesPersonId: string;
      date: string; // YYYY-MM-DD format
    }) => {
      // Get the start and end of the day
      const startDate = `${date}T00:00:00.000Z`;
      const endDate = `${date}T23:59:59.999Z`;

      // Update all unpaid commissions for this sales person on this date
      const { data, error } = await supabase
        .from("sales_commissions")
        .update({
          is_paid: true,
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("sales_person_id", salesPersonId)
        .eq("is_paid", false)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["commissions-summary"] });
      queryClient.invalidateQueries({ queryKey: ["commission-stats"] });
    },
  });
};

/**
 * Hook to get commission statistics for the dashboard
 */
export const useCommissionStats = () => {
  return useQuery<
    {
      totalCommissions: number;
      paidCommissions: number;
      unpaidCommissions: number;
      topPerformers: {
        sales_person: { id: string; full_name: string };
        total_commission: number;
      }[];
    },
    Error
  >({
    queryKey: ["commission-stats"],
    queryFn: async () => {
      // Get all commissions
      const { data: commissions, error: commissionsError } = await supabase
        .from("sales_commissions")
        .select("*");

      if (commissionsError) {
        throw new Error(commissionsError.message);
      }

      // Calculate total, paid, and unpaid commissions
      const total = commissions.reduce(
        (sum, commission) => sum + (commission.commission_amount || 0),
        0
      );
      const paid = commissions
        .filter((commission) => commission.is_paid)
        .reduce(
          (sum, commission) => sum + (commission.commission_amount || 0),
          0
        );
      const unpaid = total - paid;

      // Get top performers
      const { data: topPerformers, error: topPerformersError } = await supabase
        .from("sales_commissions")
        .select(
          `
          sales_person:sales_person_id (id, full_name),
          commission_amount
        `
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (topPerformersError) {
        throw new Error(topPerformersError.message);
      }

      // Group and sum commissions by sales person
      const performerMap = new Map<
        string,
        {
          sales_person: { id: string; full_name: string };
          total_commission: number;
        }
      >();

      topPerformers.forEach((record) => {
        if (!record.sales_person) return;

        const personId = record.sales_person.id;
        const current = performerMap.get(personId) || {
          sales_person: record.sales_person,
          total_commission: 0,
        };

        current.total_commission += record.commission_amount || 0;
        performerMap.set(personId, current);
      });

      // Convert map to array and sort by total commission
      const performersArray = Array.from(performerMap.values()).sort(
        (a, b) => b.total_commission - a.total_commission
      );

      return {
        totalCommissions: total,
        paidCommissions: paid,
        unpaidCommissions: unpaid,
        topPerformers: performersArray.slice(0, 5), // Top 5 performers
      };
    },
    staleTime: 60000, // 1 minute stale time for stats
    refetchOnWindowFocus: true,
  });
};
