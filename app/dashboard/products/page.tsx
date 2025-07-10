"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Package, Search, Plus, Tag, Eye } from "lucide-react";
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
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
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

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();

  // Mutation hook for deleting products
  const deleteProductMutation = useDeleteProduct();

  // Filter products based on search query and category filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;

    return matchesSearch && matchesCategory;
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

  // Find category name by ID
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "None";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const isLoading = isProductsLoading || isCategoriesLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isProductsError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Package className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load products</h2>
        <p className="text-muted-foreground">
          {productsError instanceof Error
            ? productsError.message
            : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetchProducts()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
            defaultValue="all"
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
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
        </div>
      </div>

      <div className="border rounded-md shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 font-medium text-left">Product</th>
                <th className="p-4 font-medium text-left">SKU</th>
                <th className="p-4 font-medium text-left">Category</th>
                <th className="p-4 font-medium text-left">Price</th>
                <th className="p-4 font-medium text-left">Commission</th>
                <th className="p-4 font-medium text-left">Status</th>
                <th className="p-4 font-medium text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {searchQuery.trim() !== "" || categoryFilter !== "all"
                      ? "No products match your search criteria"
                      : "No products found"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors border-b hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="object-cover w-10 h-10 rounded-md"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Tag className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        {product.sku}
                      </div>
                    </td>
                    <td className="p-4">
                      {getCategoryName(product.category_id)}
                    </td>
                    <td className="p-4">
                      {formatCurrency(product.selling_price)}
                    </td>
                    <td className="p-4">{product.commission_rate}%</td>
                    <td className="p-4">
                      <Badge
                        variant={product.is_active ? "success" : "destructive"}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>

                        {isAdmin && (
                          <>
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/dashboard/products/${product.id}/edit`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsDeleteDialogOpen(true);
                              }}
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and may affect existing sales data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedProduct && handleDelete(selectedProduct.id)
              }
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
