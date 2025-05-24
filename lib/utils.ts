import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: GHS for Ghanaian Cedi)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a random SKU for products
 * @param prefix Optional prefix for the SKU
 * @returns A random SKU string
 */
export function generateSku(prefix = "PRD") {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomPart}-${timestamp}`;
}

/**
 * Calculate the total price for a product
 * @param quantity Quantity of products
 * @param unitPrice Price per unit
 * @param discountPercent Optional discount percentage
 * @returns Total price after discount
 */
export function calculateTotalPrice(
  quantity: number,
  unitPrice: number,
  discountPercent = 0
) {
  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * (discountPercent / 100);
  return subtotal - discountAmount;
}
