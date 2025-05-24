"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/product-form";
import { useProduct } from "@/hooks/use-products";
import { Loading } from "@/components/ui/loading";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading, isError, error } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-xl font-semibold">Error Loading Product</h2>
        <p className="text-muted-foreground max-w-md">
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
        <h2 className="text-xl font-semibold">Product Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The product you are trying to edit does not exist or has been removed.
        </p>
        <Button onClick={() => router.push("/dashboard/products")}>
          View All Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Product: {product.name}</h1>
      </div>

      <ProductForm productId={productId} />
    </div>
  );
}
