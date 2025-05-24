"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Database } from "@/lib/database.types";
import { Package, AlertTriangle } from "lucide-react";

type Inventory = Database["public"]["Tables"]["inventory"]["Row"] & {
  product: Database["public"]["Tables"]["products"]["Row"];
};

interface StockUpdateModalProps {
  inventoryItem: Inventory;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, quantity: number, isRestock: boolean) => void;
  isLoading: boolean;
}

export function StockUpdateModal({
  inventoryItem,
  isOpen,
  onClose,
  onUpdate,
  isLoading,
}: StockUpdateModalProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [isRestock, setIsRestock] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!quantity || quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    // If not restocking (i.e., setting absolute quantity) and quantity is less than current
    // Make sure the user understands this will reduce stock
    if (!isRestock && quantity < inventoryItem.quantity) {
      if (
        !confirm(
          `This will reduce the current stock from ${inventoryItem.quantity} to ${quantity}. Continue?`
        )
      ) {
        return;
      }
    }

    // Clear error if all validations pass
    setError(null);

    // Call the update function
    onUpdate(inventoryItem.id, quantity, isRestock);
  };

  const product = inventoryItem.product;
  const isLowStock =
    inventoryItem.quantity <= (inventoryItem.reorder_level || 10);
  const isOutOfStock = inventoryItem.quantity <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <DialogDescription>
            Update the stock quantity for {product.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor="current-stock">Current Stock</Label>
              <div className="flex items-center">
                <span className="font-medium">{inventoryItem.quantity}</span>
                {isLowStock && (
                  <AlertTriangle
                    className={`ml-2 h-4 w-4 ${
                      isOutOfStock ? "text-red-500" : "text-amber-500"
                    }`}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor="reorder-level">Reorder Level</Label>
              <span>{inventoryItem.reorder_level || 10}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="isRestock">Restock Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRestock"
                    checked={isRestock}
                    onCheckedChange={setIsRestock}
                  />
                  <Label htmlFor="isRestock" className="text-sm">
                    {isRestock ? "Add to existing" : "Set absolute value"}
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRestock
                  ? "Add this quantity to the existing stock"
                  : "Replace the current stock with this quantity"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                {isRestock ? "Quantity to Add" : "New Quantity"}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity || ""}
                onChange={(e) => {
                  setQuantity(parseInt(e.target.value, 10) || 0);
                  setError(null);
                }}
                placeholder="Enter quantity"
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            {isRestock && (
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label>New Stock Level</Label>
                <span className="font-medium">
                  {inventoryItem.quantity + quantity}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
