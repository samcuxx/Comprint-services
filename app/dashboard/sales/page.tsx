"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Search,
  Plus,
  Receipt,
  User,
  Calendar,
  DollarSign,
  MoreHorizontal,
  FileText,
  Trash2,
  Filter,
  X,
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
import { useSales, useDeleteSale } from "@/hooks/use-sales";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCustomers } from "@/hooks/use-customers";
import { Database } from "@/lib/database.types";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SalesPage() {
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    customerId: undefined as string | undefined,
    status: undefined as string | undefined,
  });
  const { toast } = useToast();

  // Get current user to check role
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isSales = currentUser?.role === "sales";

  // Use the React Query hooks for data
  const {
    data: sales = [],
    isLoading: isSalesLoading,
    isError: isSalesError,
    error: salesError,
    refetch: refetchSales,
  } = useSales(filters);

  // Fetch customers for filter
  const { data: customers = [] } = useCustomers();

  // Delete sale mutation
  const deleteSaleMutation = useDeleteSale();

  const handleDeleteSale = async () => {
    if (!selectedSaleId) return;

    try {
      await deleteSaleMutation.mutateAsync(selectedSaleId);

      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedSaleId(null);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete sale",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      customerId: undefined,
      status: undefined,
    });
  };

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

  const isLoading = isSalesLoading || isUserLoading;
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isSalesError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <ShoppingCart className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load sales</h2>
        <p className="text-muted-foreground">
          {salesError instanceof Error
            ? salesError.message
            : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetchSales()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        {(isAdmin || isSales) && (
          <Button asChild>
            <Link href="/dashboard/sales/new">
              <Plus className="mr-2 h-4 w-4" /> New Sale
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-dashed">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full px-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Date Range</h4>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="from">From</Label>
                      <div className="col-span-2">
                        <Input
                          id="from"
                          type="date"
                          value={filters.startDate || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              startDate: e.target.value || undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="to">To</Label>
                      <div className="col-span-2">
                        <Input
                          id="to"
                          type="date"
                          value={filters.endDate || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              endDate: e.target.value || undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Customer</h4>
                  <Select
                    value={filters.customerId}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        customerId: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Status</h4>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        status: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="px-3"
                    onClick={clearFilters}
                    variant="outline"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                  <Button className="w-full" onClick={() => refetchSales()}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Invoice</th>
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Customer</th>
                <th className="p-4 text-left font-medium">Payment</th>
                <th className="p-4 text-left font-medium">Amount</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {activeFiltersCount > 0
                      ? "No sales match your filter criteria"
                      : "No sales found"}
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium">
                      <Link
                        href={`/dashboard/sales/${sale.id}`}
                        className="hover:underline text-primary"
                      >
                        {sale.invoice_number}
                      </Link>
                    </td>
                    <td className="p-4">
                      {format(new Date(sale.sale_date), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4">
                      {sale.customer ? (
                        <Link
                          href={`/dashboard/customers/${sale.customer.id}`}
                          className="hover:underline flex items-center"
                        >
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          {sale.customer.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Walk-in</span>
                      )}
                    </td>
                    <td className="p-4">
                      {getPaymentMethodBadge(sale.payment_method)}
                    </td>
                    <td className="p-4 font-medium">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(sale.payment_status)}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/sales/${sale.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedSaleId(sale.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Sale
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sale? This will also delete
              all related sale items and commission records. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedSaleId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSale}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSaleMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Simple Label component for the filter popover
function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}
