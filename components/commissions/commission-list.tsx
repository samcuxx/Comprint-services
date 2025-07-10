"use client";

import React, { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useCommissions,
  useUpdateCommission,
  useBulkPayCommissions,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {

  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  MoreHorizontal,

  User,
  X,
  CreditCard,
  Users,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

interface GroupedCommission {
  salesPerson: {
    id: string;
    full_name: string;
  };
  dates: {
    date: string;
    commissions: Array<{
      id: string;
      commission_amount: number;
      is_paid: boolean;
      payment_date: string | null;
      created_at: string;
      sale?: {
        id: string;
        invoice_number: string;
      };
    }>;
    totalAmount: number;
    unpaidAmount: number;
    paidAmount: number;
    hasUnpaid: boolean;
  }[];
}

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
  const [selectedBulkPayment, setSelectedBulkPayment] = useState<{
    salesPersonId: string;
    date: string;
    salesPersonName: string;
  } | null>(null);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [isBulkPayoutDialogOpen, setIsBulkPayoutDialogOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
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
  const bulkPayCommissionsMutation = useBulkPayCommissions();

  // Group commissions by sales person and date
  const groupedCommissions: GroupedCommission[] = React.useMemo(() => {
    const groups = new Map<string, GroupedCommission>();

    commissions.forEach((commission) => {
      if (!commission.sales_person) return;

      const salesPersonId = commission.sales_person.id;
      const commissionDate = format(
        new Date(commission.created_at),
        "yyyy-MM-dd"
      );

      if (!groups.has(salesPersonId)) {
        groups.set(salesPersonId, {
          salesPerson: commission.sales_person,
          dates: [],
        });
      }

      const group = groups.get(salesPersonId)!;
      let dateGroup = group.dates.find((d) => d.date === commissionDate);

      if (!dateGroup) {
        dateGroup = {
          date: commissionDate,
          commissions: [],
          totalAmount: 0,
          unpaidAmount: 0,
          paidAmount: 0,
          hasUnpaid: false,
        };
        group.dates.push(dateGroup);
      }

      dateGroup.commissions.push({
        id: commission.id,
        commission_amount: commission.commission_amount,
        is_paid: commission.is_paid,
        payment_date: commission.payment_date,
        created_at: commission.created_at,
        sale: commission.sale,
      });

      dateGroup.totalAmount += commission.commission_amount;
      if (commission.is_paid) {
        dateGroup.paidAmount += commission.commission_amount;
      } else {
        dateGroup.unpaidAmount += commission.commission_amount;
        dateGroup.hasUnpaid = true;
      }
    });

    // Sort dates in descending order for each sales person
    groups.forEach((group) => {
      group.dates.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.salesPerson.full_name.localeCompare(b.salesPerson.full_name)
    );
  }, [commissions]);

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

  const handleBulkPayCommissions = async () => {
    if (!selectedBulkPayment) return;

    try {
      const result = await bulkPayCommissionsMutation.mutateAsync({
        salesPersonId: selectedBulkPayment.salesPersonId,
        date: selectedBulkPayment.date,
      });

      toast({
        title: "Success",
        description: `Successfully marked ${result.length} commissions as paid for ${selectedBulkPayment.salesPersonName}`,
      });

      setIsBulkPayoutDialogOpen(false);
      setSelectedBulkPayment(null);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process bulk payment",
      });
    }
  };

  const toggleGroup = (salesPersonId: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(salesPersonId)) {
      newOpenGroups.delete(salesPersonId);
    } else {
      newOpenGroups.add(salesPersonId);
    }
    setOpenGroups(newOpenGroups);
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
        <span> ₵ </span>
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
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-dashed h-9">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="px-1 ml-2 rounded-full">
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
                    <div className="grid items-center grid-cols-3 gap-4">
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
                    <div className="grid items-center grid-cols-3 gap-4">
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
                    <X className="w-4 h-4 mr-2" />
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
      </div>

      {/* Grouped Commissions */}
      <div className="space-y-4">
        {groupedCommissions.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No commissions found</h3>
            <p className="text-muted-foreground">
              {activeFiltersCount > 0
                ? "No commissions match your filter criteria"
                : "No commissions have been recorded yet"}
            </p>
          </div>
        ) : (
          groupedCommissions.map((group) => (
            <div
              key={group.salesPerson.id}
              className="border rounded-lg shadow-sm"
            >
              <Collapsible
                open={openGroups.has(group.salesPerson.id)}
                onOpenChange={() => toggleGroup(group.salesPerson.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      {openGroups.has(group.salesPerson.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">
                            {group.salesPerson.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {group.dates.length} day
                            {group.dates.length !== 1 ? "s" : ""} with
                            commissions
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(
                          group.dates.reduce(
                            (sum, date) => sum + date.totalAmount,
                            0
                          )
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total commissions
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t">
                    {group.dates.map((dateGroup) => (
                      <div
                        key={dateGroup.date}
                        className="border-b last:border-b-0"
                      >
                        <div className="flex items-center justify-between p-4 bg-muted/20">
                          <div className="flex items-center space-x-3">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {format(
                                  new Date(dateGroup.date),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dateGroup.commissions.length} commission
                                {dateGroup.commissions.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-semibold">
                                {formatCurrency(dateGroup.totalAmount)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dateGroup.hasUnpaid && (
                                  <span className="text-amber-600">
                                    {formatCurrency(dateGroup.unpaidAmount)}{" "}
                                    unpaid
                                  </span>
                                )}
                                {!dateGroup.hasUnpaid && (
                                  <span className="text-green-600">
                                    All paid
                                  </span>
                                )}
                              </div>
                            </div>
                            {isAdmin && dateGroup.hasUnpaid && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBulkPayment({
                                    salesPersonId: group.salesPerson.id,
                                    date: dateGroup.date,
                                    salesPersonName:
                                      group.salesPerson.full_name,
                                  });
                                  setIsBulkPayoutDialogOpen(true);
                                }}
                                disabled={bulkPayCommissionsMutation.isPending}
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Pay All (
                                {formatCurrency(dateGroup.unpaidAmount)})
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Individual Commissions */}
                        <div className="divide-y">
                          {dateGroup.commissions.map((commission) => (
                            <div
                              key={commission.id}
                              className="p-4 pl-12 transition-colors hover:bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-sm">
                                    {commission.sale && (
                                      <Link
                                        href={`/dashboard/sales/${commission.sale.id}`}
                                        className="font-medium text-primary hover:underline"
                                      >
                                        {commission.sale.invoice_number}
                                      </Link>
                                    )}
                                  </div>
                                  <Badge
                                    variant={
                                      commission.is_paid ? "success" : "outline"
                                    }
                                  >
                                    {commission.is_paid ? "Paid" : "Unpaid"}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="text-right">
                                    <div className="font-medium">
                                      {formatCurrency(
                                        commission.commission_amount
                                      )}
                                    </div>
                                    {commission.payment_date && (
                                      <div className="text-xs text-muted-foreground">
                                        Paid{" "}
                                        {format(
                                          new Date(commission.payment_date),
                                          "MMM d"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
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
                                      {isAdmin && !commission.is_paid && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedCommissionId(
                                              commission.id
                                            );
                                            setIsPayoutDialogOpen(true);
                                          }}
                                        >
                                          <Check className="w-4 h-4 mr-2" />
                                          Mark as Paid
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))
        )}
      </div>

      {/* Individual Commission Payment Dialog */}
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

      {/* Bulk Payment Dialog */}
      <AlertDialog
        open={isBulkPayoutDialogOpen}
        onOpenChange={setIsBulkPayoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Commission Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark all unpaid commissions for{" "}
              <strong>{selectedBulkPayment?.salesPersonName}</strong> on{" "}
              <strong>
                {selectedBulkPayment &&
                  format(new Date(selectedBulkPayment.date), "MMMM d, yyyy")}
              </strong>{" "}
              as paid? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsBulkPayoutDialogOpen(false);
                setSelectedBulkPayment(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkPayCommissions}
              className="bg-green-600 hover:bg-green-700"
              disabled={bulkPayCommissionsMutation.isPending}
            >
              {bulkPayCommissionsMutation.isPending
                ? "Processing..."
                : "Confirm Bulk Payment"}
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
