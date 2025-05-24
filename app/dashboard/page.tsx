"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  Loader2,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Percent,
  User,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useCommissionStats } from "@/hooks/use-commissions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(user?.id, userRole);

  // Show different dashboard info based on role
  const renderRoleSpecificCards = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40 col-span-4">
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="col-span-4 text-center text-gray-500">
          No dashboard data available
        </div>
      );
    }

    if (userRole === "admin") {
      return (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Services
              </CardTitle>
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
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
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Your Sales Today
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesData.dailySales}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Monthly Goal
              </CardTitle>
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesData.monthlyGoal}%
              </div>
              <p className="text-xs text-muted-foreground">425 of 500 target</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesData.lowStockItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                New Customers
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
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
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Active Service Requests
              </CardTitle>
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.activeServiceRequests}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Completed Today
              </CardTitle>
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.completedToday}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Pending Parts
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.pendingParts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Customer Feedback
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.technicianData.customerFeedback}
              </div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
        </>
      );
    }

    return null;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome{" "}
          {userRole === "admin"
            ? "Administrator"
            : userRole === "sales"
            ? "Sales Associate"
            : "Technician"}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderRoleSpecificCards()}
      </div>
      {userRole === "admin" && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold">Commission Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CommissionStatsCards />
          </div>
        </div>
      )}
    </div>
  );
}

function CommissionStatsCards() {
  const { data: stats, isLoading, isError } = useCommissionStats();

  if (isLoading) {
    return (
      <div className="col-span-4 flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="col-span-4 text-center text-muted-foreground">
        Failed to load commission statistics
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Commissions
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalCommissions.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Paid Commissions
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.paidCommissions.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Commissions
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.unpaidCommissions.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalCommissions > 0
              ? Math.round(
                  (stats.paidCommissions / stats.totalCommissions) * 100
                )
              : 0}
            %
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {stats.topPerformers.length > 0 && (
        <Card className="col-span-4 mt-4">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPerformers.map((performer) => (
                <div
                  key={performer.sales_person.id}
                  className="flex items-center"
                >
                  <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">
                      {performer.sales_person.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Commission: ${performer.total_commission.toFixed(2)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/dashboard/commissions?salesPersonId=${performer.sales_person.id}`}
                    >
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
