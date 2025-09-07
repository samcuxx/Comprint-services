"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import {
  Users,
  Package,
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertCircle,
  Percent,
  User,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Award,
  Wrench,
  FileText,
  BarChart3,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useCommissionStats } from "@/hooks/use-commissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(user?.id, userRole);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case "admin":
        return "Administrator";
      case "sales":
        return "Sales Associate";
      case "technician":
        return "Technician";
      default:
        return "User";
    }
  };

  if (!user) {
    return <Loading />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="space-y-4 text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="p-6 border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              {getGreeting()}, {(user as any).full_name || user.email}!{" "}
              {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
            </h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {getRoleTitle()}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {currentTime.toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentTime.toLocaleTimeString()}
              </span>
            </p>
          </div>
          <div className="items-center hidden space-x-2 md:flex">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">System Online</span>
          </div>
        </div>
      </div>

      {/* Role-specific Dashboard Content */}
      {userRole === "admin" && <AdminDashboard stats={stats} />}
      {userRole === "sales" && <SalesDashboard stats={stats} />}
      {userRole === "technician" && <TechnicianDashboard stats={stats} />}
    </div>
  );
}

function AdminDashboard({ stats }: { stats: any }) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button asChild className="flex-col h-auto gap-2 p-4">
              <Link href="/dashboard/employees">
                <Users className="w-6 h-6" />
                <span className="text-sm">Add User</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-col h-auto gap-2 p-4"
            >
              <Link href="/dashboard/products">
                <Package className="w-6 h-6" />
                <span className="text-sm">Manage Products</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-col h-auto gap-2 p-4"
            >
              <Link href="/dashboard/sales/new">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-sm">New Sale</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-col h-auto gap-2 p-4"
            >
              <Link href="/dashboard/reports">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">View Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={<Users className="w-6 h-6" />}
          trend={+5}
          gradient="from-blue-500 to-blue-600"
          href="/dashboard/employees"
        />
        <MetricCard
          title="Total Sales"
          value={stats?.totalSales || 0}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={+12}
          gradient="from-green-500 to-green-600"
          href="/dashboard/sales"
        />
        <MetricCard
          title="Total Services"
          value={stats?.totalServices || 0}
          icon={<Wrench className="w-6 h-6" />}
          trend={+8}
          gradient="from-purple-500 to-purple-600"
          href="/dashboard/services"
        />
        <MetricCard
          title="Pending Tasks"
          value={stats?.pendingTasks || 0}
          icon={<ClipboardList className="w-6 h-6" />}
          trend={-3}
          gradient="from-orange-500 to-orange-600"
          href="/dashboard/services"
        />
      </div> */}

      {/* Commission Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
          Commission Overview
          </h2>
          <Button asChild variant="outline">
            <Link href="/dashboard/commissions">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CommissionStatsCards />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* <RecentActivityCard />
        <SystemStatusCard /> */}
      </div>
    </div>
  );
}

function SalesDashboard({ stats }: { stats: any }) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const salesData = stats?.salesData;

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Button asChild className="flex-col h-auto gap-2 p-4">
              <Link href="/dashboard/sales/new">
                <Plus className="w-6 h-6" />
                <span className="text-sm">New Sale</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-col h-auto gap-2 p-4"
            >
              <Link href="/dashboard/customers">
                <User className="w-6 h-6" />
                <span className="text-sm">Add Customer</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-col h-auto gap-2 p-4"
            >
              <Link href="/dashboard/commissions">
                ₵ <span className="text-sm"> My Commissions</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Sales Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* <SalesPerformanceCard />
        <RecentSalesCard /> */}
      </div>
    </div>
  );
}

