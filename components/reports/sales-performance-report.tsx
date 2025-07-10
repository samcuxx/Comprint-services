"use client";

import { useState } from "react";
import { useSalesPerformance } from "@/hooks/use-reports";
import { useSalesPersons } from "@/hooks/use-sales";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  TrendingUp,
  ShoppingCart,
  Target,
  Crown,
  Calendar,
  Filter,
  X,
} from "lucide-react";

export function SalesPerformanceReport() {
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    salesPersonId: undefined as string | undefined,
  });

  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // For sales users, auto-filter to their own data
  const finalFilters =
    currentUser?.role === "sales"
      ? { ...filters, salesPersonId: currentUser.id }
      : filters;

  const {
    data: performanceData,
    isLoading,
    isError,
    error,
  } = useSalesPerformance(finalFilters);

  const { data: salesPersons = [] } = useSalesPersons();

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      salesPersonId: undefined,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <TrendingUp className="w-12 h-12 text-red-500" />
        <h3 className="text-lg font-semibold">
          Failed to load sales performance
        </h3>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {isAdmin && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                type="date"
                placeholder="Start date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value || undefined,
                  })
                }
                className="w-40"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                placeholder="End date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value || undefined,
                  })
                }
                className="w-40"
              />
            </div>

            <Select
              value={filters.salesPersonId || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  salesPersonId: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All sales persons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales Persons</SelectItem>
                {salesPersons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.totalSales.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of completed sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span> ₵ </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(performanceData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue from completed sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(performanceData?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average value per sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Top Performers
            </CardTitle>
            <Crown className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.topPerformers.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active sales team members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {isAdmin &&
        performanceData?.topPerformers &&
        performanceData.topPerformers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-primary" />
                <span>Top Performing Sales Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.topPerformers.map((performer, index) => (
                  <div
                    key={performer.sales_person.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Badge
                          variant={index === 0 ? "default" : "secondary"}
                          className="flex items-center justify-center w-8 h-8 rounded-full"
                        >
                          {index + 1}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium">
                          {performer.sales_person.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {performer.total_sales} sales completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(performer.total_revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg:{" "}
                        {formatCurrency(
                          performer.total_revenue / performer.total_sales
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Sales Trend */}
      {performanceData?.salesTrend && performanceData.salesTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Sales Trend (Last 30 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                {performanceData.salesTrend.slice(-7).map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 transition-colors border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(day.date), "EEEE, MMM d")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {day.sales_count} sales
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(day.revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {day.sales_count > 0
                          ? formatCurrency(day.revenue / day.sales_count) +
                            " avg"
                          : "No sales"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {performanceData.salesTrend.length === 0 && (
                <div className="py-8 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No sales data available for the selected period
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
