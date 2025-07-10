"use client";

import { useParams, useRouter } from "next/navigation";
import { useProduct } from "@/hooks/use-products";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  Pencil,
  Tag,
  Calendar,
  Info,
  ShoppingCart,
  Percent,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  if (isLoading || isUserLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center">
        <Package className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error Loading Product</h2>
        <p className="max-w-md text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading the product details."}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center">
        <Package className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Product Not Found</h2>
        <p className="max-w-md text-muted-foreground">
          The product you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => router.push("/dashboard/products")}>
          View All Products
        </Button>
      </div>
    );
  }

  // Extract inventory data if it exists
  const inventory =
    Array.isArray(product.inventory) && product.inventory.length > 0
      ? product.inventory[0]
      : null;

  // Extract category data if it exists
  const category =
    Array.isArray(product.category) && product.category.length > 0
      ? product.category[0]
      : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Badge variant={product.is_active ? "success" : "destructive"}>
          {product.is_active ? "Active" : "Inactive"}
        </Badge>
        {isAdmin && (
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <Link href={`/dashboard/products/${product.id}/edit`}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Product Image */}
        <div className="md:col-span-1">
          <div className="overflow-hidden border rounded-md bg-card">
            {product.image_url ? (
              <div className="relative aspect-square">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-square bg-muted">
                <Package className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6 md:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">SKU</p>
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                <p>{product.sku}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Category
              </p>
              <p>{category?.name || "No Category"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Cost Price
              </p>
              <div className="flex items-center">
                ₵<p>{formatCurrency(product.cost_price)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Selling Price
              </p>
              <div className="flex items-center">
                <p>{formatCurrency(product.selling_price)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Commission Rate
              </p>
              <div className="flex items-center">
                <Percent className="w-4 h-4 mr-2 text-muted-foreground" />
                <p>{product.commission_rate}%</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <p>{new Date(product.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {inventory && (
            <div className="p-4 border rounded-md">
              <h3 className="mb-4 text-lg font-medium">Inventory</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Available Quantity
                  </p>
                  <div className="flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-muted-foreground" />
                    <p>{inventory.quantity} units</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Reorder Level
                  </p>
                  <p>{inventory.reorder_level || "Not set"}</p>
                </div>
                {inventory.last_restock_date && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Restocked
                    </p>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p>
                        {new Date(
                          inventory.last_restock_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {product.description && (
            <div className="p-4 border rounded-md">
              <div className="flex items-center mb-2">
                <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                <h3 className="text-lg font-medium">Description</h3>
              </div>
              <p className="whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
