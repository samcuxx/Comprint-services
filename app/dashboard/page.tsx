"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/lib/types";
import {
  Users,
  ShoppingCart,
  Wrench,
  ClipboardList,
  Loader2,
} from "lucide-react";

interface DashboardStats {
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

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalSales: 0,
    totalServices: 0,
    pendingTasks: 0,
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        let dashboardStats: DashboardStats = {
          totalEmployees: 0,
          totalSales: 0,
          totalServices: 0,
          pendingTasks: 0,
        };

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
        if (userRole === "sales") {
          // Get today's date in ISO format
          const today = new Date().toISOString().split("T")[0];

          // Count user's sales for today
          const { count: dailySales } = await supabase
            .from("transactions")
            .select("*", { count: "exact", head: true })
            .eq("type", "commission")
            .eq("user_id", user?.id)
            .gte("created_at", today);

          dashboardStats.salesData = {
            dailySales: dailySales || 0,
            monthlyGoal: 85, // This would come from a goals table in a real app
            lowStockItems: 6, // This would come from inventory in a real app
            newCustomers: 12, // This would come from customers in a real app
          };
        }

        // For technician role, get specific stats
        if (userRole === "technician") {
          // Count user's active service requests
          const { count: activeRequests } = await supabase
            .from("transactions")
            .select("*", { count: "exact", head: true })
            .eq("type", "service")
            .eq("user_id", user?.id);

          // Get today's date in ISO format
          const today = new Date().toISOString().split("T")[0];

          // Count completed services today
          const { count: completedToday } = await supabase
            .from("transactions")
            .select("*", { count: "exact", head: true })
            .eq("type", "service")
            .eq("user_id", user?.id)
            .gte("created_at", today);

          dashboardStats.technicianData = {
            activeServiceRequests: activeRequests || 0,
            completedToday: completedToday || 0,
            pendingParts: 4, // This would come from parts requests in a real app
            customerFeedback: 4.8, // This would come from feedback in a real app
          };
        }

        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchDashboardStats();
    }
  }, [user, userRole]);

  // Show different dashboard info based on role
  const renderRoleSpecificCards = () => {
    if (isLoading) {
      return (
        <div className="col-span-4 flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (userRole === "admin") {
      return (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Services
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
        </>
      );
    } else if (userRole === "sales" && stats.salesData) {
      return (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Sales Today
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesData.dailySales}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Goal
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesData.monthlyGoal}%
              </div>
              <p className="text-xs text-muted-foreground">425 of 500 target</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesData.lowStockItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesData.newCustomers}
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else if (userRole === "technician" && stats.technicianData) {
      return (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Service Requests
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.activeServiceRequests}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Today
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.completedToday}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Parts
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.pendingParts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customer Feedback
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.customerFeedback}/5
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else {
      // Fallback for unknown role
      return (
        <div className="col-span-4 text-center">
          <p>Welcome! Please contact your administrator for access.</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <h2 className="text-lg font-medium">
        Welcome back, {user?.user_metadata?.full_name || "User"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderRoleSpecificCards()}
      </div>

      {!isLoading && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {userRole === "admin" && (
              <>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Add New Employee</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a new employee account
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Generate Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    View sales and service reports
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Inventory Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Check stock levels and reorder
                  </p>
                </div>
              </>
            )}

            {userRole === "sales" && (
              <>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">New Sale</h4>
                  <p className="text-sm text-muted-foreground">
                    Process a new sales transaction
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Check Inventory</h4>
                  <p className="text-sm text-muted-foreground">
                    View available products
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Customer Lookup</h4>
                  <p className="text-sm text-muted-foreground">
                    Find customer information
                  </p>
                </div>
              </>
            )}

            {userRole === "technician" && (
              <>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Update Service Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Mark services as in progress or complete
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Request Parts</h4>
                  <p className="text-sm text-muted-foreground">
                    Order parts needed for service
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-medium">Service History</h4>
                  <p className="text-sm text-muted-foreground">
                    View past service records
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
