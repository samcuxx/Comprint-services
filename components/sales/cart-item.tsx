"use client";

import React from "react";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export interface CartItem {
  product_id: string;
  name: string;
  sku: string;
  image_url?: string;
  quantity: number;
  available_quantity: number;
  unit_price: number;
  commission_rate: number;
  discount_percent: number;
  total_price: number;
}

interface CartItemProps {
  item: CartItem;
  onRemove: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onDiscountChange: (productId: string, discountPercent: number) => void;
}

export function CartItemComponent({
  item,
  onRemove,
  onQuantityChange,
  onDiscountChange,
}: CartItemProps) {
  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(
      1,
      Math.min(item.available_quantity, item.quantity + change)
    );
    if (newQuantity !== item.quantity) {
      onQuantityChange(item.product_id, newQuantity);
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const discountPercent = isNaN(value)
      ? 0
      : Math.min(100, Math.max(0, value));
    onDiscountChange(item.product_id, discountPercent);
  };

  return (
    <div className="flex flex-col border-b pb-4 mb-4 last:mb-0 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-12 w-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">
                {item.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm">{item.name}</h4>
            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onRemove(item.product_id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-2 mt-2">
        <div className="col-span-4">
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <div className="h-8 px-3 flex items-center justify-center border-y">
              {item.quantity}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => handleQuantityChange(1)}
              disabled={item.quantity >= item.available_quantity}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          {item.quantity === item.available_quantity && (
            <p className="text-xs text-amber-600 mt-1">Max stock reached</p>
          )}
        </div>

        <div className="col-span-3">
          <div className="text-xs text-muted-foreground mb-1">Unit Price</div>
          <div className="font-medium">{formatCurrency(item.unit_price)}</div>
        </div>

        <div className="col-span-2">
          <div className="text-xs text-muted-foreground mb-1">Discount %</div>
          <input
            type="number"
            min="0"
            max="100"
            value={item.discount_percent}
            onChange={handleDiscountChange}
            className="w-full h-8 px-2 text-sm border rounded-md"
            title="Discount Percentage"
            aria-label="Discount Percentage"
          />
        </div>

        <div className="col-span-3 text-right">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="font-medium">{formatCurrency(item.total_price)}</div>
        </div>
      </div>
    </div>
  );
}
