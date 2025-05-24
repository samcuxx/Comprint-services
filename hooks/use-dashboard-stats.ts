"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/lib/types";

export interface DashboardStats {
  totalEmployees: number;
  totalSales: number;
  totalServices: number;
  pendingTasks: number;
  salesData?: {
    dailySales: number;
    monthlyGoal: number;
    lowStockItems: number;
    newCustomers: number;
  };
  technicianData?: {
    activeServiceRequests: number;
    completedToday: number;
    pendingParts: number;
    customerFeedback: number;
  };
}

export function useDashboardStats(userId: string | undefined, userRole: UserRole | null) {
  return useQuery({
    queryKey: ['dashboardStats', userId, userRole],
    queryFn: async (): Promise<DashboardStats> => {
      let dashboardStats: DashboardStats = {
        totalEmployees: 0,
        totalSales: 0,
        totalServices: 0,
        pendingTasks: 0,
      };

      // Only fetch if we have a user role
      if (!userRole) {
        return dashboardStats;
      }

      try {
        // Fetch employees count (admin only)
        if (userRole === "admin") {
          const { count: employeesCount } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

          dashboardStats.totalEmployees = employeesCount || 0;
        }

        // Fetch sales transactions count
        const { count: salesCount } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("type", "commission");

        dashboardStats.totalSales = salesCount || 0;

        // Fetch service transactions count
        const { count: servicesCount } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("type", "service");

        dashboardStats.totalServices = servicesCount || 0;

        // Mock pending tasks (this would be from a tasks table in a real app)
        dashboardStats.pendingTasks = Math.floor(Math.random() * 10) + 1;

        // For sales role, get specific stats
        if (userRole === "sales" && userId) {
          // Get today's date in ISO format
          const today = new Date().toISOString().split("T")[0];

          // Count user's sales for today
          const { count: dailySales } = await supabase
            .from("transactions")
            .select("*", { count: "exact", head: true })
            .eq("type", "commission")
            .eq("user_id", userId)
            .gte("created_at", today);

          dashboardStats.salesData = {
            dailySales: dailySales || 0,
            monthlyGoal: 85, // This would come from a goals table in a real app
            lowStockItems: 6, // This would come from inventory in a real app
            newCustomers: 12, // This would come from customers in a real app
          };
        }

        // For technician role, get specific stats
        if (userRole === "technician" && userId) {
          // Count user's active service requests
          const { count: activeRequests } = await supabase
            .from("transactions")
            .select("*", { count: "exact", head: true })
            .eq("type", "service")
            .eq("user_id", userId);

          // Get today's date in ISO format
          const today = new Date().toISOString().split("T")[0];

          // Count completed services today
          const { count: completedToday } = await supabase
            .from("transactions")
            .select("*", { count: "exact", head: true })
            .eq("type", "service")
            .eq("user_id", userId)
            .gte("created_at", today);

          dashboardStats.technicianData = {
            activeServiceRequests: activeRequests || 0,
            completedToday: completedToday || 0,
            pendingParts: 4, // This would come from parts requests in a real app
            customerFeedback: 4.8, // This would come from feedback in a real app
          };
        }

        return dashboardStats;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching dashboard stats:", error);
        }
        throw error;
      }
    },
    enabled: !!userRole, // Only run the query if we have a user role
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
} 