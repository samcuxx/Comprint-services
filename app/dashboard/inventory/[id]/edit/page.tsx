"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { useInventoryItem } from "@/hooks/use-inventory";
import { Loading } from "@/components/ui/loading";

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const inventoryId = params.id as string;

  const {
    data: inventoryItem,
    isLoading,
    isError,
    error,
  } = useInventoryItem(inventoryId);

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
        <h2 className="text-xl font-semibold">Error Loading Inventory</h2>
        <p className="text-muted-foreground max-w-md">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading the inventory details."}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!inventoryItem) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-xl font-semibold">Inventory Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The inventory item you are trying to edit does not exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/dashboard/inventory")}>
          View All Inventory
        </Button>
      </div>
    );
  }

  const productName = inventoryItem.product?.name || "Inventory Item";

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
        <h1 className="text-2xl font-bold">Edit Inventory: {productName}</h1>
      </div>

      <InventoryForm inventoryId={inventoryId} />
    </div>
  );
}
