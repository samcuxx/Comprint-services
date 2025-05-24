"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useCommissions,
  useUpdateCommission,
  useSyncCommissions,
} from "@/hooks/use-commissions";
import { useSalesPersons } from "@/hooks/use-sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Calendar,
  Check,
  ChevronDown,
  DollarSign,
  Filter,
  MoreHorizontal,
  Search,
  User,
  X,
} from "lucide-react";
import Link from "next/link";

export function CommissionList() {
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    salesPersonId: undefined as string | undefined,
    isPaid: undefined as boolean | undefined,
  });
  const [selectedCommissionId, setSelectedCommissionId] = useState<
    string | null
  >(null);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [isFixingCommission, setIsFixingCommission] = useState(false);
  const [isFixingAllCommissions, setIsFixingAllCommissions] = useState(false);
  const { toast } = useToast();

  // Get current user to check role
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isSales = currentUser?.role === "sales";

  // Fetch commissions data
  const {
    data: commissions = [],
    isLoading: isCommissionsLoading,
    isError: isCommissionsError,
    error: commissionsError,
    refetch: refetchCommissions,
  } = useCommissions(
    isSales
      ? {
          ...filters,
          salesPersonId: currentUser?.id,
        }
      : filters
  );

  // Fetch sales persons for filter (admin only)
  const { data: salesPersons = [], isLoading: isSalesPersonsLoading } =
    useSalesPersons();

  // Update commission mutation (mark as paid)
  const updateCommissionMutation = useUpdateCommission();

  // Add the sync commission mutation
  const syncCommissionMutation = useSyncCommissions();

  const handlePayCommission = async () => {
    if (!selectedCommissionId) return;

    try {
      await updateCommissionMutation.mutateAsync({
        id: selectedCommissionId,
        is_paid: true,
      });

      toast({
        title: "Success",
        description: "Commission marked as paid successfully",
      });

      setIsPayoutDialogOpen(false);
      setSelectedCommissionId(null);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update commission",
      });
    }
  };

  // Add a function to fix commission amount
  const handleFixCommission = async (commissionId: string) => {
    setIsFixingCommission(true);
    try {
      await syncCommissionMutation.mutateAsync(commissionId);
      toast({
        title: "Success",
        description: "Commission amount updated successfully",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update commission amount",
      });
    } finally {
      setIsFixingCommission(false);
    }
  };

  // Add a function to fix all commission amounts that are zero
  const handleFixAllCommissions = async () => {
    const commissionsToFix = commissions.filter(
      (commission) =>
        commission.commission_amount === 0 || !commission.commission_amount
    );

    if (commissionsToFix.length === 0) {
      toast({
        title: "No commissions to fix",
        description: "All commissions already have proper amounts",
      });
      return;
    }

    setIsFixingAllCommissions(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process each commission sequentially
      for (const commission of commissionsToFix) {
        try {
          await syncCommissionMutation.mutateAsync(commission.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to fix commission ${commission.id}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Commission Fix Completed",
        description: `Successfully fixed ${successCount} commissions. ${
          errorCount > 0 ? `Failed to fix ${errorCount} commissions.` : ""
        }`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fixing commissions",
      });
    } finally {
      setIsFixingAllCommissions(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      salesPersonId: undefined,
      isPaid: undefined,
    });
  };

  const isLoading =
    isCommissionsLoading || isUserLoading || isSalesPersonsLoading;
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isCommissionsError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <DollarSign className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load commissions</h2>
        <p className="text-muted-foreground">
          {commissionsError instanceof Error
            ? commissionsError.message
            : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetchCommissions()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

                {isAdmin && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Sales Person</h4>
                    <Select
                      value={filters.salesPersonId || "all"}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          salesPersonId: value === "all" ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All sales persons" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sales Persons</SelectItem>
                        {salesPersons.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Payment Status</h4>
                  <Select
                    value={
                      filters.isPaid === undefined
                        ? "all"
                        : filters.isPaid
                        ? "paid"
                        : "unpaid"
                    }
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        isPaid:
                          value === "all"
                            ? undefined
                            : value === "paid"
                            ? true
                            : false,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
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
                  <Button
                    className="w-full"
                    onClick={() => refetchCommissions()}
                  >
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

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFixAllCommissions}
            disabled={isFixingAllCommissions}
            className="h-9"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            {isFixingAllCommissions
              ? "Fixing Commissions..."
              : "Fix All Zero Commissions"}
          </Button>
        )}
      </div>

      <div className="rounded-md border shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Invoice</th>
                {isAdmin && (
                  <th className="p-4 text-left font-medium">Sales Person</th>
                )}
                <th className="p-4 text-left font-medium">Amount</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Payment Date</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {activeFiltersCount > 0
                      ? "No commissions match your filter criteria"
                      : "No commissions found"}
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr
                    key={commission.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      {format(new Date(commission.created_at), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4">
                      {commission.sale && (
                        <Link
                          href={`/dashboard/sales/${commission.sale.id}`}
                          className="text-primary hover:underline"
                        >
                          {commission.sale.invoice_number}
                        </Link>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-4">
                        {commission.sales_person && (
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{commission.sales_person.full_name}</span>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="p-4 font-medium">
                      {formatCurrency(commission.commission_amount)}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={commission.is_paid ? "success" : "outline"}
                      >
                        {commission.is_paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {commission.payment_date
                        ? format(
                            new Date(commission.payment_date),
                            "MMM dd, yyyy"
                          )
                        : "-"}
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
                          {commission.sale && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/sales/${commission.sale.id}`}
                              >
                                View Sale Details
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {(commission.commission_amount === 0 ||
                            !commission.commission_amount) && (
                            <DropdownMenuItem
                              onClick={() => handleFixCommission(commission.id)}
                              disabled={
                                isFixingCommission ||
                                syncCommissionMutation.isPending
                              }
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Fix Commission Amount
                            </DropdownMenuItem>
                          )}
                          {isAdmin && !commission.is_paid && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCommissionId(commission.id);
                                setIsPayoutDialogOpen(true);
                              }}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Paid
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
        open={isPayoutDialogOpen}
        onOpenChange={setIsPayoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Commission Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this commission as paid? This will
              record the current date as the payment date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsPayoutDialogOpen(false);
                setSelectedCommissionId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePayCommission}
              className="bg-green-600 hover:bg-green-700"
              disabled={updateCommissionMutation.isPending}
            >
              {updateCommissionMutation.isPending
                ? "Processing..."
                : "Confirm Payment"}
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
