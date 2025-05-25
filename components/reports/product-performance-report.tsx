"use client";

import { useState } from "react";
import { useProductPerformance } from "@/hooks/use-reports";
import { useCategories } from "@/hooks/use-categories";
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
import {
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Trophy,
  BarChart3,
  Filter,
  X,
  Tag,
} from "lucide-react";

export function ProductPerformanceReport() {
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    categoryId: undefined as string | undefined,
  });

  const {
    data: performanceData,
    isLoading,
    isError,
    error,
  } = useProductPerformance(filters);

  const { data: categories = [] } = useCategories();

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      categoryId: undefined,
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
        <Package className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold">
          Failed to load product performance
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

          <Select
            value={filters.categoryId || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                categoryId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
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
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Top Products */}
      {performanceData?.topProducts &&
        performanceData.topProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Top Selling Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.topProducts.map((product, index) => (
                  <div
                    key={product.product.id}
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
                          {product.product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {product.product.sku}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.total_quantity} units sold
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(product.total_revenue)}
                      </div>
                      <div className="text-sm text-green-600">
                        +{formatCurrency(product.total_profit)} profit
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(
                          product.total_revenue / product.total_quantity
                        )}{" "}
                        per unit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Category Performance */}
      {performanceData?.categoryPerformance &&
        performanceData.categoryPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Category Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.categoryPerformance
                  .sort((a, b) => b.total_revenue - a.total_revenue)
                  .map((category) => (
                    <div
                      key={category.category_name}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {category.category_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {category.product_count} products •{" "}
                            {category.total_quantity} units sold
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(category.total_revenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(
                            category.total_revenue / category.total_quantity
                          )}{" "}
                          per unit
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Low Stock Alerts */}
      {performanceData?.lowStockProducts &&
        performanceData.lowStockProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Low Stock Alerts</span>
                <Badge variant="destructive" className="ml-2">
                  {performanceData.lowStockProducts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.lowStockProducts.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.product.sku}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {item.current_stock} units left
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Reorder at: {item.reorder_level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Empty States */}
      {performanceData?.topProducts &&
        performanceData.topProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No product data available
              </h3>
              <p className="text-muted-foreground">
                No product sales data found for the selected period.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
