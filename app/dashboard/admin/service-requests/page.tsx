"use client";

import { useState } from "react";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  assigned: { label: "Assigned", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-800" },
  waiting_parts: {
    label: "Waiting Parts",
    color: "bg-orange-100 text-orange-800",
  },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  on_hold: { label: "On Hold", color: "bg-gray-100 text-gray-800" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
};

export default function AdminServiceRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: currentUser } = useCurrentUser();
  const {
    data: serviceRequests = [],
    isLoading,
    error,
  } = useServiceRequests(searchQuery);

  // Check if user is admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. Admin privileges required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Error loading service requests: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Requests Management</h1>
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Service Request
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search service requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Requests List */}
      <div className="grid gap-4">
        {serviceRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    #{request.request_number}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={statusConfig[request.status]?.color}>
                    {statusConfig[request.status]?.label}
                  </Badge>
                  <Badge className={priorityConfig[request.priority]?.color}>
                    {priorityConfig[request.priority]?.label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {request.customer?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Technician</p>
                  <p className="text-sm text-muted-foreground">
                    {request.assigned_technician?.full_name || "Unassigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(request.created_at)}
                  </p>
                </div>
              </div>

              {request.estimated_cost && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(request.estimated_cost)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Link href={`/dashboard/services/${request.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Link href={`/dashboard/services/${request.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {serviceRequests.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No service requests found.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
