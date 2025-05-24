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
  });
};

/**
 * Hook to sync commission amounts with sale items commission data
 * This is used to fix commission records that have incorrect amounts (showing as 0)
 */
export const useSyncCommissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionId: string) => {
      // First, get the commission record to find the associated sale
      const { data: commission, error: commissionError } = await supabase
        .from("sales_commissions")
        .select("*")
        .eq("id", commissionId)
        .single();

      if (commissionError) {
        throw new Error(
          `Error fetching commission: ${commissionError.message}`
        );
      }

      if (!commission.sale_id) {
        throw new Error("Commission does not have an associated sale");
      }

      // Get the sale items to calculate the correct commission amount
      const { data: saleItems, error: saleItemsError } = await supabase
        .from("sale_items")
        .select("*")
        .eq("sale_id", commission.sale_id);

      if (saleItemsError) {
        throw new Error(`Error fetching sale items: ${saleItemsError.message}`);
      }

      // Calculate the correct commission amount
      const totalCommissionAmount = saleItems.reduce(
        (sum, item) =>
          sum + item.quantity * item.unit_price * (item.commission_rate / 100),
        0
      );

      // Update the commission record with the correct amount
      const { data: updatedCommission, error: updateError } = await supabase
        .from("sales_commissions")
        .update({
          commission_amount: totalCommissionAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commissionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error updating commission: ${updateError.message}`);
      }

      return updatedCommission;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["commissions-summary"] });
      queryClient.invalidateQueries({ queryKey: ["commission-stats"] });
    },
  });
};
