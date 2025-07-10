"use client";

import { useMemo } from "react";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
} from "lucide-react";

interface ServiceAnalyticsProps {
  timeRange: string;
}

export function ServiceAnalytics({ timeRange }: ServiceAnalyticsProps) {
  const { data: serviceRequests = [] } = useServiceRequests();

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return serviceRequests.filter(
      (request) => new Date(request.created_at) >= cutoffDate
    );
  }, [serviceRequests, timeRange]);

  // Calculate comprehensive metrics
  const analytics = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(
      (r) => r.status === "completed"
    ).length;
    const inProgress = filteredData.filter(
      (r) => r.status === "in_progress"
    ).length;
    const pending = filteredData.filter((r) => r.status === "pending").length;
    const cancelled = filteredData.filter(
      (r) => r.status === "cancelled"
    ).length;

    // Revenue calculations
    const totalRevenue = filteredData
      .filter((r) => r.final_cost)
      .reduce((sum, r) => sum + (r.final_cost || 0), 0);

    const avgServiceValue = completed > 0 ? totalRevenue / completed : 0;

    // Time-based metrics
    const completedRequests = filteredData.filter(
      (r) => r.status === "completed" && r.completed_date
    );
    const avgCompletionTime =
      completedRequests.length > 0
        ? completedRequests.reduce((sum, r) => {
            const start = new Date(r.created_at);
            const end = new Date(r.completed_date!);
            return sum + (end.getTime() - start.getTime());
          }, 0) /
          completedRequests.length /
          (1000 * 60 * 60) // Convert to hours
        : 0;

    // Priority distribution
    const priorityStats = {
      urgent: filteredData.filter((r) => r.priority === "urgent").length,
      high: filteredData.filter((r) => r.priority === "high").length,
      medium: filteredData.filter((r) => r.priority === "medium").length,
      low: filteredData.filter((r) => r.priority === "low").length,
    };

    // Service category performance
    const categoryStats = filteredData.reduce((acc, request) => {
      const category = request.service_category?.name || "Unknown";
      if (!acc[category]) {
        acc[category] = {
          name: category,
          count: 0,
          completed: 0,
          revenue: 0,
          avgTime: 0,
          completionRate: 0,
        };
      }
      acc[category].count++;
      if (request.status === "completed") {
        acc[category].completed++;
        acc[category].revenue += request.final_cost || 0;
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate completion rates for categories
    Object.values(categoryStats).forEach((cat: any) => {
      cat.completionRate =
        cat.count > 0 ? (cat.completed / cat.count) * 100 : 0;
    });

    // Daily trend data
    const dailyTrend = Array.from(
      { length: parseInt(timeRange.replace("d", "")) },
      (_, i) => {
        const date = new Date();
        date.setDate(
          date.getDate() - (parseInt(timeRange.replace("d", "")) - 1 - i)
        );
        const dateStr = date.toISOString().split("T")[0];

        const dayRequests = filteredData.filter(
          (r) => r.created_at.split("T")[0] === dateStr
        );

        const dayCompleted = filteredData.filter(
          (r) => r.completed_date && r.completed_date.split("T")[0] === dateStr
        );

        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          created: dayRequests.length,
          completed: dayCompleted.length,
          revenue: dayCompleted.reduce(
            (sum, r) => sum + (r.final_cost || 0),
            0
          ),
        };
      }
    );

    // Device type analysis
    const deviceStats = filteredData.reduce((acc, request) => {
      const device = request.device_type || "Unknown";
      if (!acc[device]) {
        acc[device] = { name: device, count: 0, completed: 0 };
      }
      acc[device].count++;
      if (request.status === "completed") {
        acc[device].completed++;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      total,
      completed,
      inProgress,
      pending,
      cancelled,
      totalRevenue,
      avgServiceValue,
      avgCompletionTime,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      priorityStats,
      categoryStats: Object.values(categoryStats).sort(
        (a: any, b: any) => b.count - a.count
      ),
      dailyTrend,
      deviceStats: Object.values(deviceStats).sort(
        (a: any, b: any) => b.count - a.count
      ),
    };
  }, [filteredData]);

  const priorityColors = {
    urgent: "#ef4444",
    high: "#f97316",
    medium: "#3b82f6",
    low: "#6b7280",
  };

  const statusColors = {
    completed: "#10b981",
    inProgress: "#8b5cf6",
    pending: "#f59e0b",
    cancelled: "#ef4444",
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Avg. Service Value
            </CardTitle>

            <span> ₵ </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.avgServiceValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per completed service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Avg. Completion Time
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgCompletionTime.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              From request to completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.completionRate.toFixed(1)}%
            </div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Active Requests
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.inProgress + analytics.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress + pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Service Request Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.priorityStats).map(
                      ([key, value]) => ({
                        name: key,
                        value,
                        color:
                          priorityColors[key as keyof typeof priorityColors],
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.entries(analytics.priorityStats).map(
                      ([key], index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            priorityColors[key as keyof typeof priorityColors]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(analytics.priorityStats).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        priorityColors[key as keyof typeof priorityColors],
                    }}
                  />
                  <span className="text-sm capitalize">
                    {key}: {value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Service Categories Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryStats
              .slice(0, 6)
              .map((category: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.count} requests •{" "}
                        {formatCurrency(category.revenue)} revenue
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {category.completionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        completion rate
                      </div>
                    </div>
                  </div>
                  <Progress value={category.completionRate} />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Types & Revenue Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.deviceStats
                .slice(0, 5)
                .map((device: any, index: number) => {
                  const completionRate =
                    device.count > 0
                      ? (device.completed / device.count) * 100
                      : 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {device.count} requests
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            completionRate >= 80 ? "default" : "secondary"
                          }
                        >
                          {completionRate.toFixed(1)}% completed
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value as number),
                      "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2 space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-medium">Top Performing Category</span>
              </div>
              <div className="text-lg font-bold">
                {analytics.categoryStats[0]?.name || "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                {analytics.categoryStats[0]?.completionRate.toFixed(1)}%
                completion rate
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2 space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Fastest Service</span>
              </div>
              <div className="text-lg font-bold">
                {analytics.avgCompletionTime < 24
                  ? `${analytics.avgCompletionTime.toFixed(1)}h`
                  : `${(analytics.avgCompletionTime / 24).toFixed(1)}d`}
              </div>
              <div className="text-sm text-muted-foreground">
                Average completion time
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2 space-x-2">
                <span> ₵ </span>
                <span className="font-medium">Revenue Growth</span>
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(analytics.totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total revenue ({timeRange})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
