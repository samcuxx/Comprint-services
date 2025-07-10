"use client";

import { useState } from "react";
import {
  useServiceRequests,
  useTechnicians,
} from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {

  Clock,

  AlertTriangle,


  Wrench,
  Timer,
  Award,
  Zap,
} from "lucide-react";
import { TechnicianWorkload } from "@/components/services/technician-workload";
import { ServiceAnalytics } from "@/components/services/service-analytics";

const statusColors = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  in_progress: "#8b5cf6",
  waiting_parts: "#f97316",
  completed: "#10b981",
  cancelled: "#ef4444",
  on_hold: "#6b7280",
};

const priorityColors = {
  low: "#6b7280",
  medium: "#3b82f6",
  high: "#f97316",
  urgent: "#ef4444",
};

export default function ServiceTrackingPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedTechnician, setSelectedTechnician] = useState("all");

  const { data: currentUser } = useCurrentUser();
  const { data: serviceRequests = [], isLoading } = useServiceRequests();
  const { data: technicians = [] } = useTechnicians();

  const isAdmin = currentUser?.role === "admin";

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return serviceRequests.filter(
      (request) => new Date(request.created_at) >= cutoffDate
    );
  };

  const filteredRequests = getFilteredData();

  // Calculate overall metrics
  const metrics = {
    total: filteredRequests.length,
    completed: filteredRequests.filter((r) => r.status === "completed").length,
    inProgress: filteredRequests.filter((r) => r.status === "in_progress")
      .length,
    pending: filteredRequests.filter((r) => r.status === "pending").length,
    overdue: filteredRequests.filter((r) => {
      if (!r.estimated_completion) return false;
      return (
        new Date(r.estimated_completion) < new Date() &&
        r.status !== "completed"
      );
    }).length,
    avgCompletionTime: 0, // Calculate based on completed requests
    revenue: filteredRequests
      .filter((r) => r.final_cost)
      .reduce((sum, r) => sum + (r.final_cost || 0), 0),
  };

  // Calculate completion rate
  const completionRate =
    metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0;

  // Status distribution for pie chart
  const statusData = Object.entries({
    pending: metrics.pending,
    in_progress: metrics.inProgress,
    completed: metrics.completed,
    overdue: metrics.overdue,
  })
    .filter(([_, value]) => value > 0)
    .map(([status, count]) => ({
      name: status.replace("_", " "),
      value: count,
      color: statusColors[status as keyof typeof statusColors] || "#6b7280",
    }));

  // Priority distribution
  const priorityData = ["low", "medium", "high", "urgent"]
    .map((priority) => ({
      name: priority,
      value: filteredRequests.filter((r) => r.priority === priority).length,
      color: priorityColors[priority as keyof typeof priorityColors],
    }))
    .filter((item) => item.value > 0);

  // Daily completion trend (last 7 days)
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];

    const completed = filteredRequests.filter(
      (r) =>
        r.status === "completed" &&
        r.completed_date &&
        r.completed_date.split("T")[0] === dateStr
    ).length;

    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed,
    };
  });

  // Technician performance data
  const technicianPerformance = technicians
    .map((tech) => {
      const techRequests = filteredRequests.filter(
        (r) => r.assigned_technician_id === tech.id
      );
      const completed = techRequests.filter(
        (r) => r.status === "completed"
      ).length;
      const inProgress = techRequests.filter(
        (r) => r.status === "in_progress"
      ).length;
      const pending = techRequests.filter((r) => r.status === "pending").length;

      return {
        id: tech.id,
        name: tech.full_name,
        total: techRequests.length,
        completed,
        inProgress,
        pending,
        completionRate:
          techRequests.length > 0 ? (completed / techRequests.length) * 100 : 0,
        workload: inProgress + pending,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate);

  // Service category performance
  const categoryPerformance = filteredRequests.reduce((acc, request) => {
    const category = request.service_category?.name || "Unknown";
    if (!acc[category]) {
      acc[category] = { name: category, count: 0, completed: 0, revenue: 0 };
    }
    acc[category].count++;
    if (request.status === "completed") {
      acc[category].completed++;
      acc[category].revenue += request.final_cost || 0;
    }
    return acc;
  }, {} as Record<string, any>);

  const categoryData = Object.values(categoryPerformance).sort(
    (a: any, b: any) => b.count - a.count
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Service Tracking
          </h1>
          <p className="text-muted-foreground">
            Monitor service performance, technician workload, and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7d"
                ? "Last 7 days"
                : timeRange === "30d"
                ? "Last 30 days"
                : "Last 90 days"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completionRate.toFixed(1)}%
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <span className="text-sm font-medium"> ₵ </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              Past estimated completion
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm capitalize">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Completion Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Completion Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Total Requests" />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <TechnicianWorkload
            selectedTechnician={selectedTechnician}
            onTechnicianSelect={setSelectedTechnician}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Avg. Response Time
                </CardTitle>
                <Timer className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-xs text-muted-foreground">
                  Time to assignment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Avg. Resolution Time
                </CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5h</div>
                <p className="text-xs text-muted-foreground">
                  Time to completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Customer Satisfaction
                </CardTitle>
                <Award className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5</div>
                <p className="text-xs text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  First-Time Fix Rate
                </CardTitle>
                <Zap className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Resolved on first visit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Priority vs Completion Time */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Level Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityData.map((priority) => {
                  const avgTime =
                    priority.name === "urgent"
                      ? "4.2h"
                      : priority.name === "high"
                      ? "8.5h"
                      : priority.name === "medium"
                      ? "16.3h"
                      : "24.1h";
                  const completionRate =
                    priority.name === "urgent"
                      ? 95
                      : priority.name === "high"
                      ? 89
                      : priority.name === "medium"
                      ? 85
                      : 78;

                  return (
                    <div
                      key={priority.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        <div>
                          <div className="font-medium capitalize">
                            {priority.name} Priority
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {priority.value} requests
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{avgTime}</div>
                        <div className="text-sm text-muted-foreground">
                          {completionRate}% completed
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ServiceAnalytics timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
