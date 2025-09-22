"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Package,
  Search,
  Plus,
  Tag,
  Eye,
  RefreshCw,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Filter,
  PackageOpen,
  Boxes,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { useInventory, useUpdateStock } from "@/hooks/use-inventory";
import { useCategories } from "@/hooks/use-categories";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Database } from "@/lib/database.types";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { StockUpdateModal } from "@/components/inventory/stock-update-modal";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Inventory = Database["public"]["Tables"]["inventory"]["Row"] & {
  product: Database["public"]["Tables"]["products"]["Row"];
};

type CombinedProductInventory = {
  product: Product;
  inventory: Inventory | null;
};

export default function ProductsInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  const { toast } = useToast();

  // Get current user to check role
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Use the React Query hooks for data
  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts();

  const {
    data: inventoryItems = [],
    isLoading: isInventoryLoading,
    isError: isInventoryError,
    error: inventoryError,
    refetch: refetchInventory,
  } = useInventory();

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();

  // Mutation hooks
  const deleteProductMutation = useDeleteProduct();
  const updateStockMutation = useUpdateStock();

  // Combine products with their inventory data
  const combinedData: CombinedProductInventory[] = products.map((product) => {
    const inventory = inventoryItems.find(
      (inv) => inv.product.id === product.id
    );
    return {
      product,
      inventory: inventory || null,
    };
  });

  // Filter combined data based on search query, category filter, and stock filter
  const filteredData = combinedData.filter((item) => {
    const product = item.product;
    const inventory = item.inventory;

    // Search in product name, SKU, or description
    const matchesSearch =
      searchQuery.trim() === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by category
    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;

    // Filter by stock level
    const quantity = inventory?.quantity || 0;
    const reorderLevel = inventory?.reorder_level || 10;
    const matchesStockFilter =
      stockFilter === "all" ||
      (stockFilter === "low" && quantity <= reorderLevel) ||
      (stockFilter === "out" && quantity <= 0) ||
      (stockFilter === "in" && quantity > 0);

    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  const handleDelete = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
      });
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

  // Find category name by ID
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "None";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

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

  const isLoading =
    isProductsLoading ||
    isInventoryLoading ||
    isCategoriesLoading ||
    isUserLoading;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isProductsError || isInventoryError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <PackageOpen className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load data</h2>
        <p className="text-muted-foreground">
          {isProductsError && productsError instanceof Error
            ? productsError.message
            : isInventoryError && inventoryError instanceof Error
            ? inventoryError.message
            : "An unexpected error occurred"}
        </p>
        <div className="flex space-x-2">
          <Button onClick={() => refetchProducts()}>Retry Products</Button>
          <Button onClick={() => refetchInventory()}>Retry Inventory</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Products & Inventory
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your product catalog and inventory levels
            </p>
          </div>
          {isAdmin && (
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/inventory/new?returnTo=/dashboard/products">
                      <Boxes className="w-4 h-4 mr-2" />
                      Add to Inventory
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new inventory item</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild>
                    <Link href="/dashboard/products/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new product</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="p-6 space-y-4 border rounded-xl bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Filters & Search</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
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

            {/* Stock Filter */}
            <Select
              value={stockFilter}
              onValueChange={(value) => setStockFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Stock Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in">
                  <div className="flex items-center">
                    <ArrowUp className="w-4 h-4 mr-2 text-green-500" />
                    In Stock
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                    Low Stock
                  </div>
                </SelectItem>
                <SelectItem value="out">
                  <div className="flex items-center">
                    <ArrowDown className="w-4 h-4 mr-2 text-red-500" />
                    Out of Stock
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-center px-4 py-2 border rounded-md bg-background">
              <span className="text-sm font-medium">
                {filteredData.length} result
                {filteredData.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="border rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-muted/80 to-muted/40">
                  <th className="p-4 font-semibold text-left">Product</th>
                  <th className="p-4 font-semibold text-left">SKU</th>
                  <th className="p-4 font-semibold text-left">Category</th>
                  <th className="p-4 font-semibold text-left">Price</th>
                  <th className="p-4 font-semibold text-left">Commission</th>
                  <th className="p-4 font-semibold text-left">Stock</th>
                  <th className="p-4 font-semibold text-left">Stock Status</th>
                  <th className="p-4 font-semibold text-left">Last Restock</th>
                  <th className="p-4 font-semibold text-left">
                    Product Status
                  </th>
                  <th className="p-4 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <PackageOpen className="w-12 h-12 text-muted-foreground/50" />
                        <h3 className="font-medium">No items found</h3>
                        <p className="text-sm">
                          {searchQuery.trim() !== "" ||
                          categoryFilter !== "all" ||
                          stockFilter !== "all"
                            ? "Try adjusting your search criteria"
                            : "Start by adding some products"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const product = item.product;
                    const inventory = item.inventory;
                    const quantity = inventory?.quantity || 0;
                    const reorderLevel = inventory?.reorder_level || 10;
                    const stockStatus = getStockStatus(quantity, reorderLevel);

                    return (
                      <tr
                        key={product.id}
                        className="transition-all border-b hover:bg-muted/30"
                      >
                        {/* Product Info */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-cover w-12 h-12 rounded-lg shadow-sm"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-muted to-muted/50">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <span className="font-medium">
                                {product.name}
                              </span>
                              {product.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="p-4">
                          <div className="flex items-center">
                            <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                            <code className="px-2 py-1 text-xs rounded bg-muted">
                              {product.sku}
                            </code>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <Badge variant="outline">
                            {getCategoryName(product.category_id)}
                          </Badge>
                        </td>

                        {/* Price */}
                        <td className="p-4 font-medium">
                          {formatCurrency(product.selling_price)}
                        </td>

                        {/* Commission */}
                        <td className="p-4">
                          <Badge variant="secondary">
                            {product.commission_rate}%
                          </Badge>
                        </td>

                        {/* Stock Quantity */}
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{quantity}</span>
                            <span className="text-xs text-muted-foreground">
                              Reorder: {reorderLevel}
                            </span>
                          </div>
                        </td>

                        {/* Stock Status */}
                        <td className="p-4">
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </td>

                        {/* Last Restock */}
                        <td className="p-4 text-sm text-muted-foreground">
                          {inventory?.last_restock_date
                            ? new Date(
                                inventory.last_restock_date
                              ).toLocaleDateString()
                            : "Never"}
                        </td>

                        {/* Product Status */}
                        <td className="p-4">
                          <Badge
                            variant={
                              product.is_active ? "success" : "destructive"
                            }
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex space-x-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link
                                    href={`/dashboard/products/${product.id}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View product details</p>
                              </TooltipContent>
                            </Tooltip>

                            {inventory && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedInventory(inventory);
                                      setIsStockUpdateModalOpen(true);
                                    }}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Update stock quantity</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {isAdmin && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link
                                        href={`/dashboard/products/${product.id}/edit`}
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit product</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedProduct(product);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete product</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
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

        {/* Modals */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{selectedProduct?.name}
                &rdquo;? This action cannot be undone and may affect existing
                sales data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedProduct && handleDelete(selectedProduct.id)
                }
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending
                  ? "Deleting..."
                  : "Delete Product"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
    </TooltipProvider>
  );
}
