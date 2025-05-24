"use client";

import { useParams, useRouter } from "next/navigation";
import { useSale } from "@/hooks/use-sales";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  ArrowLeft,
  User,
  Calendar,
  Receipt,
  DollarSign,
  CreditCard,
  FileText,
  Printer,
  ShoppingCart,
  Package,
  Truck,
  CircleDollarSign,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SaleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const saleId = params.id as string;

  // Get current user to check role
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isSales = currentUser?.role === "sales";

  const { data: sale, isLoading, isError, error } = useSale(saleId);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-semibold">Sale Not Found</h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "The sale you're looking for doesn't exist or has been removed."}
        </p>
        <Button onClick={() => router.push("/dashboard/sales")}>
          Back to Sales
        </Button>
      </div>
    );
  }

  const formattedDate = format(new Date(sale.sale_date), "MMMM d, yyyy h:mm a");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "partial":
        return <Badge variant="outline">Partial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Cash
          </Badge>
        );
      case "card":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Card
          </Badge>
        );
      case "transfer":
        return (
          <Badge
            variant="outline"
            className="text-purple-600 border-purple-600"
          >
            Transfer
          </Badge>
        );
      case "check":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Check
          </Badge>
        );
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Sale Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden md:flex"
          >
            <Printer className="h-4 w-4 mr-2" /> Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoice Information */}
        <div className="md:col-span-2 grid gap-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Invoice Number
                </div>
                <h2 className="text-2xl font-semibold">
                  {sale.invoice_number}
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                {getStatusBadge(sale.payment_status)}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Date</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formattedDate}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Payment Method
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{getPaymentMethodBadge(sale.payment_method)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Customer Information</h3>
            {sale.customer ? (
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">
                    <Link
                      href={`/dashboard/customers/${sale.customer.id}`}
                      className="hover:underline"
                    >
                      {sale.customer.name}
                    </Link>
                  </h4>
                  {sale.customer.email && (
                    <p className="text-muted-foreground">
                      {sale.customer.email}
                    </p>
                  )}
                  {sale.customer.phone && (
                    <p className="text-muted-foreground">
                      {sale.customer.phone}
                    </p>
                  )}
                  {sale.customer.company && (
                    <p className="text-muted-foreground">
                      {sale.customer.company}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <User className="h-5 w-5" />
                <span>Walk-in Customer</span>
              </div>
            )}
          </div>

          {/* Sale Items */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Items</h3>
              <Badge variant="outline">
                <ShoppingCart className="h-3 w-3 mr-1" />
                {sale.items?.length || 0} items
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm">
                    <th className="py-3 px-2 text-left font-medium">Product</th>
                    <th className="py-3 px-2 text-right font-medium">Price</th>
                    <th className="py-3 px-2 text-right font-medium">Qty</th>
                    <th className="py-3 px-2 text-right font-medium">
                      Discount
                    </th>
                    <th className="py-3 px-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items && sale.items.length > 0 ? (
                    sale.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="h-9 w-9 flex-shrink-0 mr-3 rounded bg-muted flex items-center justify-center">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover rounded"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.product?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                SKU: {item.product?.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {item.discount_percent}%
                        </td>
                        <td className="py-3 px-2 text-right font-medium">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sale Summary */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm sticky top-4">
            <h3 className="text-lg font-medium mb-4">Sale Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(sale.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatCurrency(sale.discount_amount || 0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(sale.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Sales Person Info */}
          {sale.sales_person && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Sales Person</h3>
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {sale.sales_person.full_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Staff ID: {sale.sales_person.staff_id}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {sale.notes && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {sale.notes}
              </p>
            </div>
          )}

          {/* Commission Info */}
          {(isAdmin ||
            (isSales && sale.sales_person.id === currentUser?.id)) && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-lg font-medium mb-2">
                Commission Information
              </h3>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CircleDollarSign className="h-4 w-4 mr-2" />
                    Total Commission
                  </div>
                  <div className="font-medium">
                    {formatCurrency(
                      (sale.items || []).reduce(
                        (sum, item) =>
                          sum +
                          item.quantity *
                            item.unit_price *
                            (item.commission_rate / 100),
                        0
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Percent className="h-4 w-4 mr-2" />
                    Commission Rates
                  </div>
                  <div>
                    {[
                      ...new Set(
                        (sale.items || []).map((item) => item.commission_rate)
                      ),
                    ]
                      .sort((a, b) => a - b)
                      .map((rate) => (
                        <Badge key={rate} variant="outline" className="ml-1">
                          {rate}%
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
