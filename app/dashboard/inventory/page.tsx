"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import {
  PackageOpen,
  Search,
  Plus,
  Package,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useInventory, useUpdateStock } from "@/hooks/use-inventory";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Database } from "@/lib/database.types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StockUpdateModal } from "@/components/inventory/stock-update-modal";

type Inventory = Database["public"]["Tables"]["inventory"]["Row"] & {
  product: Database["public"]["Tables"]["products"]["Row"];
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
    null
  );
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  const { toast } = useToast();

  // Get current user to check role
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Use the React Query hooks for data
  const {
    data: inventoryItems = [],
    isLoading: isInventoryLoading,
    isError: isInventoryError,
    error: inventoryError,
    refetch: refetchInventory,
  } = useInventory();

  // Mutation hook for updating stock
  const updateStockMutation = useUpdateStock();

  // Filter inventory items based on search query and stock filter
  const filteredInventory = inventoryItems.filter((item) => {
    const product = item.product;

    // Search in product name or SKU
    const matchesSearch =
      searchQuery.trim() === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by stock level
    const matchesStockFilter =
      stockFilter === "all" ||
      (stockFilter === "low" && item.quantity <= (item.reorder_level || 10)) ||
      (stockFilter === "out" && item.quantity <= 0) ||
      (stockFilter === "in" && item.quantity > 0);

    return matchesSearch && matchesStockFilter;
  });

  // Get stock status label and variant for badges
  const getStockStatus = (quantity: number, reorderLevel: number | null) => {
    const level = reorderLevel || 10;

    if (quantity <= 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    } else if (quantity <= level) {
      return { label: "Low Stock", variant: "warning" as const };
    } else {
      return { label: "In Stock", variant: "success" as const };
    }
  };

  const handleStockUpdate = async (
    id: string,
    quantity: number,
    isRestock: boolean
  ) => {
    try {
      await updateStockMutation.mutateAsync({
        id,
        quantity,
        isRestock,
      });

      toast({
        title: "Success",
        description: `Inventory ${
          isRestock ? "restocked" : "updated"
        } successfully`,
      });

      setIsStockUpdateModalOpen(false);
      setSelectedInventory(null);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update inventory",
      });
    }
  };

  const isLoading = isInventoryLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isInventoryError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <PackageOpen className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load inventory</h2>
        <p className="text-muted-foreground">
          {inventoryError instanceof Error
            ? inventoryError.message
            : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetchInventory()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/inventory/new">
              <Plus className="mr-2 h-4 w-4" /> Add Inventory
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={stockFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("all")}
            className="w-24"
          >
            All
          </Button>
          <Button
            variant={stockFilter === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("low")}
            className="w-24"
          >
            <AlertTriangle className="mr-1 h-4 w-4 text-amber-500" /> Low
          </Button>
          <Button
            variant={stockFilter === "out" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("out")}
            className="w-24"
          >
            <ArrowDown className="mr-1 h-4 w-4 text-red-500" /> Out
          </Button>
          <Button
            variant={stockFilter === "in" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("in")}
            className="w-24"
          >
            <ArrowUp className="mr-1 h-4 w-4 text-green-500" /> In Stock
          </Button>
        </div>
      </div>

      <div className="rounded-md border shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Product</th>
                <th className="p-4 text-left font-medium">SKU</th>
                <th className="p-4 text-left font-medium">Quantity</th>
                <th className="p-4 text-left font-medium">Reorder Level</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Last Restocked</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {searchQuery.trim() !== "" || stockFilter !== "all"
                      ? "No inventory items match your search criteria"
                      : "No inventory items found"}
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const product = item.product;
                  const stockStatus = getStockStatus(
                    item.quantity,
                    item.reorder_level
                  );

                  return (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4">{product.sku}</td>
                      <td className="p-4 font-medium">{item.quantity}</td>
                      <td className="p-4">{item.reorder_level || 10}</td>
                      <td className="p-4">
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {item.last_restock_date
                          ? new Date(
                              item.last_restock_date
                            ).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInventory(item);
                              setIsStockUpdateModalOpen(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" /> Update Stock
                          </Button>
                          {isAdmin && (
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/dashboard/inventory/${item.id}/edit`}
                              >
                                Edit Details
                              </Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInventory && (
        <StockUpdateModal
          isOpen={isStockUpdateModalOpen}
          onClose={() => {
            setIsStockUpdateModalOpen(false);
            setSelectedInventory(null);
          }}
          inventoryItem={selectedInventory}
          onUpdate={handleStockUpdate}
          isLoading={updateStockMutation.isPending}
        />
      )}
    </div>
  );
}