function TechnicianDashboard({ stats }: { stats: any }) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const techData = stats?.technicianData;

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Button asChild className="flex-col h-auto gap-2 p-4">
              <Link href="/dashboard/services/new">
                <Plus className="w-6 h-6" />
                <span className="text-sm">New Service</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-col h-auto gap-2 p-4"
            >
              <Link href="/dashboard/services">
                <Wrench className="w-6 h-6" />
                <span className="text-sm">My Services</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-col h-auto gap-2 p-4"
            >
              <Link href="/dashboard/services/tracking">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">View Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Metrics */}
      {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Requests"
          value={techData?.activeServiceRequests || 0}
          icon={<Activity className="w-6 h-6" />}
          trend={+3}
          gradient="from-blue-500 to-blue-600"
          href="/dashboard/services"
        />
        <MetricCard
          title="Completed Today"
          value={techData?.completedToday || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          trend={+5}
          gradient="from-green-500 to-green-600"
          href="/dashboard/services"
        />
        <MetricCard
          title="Pending Parts"
          value={techData?.pendingParts || 0}
          icon={<Package className="w-6 h-6" />}
          trend={-1}
          gradient="from-orange-500 to-orange-600"
          href="/dashboard/inventory"
        />
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Star className="w-4 h-4 text-yellow-500" />
              Customer Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {techData?.customerFeedback || 0}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(techData?.customerFeedback || 0)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Service Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* <ServiceStatusCard />
        <RecentServicesCard /> */}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  gradient,
  href,
  isAlert = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: number;
  gradient: string;
  href: string;
  isAlert?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 group hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>{title}</span>
          <div
            className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white`}
          >
            {icon}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <div className="w-4 h-4" />
              )}
              <span
                className={
                  trend > 0
                    ? "text-green-500"
                    : trend < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                }
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="transition-opacity opacity-0 group-hover:opacity-100"
            >
              <Link href={href}>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
      {isAlert && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" className="text-xs">
            Alert
          </Badge>
        </div>
      )}
    </Card>
  );
}

function CommissionStatsCards() {
  const { data: stats, isLoading, isError } = useCommissionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 col-span-4">
        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
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
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Total Commissions
          </CardTitle>
          <div className="p-2 text-white rounded-lg bg-gradient-to-r from-green-500 to-green-600">
           ₵
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₵ {stats.totalCommissions.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Paid Commissions
          </CardTitle>
          <div className="p-2 text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₵ {stats.paidCommissions.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Pending Commissions
          </CardTitle>
          <div className="p-2 text-white rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
            <AlertCircle className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₵ {stats.unpaidCommissions.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
          <div className="p-2 text-white rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
            <Percent className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {stats.totalCommissions > 0
                ? Math.round(
                    (stats.paidCommissions / stats.totalCommissions) * 100
                  )
                : 0}
              %
            </div>
            <Progress
              value={
                stats.totalCommissions > 0
                  ? (stats.paidCommissions / stats.totalCommissions) * 100
                  : 0
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {stats.topPerformers.length > 0 && (
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPerformers.map((performer, index) => (
                <div
                  key={performer.sales_person.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-center w-8 h-8 font-bold rounded-full bg-primary/10 text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
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
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
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

function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            {
              action: "New employee added",
              time: "2 minutes ago",
              type: "user",
            },
            { action: "Sale completed", time: "5 minutes ago", type: "sale" },
            {
              action: "Service request created",
              time: "10 minutes ago",
              type: "service",
            },
            {
              action: "Commission paid",
              time: "15 minutes ago",
              type: "commission",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 transition-colors rounded-lg hover:bg-muted/50"
            >
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SystemStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { service: "Database", status: "Online", uptime: "99.9%" },
            { service: "API Services", status: "Online", uptime: "99.8%" },
            { service: "Payment Gateway", status: "Online", uptime: "99.7%" },
            { service: "Email Service", status: "Online", uptime: "99.9%" },
          ].map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{service.service}</span>
              </div>
              <div className="text-right">
                <Badge
                  variant="secondary"
                  className="text-green-800 bg-green-100"
                >
                  {service.status}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {service.uptime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SalesPerformanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Sales Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>This Week</span>
              <span className="font-medium">$12,450</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>This Month</span>
              <span className="font-medium">$45,230</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>This Quarter</span>
              <span className="font-medium">$125,670</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentSalesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          Recent Sales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { customer: "John Doe", amount: "$1,250", time: "2 hours ago" },
            { customer: "Jane Smith", amount: "$850", time: "4 hours ago" },
            { customer: "Bob Johnson", amount: "$2,100", time: "6 hours ago" },
            { customer: "Alice Brown", amount: "$675", time: "8 hours ago" },
          ].map((sale, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 transition-colors rounded-lg hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">{sale.customer}</p>
                <p className="text-xs text-muted-foreground">{sale.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  {sale.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          Service Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { status: "In Progress", count: 8, color: "blue" },
            { status: "Pending", count: 3, color: "orange" },
            { status: "Completed", count: 15, color: "green" },
            { status: "On Hold", count: 2, color: "red" },
          ].map((status, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-${status.color}-500`}
                ></div>
                <span className="text-sm font-medium">{status.status}</span>
              </div>
              <Badge variant="secondary">{status.count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentServicesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Recent Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            {
              service: "Computer Repair",
              customer: "Tech Corp",
              status: "In Progress",
            },
            {
              service: "Network Setup",
              customer: "Small Business",
              status: "Completed",
            },
            {
              service: "Data Recovery",
              customer: "Home User",
              status: "Pending",
            },
            {
              service: "Software Install",
              customer: "Office LLC",
              status: "Completed",
            },
          ].map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 transition-colors rounded-lg hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">{service.service}</p>
                <p className="text-xs text-muted-foreground">
                  {service.customer}
                </p>
              </div>
              <Badge
                variant={
                  service.status === "Completed"
                    ? "default"
                    : service.status === "In Progress"
                    ? "secondary"
                    : "outline"
                }
                className="text-xs"
              >
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
