"use client";

import { useState } from "react";
import Link from "next/link";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Clock,
  AlertCircle,
  CheckCircle,
  Pause,
  X,
  Eye,
  Settings,
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  assigned: {
    label: "Assigned",
    color: "bg-blue-100 text-blue-800",
    icon: Eye,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800",
    icon: Settings,
  },
  waiting_parts: {
    label: "Waiting Parts",
    color: "bg-orange-100 text-orange-800",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: X },
  on_hold: {
    label: "On Hold",
    color: "bg-gray-100 text-gray-800",
    icon: Pause,
  },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "partial":
      return <Badge className="bg-blue-100 text-blue-800">Partial</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status || "Pending"}</Badge>;
  }
};

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const { data: currentUser } = useCurrentUser();
  const { data: serviceRequests = [], isLoading, error } = useServiceRequests();

  const isAdmin = currentUser?.role === "admin";
  const isTechnician = currentUser?.role === "technician";
  const isSales = currentUser?.role === "sales";

  // Filter service requests based on user role and filters
  // Note: Role-based filtering is now handled in the useServiceRequests hook
  const filteredRequests =
    serviceRequests?.filter((request) => {
      const matchesSearch =
        !searchTerm ||
        request.request_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.service_category?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || request.priority === priorityFilter;
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        (request.payment_status || "pending") === paymentStatusFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesPaymentStatus
      );
    }) || [];

  // Calculate stats
  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter((r) => r.status === "pending").length,
    in_progress: filteredRequests.filter((r) => r.status === "in_progress")
      .length,
    completed: filteredRequests.filter((r) => r.status === "completed").length,
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">
          Failed to load service requests
        </h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Service Requests
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage all service requests and assignments across the organization"
              : isTechnician
              ? "View and update service requests assigned to you"
              : isSales
              ? "Create and track service requests for customers"
              : "Create and track service requests"}
          </p>
        </div>
        {(isAdmin || isSales) && (
          <Link href="/dashboard/services/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Service Request
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by request number, title, customer, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={paymentStatusFilter}
              onValueChange={setPaymentStatusFilter}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Service Requests ({filteredRequests.length})
              {isTechnician && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (Assigned to you)
                </span>
              )}
            </CardTitle>
            {isTechnician && (
              <div className="text-sm text-muted-foreground">
                Only showing your assigned requests
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No service requests found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                statusFilter !== "all" ||
                priorityFilter !== "all" ||
                paymentStatusFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : isTechnician
                  ? "No service requests have been assigned to you yet."
                  : "Get started by creating your first service request."}
              </p>
              {(isAdmin || isSales) && (
                <Link href="/dashboard/services/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Service Request
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    {isAdmin && <TableHead>Technician</TableHead>}
                    <TableHead>Payment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const StatusIcon =
                      statusConfig[request.status]?.icon || Clock;
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.request_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.title}</div>
                            {request.device_type && (
                              <div className="text-sm text-muted-foreground">
                                {request.device_brand} {request.device_model}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.customer ? (
                            <div>
                              <div className="font-medium">
                                {request.customer.name}
                              </div>
                              {request.customer.email && (
                                <div className="text-sm text-muted-foreground">
                                  {request.customer.email}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Walk-in
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.service_category?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.service_category?.estimated_duration}min
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={statusConfig[request.status]?.color}
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[request.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={priorityConfig[request.priority]?.color}
                          >
                            {priorityConfig[request.priority]?.label}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {request.assigned_technician ? (
                              <div className="font-medium">
                                {request.assigned_technician.full_name}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          {getPaymentStatusBadge(request.payment_status)}
                        </TableCell>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell>
                          {request.final_cost
                            ? formatCurrency(request.final_cost)
                            : request.estimated_cost
                            ? formatCurrency(request.estimated_cost) + " (est.)"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/services/${request.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
