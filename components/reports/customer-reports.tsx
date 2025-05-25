"use client";

import { useState } from "react";
import { useCustomerReports } from "@/hooks/use-reports";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Users,
  Crown,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Building,
  ShoppingBag,
  Filter,
  X,
  UserPlus,
  Repeat,
} from "lucide-react";

export function CustomerReportsComponent() {
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const {
    data: customerData,
    isLoading,
    isError,
    error,
  } = useCustomerReports(filters);

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

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
        <Users className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold">
          Failed to load customer reports
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

      {/* Customer Retention Overview */}
      {customerData?.customerRetention && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Customers
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerData.customerRetention.new_customers}
              </div>
              <p className="text-xs text-muted-foreground">
                Customers acquired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Returning Customers
              </CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerData.customerRetention.returning_customers}
              </div>
              <p className="text-xs text-muted-foreground">Repeat purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Retention Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerData.customerRetention.retention_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Customer retention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Customers */}
      {customerData?.topCustomers && customerData.topCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-primary" />
              <span>Top Valued Customers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerData.topCustomers.map((customer, index) => (
                <div
                  key={customer.customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Badge
                        variant={index < 3 ? "default" : "secondary"}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {customer.customer.name}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {customer.customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{customer.customer.email}</span>
                          </div>
                        )}
                        {customer.customer.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.customer.phone}</span>
                          </div>
                        )}
                        {customer.customer.company && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{customer.customer.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(customer.total_spent)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.total_purchases} purchases
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg:{" "}
                      {formatCurrency(
                        customer.total_spent / customer.total_purchases
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-end space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(customer.last_purchase_date), "MMM d")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Acquisition Trend */}
      {customerData?.customerAcquisition &&
        customerData.customerAcquisition.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Customer Acquisition Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerData.customerAcquisition.map((acquisition) => (
                  <div
                    key={acquisition.date}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(acquisition.date), "EEEE, MMM d")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Customer acquisition
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        +{acquisition.new_customers} customers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Empty States */}
      {customerData?.topCustomers && customerData.topCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No customer data available
            </h3>
            <p className="text-muted-foreground">
              No customer purchase data found for the selected period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
