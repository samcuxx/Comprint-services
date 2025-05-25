"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesPerformanceReport } from "@/components/reports/sales-performance-report";
import { ProductPerformanceReport } from "@/components/reports/product-performance-report";
import { CustomerReportsComponent } from "@/components/reports/customer-reports";
import { TimeBasedAnalytics } from "@/components/reports/time-based-analytics";
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function ReportsPage() {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  if (isUserLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You need to be logged in to view reports.
        </p>
      </div>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const isSales = currentUser.role === "sales";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Comprehensive business analytics and reporting dashboard"
              : "Your sales performance and analytics"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Sales Performance</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Product Performance</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="customers"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Customer Reports</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Time Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Sales Performance Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesPerformanceReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Product Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPerformanceReport />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Customer Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerReportsComponent />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Time-Based Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeBasedAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
