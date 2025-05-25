"use client";

import { useState } from "react";
import { useTimeBasedAnalytics } from "@/hooks/use-reports";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
  Filter,
  X,
  Sun,
  Moon,
} from "lucide-react";

export function TimeBasedAnalytics() {
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const {
    data: analyticsData,
    isLoading,
    isError,
    error,
  } = useTimeBasedAnalytics(filters);

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const getHourLabel = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  const getHourIcon = (hour: number) => {
    if (hour >= 6 && hour < 18) {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    }
    return <Moon className="h-4 w-4 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <Clock className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold">Failed to load time analytics</h3>
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
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
                setFilters({ ...filters, endDate: e.target.value || undefined })
              }
              className="w-40"
            />
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Daily Sales Trend */}
      {analyticsData?.dailySales && analyticsData.dailySales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Daily Sales Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analyticsData.dailySales.slice(-14).map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
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
                    <div className="text-sm text-green-600">
                      +{formatCurrency(day.profit)} profit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Sales Trend */}
      {analyticsData?.monthlySales && analyticsData.monthlySales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Monthly Sales Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.monthlySales.slice(-6).map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {format(new Date(month.month + "-01"), "MMMM yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {month.sales_count} total sales
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(month.revenue)}
                    </div>
                    <div className="text-sm text-green-600">
                      +{formatCurrency(month.profit)} profit
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(month.revenue / month.sales_count)} avg
                      per sale
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales by Hour */}
        {analyticsData?.salesByHour && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Sales by Hour of Day</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analyticsData.salesByHour
                  .filter((hour) => hour.sales_count > 0)
                  .sort((a, b) => b.sales_count - a.sales_count)
                  .slice(0, 12)
                  .map((hour) => (
                    <div
                      key={hour.hour}
                      className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {getHourIcon(hour.hour)}
                        <span className="font-medium">
                          {getHourLabel(hour.hour)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {hour.sales_count} sales
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(hour.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales by Day of Week */}
        {analyticsData?.salesByDayOfWeek && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Sales by Day of Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.salesByDayOfWeek
                  .sort((a, b) => b.sales_count - a.sales_count)
                  .map((day) => (
                    <div
                      key={day.day_of_week}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{day.day_of_week}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {day.sales_count} sales
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(day.revenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.sales_count > 0
                            ? formatCurrency(day.revenue / day.sales_count) +
                              " avg"
                            : "No sales"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty States */}
      {analyticsData?.dailySales && analyticsData.dailySales.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No analytics data available
            </h3>
            <p className="text-muted-foreground">
              No sales data found for the selected time period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
