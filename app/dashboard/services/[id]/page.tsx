"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useServiceRequest,
  useServiceRequestUpdates,
  useServicePartsUsed,
  useUpdateServiceRequest,
  useAddServiceRequestUpdate,
  useTechnicians,
} from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Wrench,
  AlertCircle,
  CheckCircle,
  Pause,
  X,
  Settings,
  Eye,
  MessageSquare,
  Package,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
} from "lucide-react";
import { ServiceAttachments } from "@/components/services/service-attachments";
import { ServicePaymentDialog } from "@/components/services/service-payment-dialog";

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
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPaymentMethodBadge = (method: string) => {
  switch (method) {
    case "cash":
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <DollarSign className="mr-1 h-3 w-3" />
          Cash
        </Badge>
      );
    case "card":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <CreditCard className="mr-1 h-3 w-3" />
          Card
        </Badge>
      );
    case "transfer":
      return (
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          <Package className="mr-1 h-3 w-3" />
          Transfer
        </Badge>
      );
    case "check":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-600">
          <FileText className="mr-1 h-3 w-3" />
          Check
        </Badge>
      );
    default:
      return <Badge variant="outline">{method}</Badge>;
  }
};

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceRequestId = params.id as string;

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updateNote, setUpdateNote] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const { data: currentUser } = useCurrentUser();
  const {
    data: serviceRequest,
    isLoading,
    error,
  } = useServiceRequest(serviceRequestId);
  const { data: updates = [] } = useServiceRequestUpdates(serviceRequestId);
  const { data: partsUsed = [] } = useServicePartsUsed(serviceRequestId);
  const { data: technicians = [] } = useTechnicians();

  const updateServiceRequest = useUpdateServiceRequest();
  const addUpdate = useAddServiceRequestUpdate();

  const isAdmin = currentUser?.role === "admin";
  const isTechnician = currentUser?.role === "technician";
  const isSales = currentUser?.role === "sales";
  const canEdit =
    isAdmin ||
    (isTechnician &&
      serviceRequest?.assigned_technician_id === currentUser?.id);

  const handleStatusUpdate = async () => {
    if (!serviceRequest || !newStatus) return;

    setIsUpdating(true);
    try {
      await updateServiceRequest.mutateAsync({
        id: serviceRequest.id,
        updates: { status: newStatus as any },
      });

      if (updateNote.trim()) {
        await addUpdate.mutateAsync({
          service_request_id: serviceRequest.id,
          updated_by: currentUser!.id,
          status_from: serviceRequest.status,
          status_to: newStatus,
          update_type: "note_added",
          title: "Status update with note",
          description: updateNote.trim(),
          is_customer_visible: true,
        });
      }

      setUpdateDialogOpen(false);
      setNewStatus("");
      setUpdateNote("");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTechnicianAssignment = async () => {
    if (!serviceRequest) return;

    setIsUpdating(true);
    try {
      await updateServiceRequest.mutateAsync({
        id: serviceRequest.id,
        updates: {
          assigned_technician_id:
            selectedTechnician === "unassigned"
              ? null
              : selectedTechnician || null,
        },
      });

      setAssignDialogOpen(false);
      setSelectedTechnician("");
    } catch (error) {
      console.error("Error assigning technician:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !serviceRequest) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Service request not found</h2>
        <p className="text-muted-foreground">
          The service request you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Link href="/dashboard/services">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Service Requests
          </Button>
        </Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[serviceRequest.status]?.icon || Clock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/services">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {serviceRequest.request_number}
            </h1>
            <p className="text-muted-foreground">{serviceRequest.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusConfig[serviceRequest.status]?.color}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusConfig[serviceRequest.status]?.label}
          </Badge>
          <Badge className={priorityConfig[serviceRequest.priority]?.color}>
            {priorityConfig[serviceRequest.priority]?.label}
          </Badge>
          {canEdit && (
            <Link href={`/dashboard/services/${serviceRequest.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Service Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Service Category
                  </Label>
                  <p className="font-medium">
                    {serviceRequest.service_category?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Est. {serviceRequest.service_category?.estimated_duration}{" "}
                    minutes
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Priority
                  </Label>
                  <div className="mt-1">
                    <Badge
                      className={priorityConfig[serviceRequest.priority]?.color}
                    >
                      {priorityConfig[serviceRequest.priority]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="mt-1">{serviceRequest.description}</p>
              </div>

              {serviceRequest.device_type && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Device Information
                  </Label>
                  <div className="mt-1 space-y-1">
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {serviceRequest.device_type}
                    </p>
                    {serviceRequest.device_brand && (
                      <p>
                        <span className="font-medium">Brand:</span>{" "}
                        {serviceRequest.device_brand}
                      </p>
                    )}
                    {serviceRequest.device_model && (
                      <p>
                        <span className="font-medium">Model:</span>{" "}
                        {serviceRequest.device_model}
                      </p>
                    )}
                    {serviceRequest.device_serial_number && (
                      <p>
                        <span className="font-medium">Serial:</span>{" "}
                        {serviceRequest.device_serial_number}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(serviceRequest.customer_notes ||
                serviceRequest.internal_notes) && (
                <div className="space-y-3">
                  {serviceRequest.customer_notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Customer Notes
                      </Label>
                      <p className="mt-1 p-3 bg-muted rounded-md">
                        {serviceRequest.customer_notes}
                      </p>
                    </div>
                  )}
                  {serviceRequest.internal_notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Internal Notes
                      </Label>
                      <p className="mt-1 p-3 bg-muted rounded-md">
                        {serviceRequest.internal_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parts Used */}
          {partsUsed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Parts Used</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partsUsed.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{part.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {part.product?.sku} • Qty: {part.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(part.total_cost)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(part.unit_cost)} each
                        </p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Parts Cost:</span>
                    <span>
                      {formatCurrency(
                        partsUsed.reduce(
                          (sum, part) => sum + part.total_cost,
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Updates Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Updates & Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No updates yet
                </p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{update.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(update.created_at)}
                          </p>
                        </div>
                        {update.description && (
                          <p className="text-muted-foreground mt-1">
                            {update.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          by {update.updated_by_user?.full_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Attachments */}
          <ServiceAttachments serviceRequestId={serviceRequest.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog
                  open={updateDialogOpen}
                  onOpenChange={setUpdateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Service Status</DialogTitle>
                      <DialogDescription>
                        Change the status of this service request and optionally
                        add a note.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>New Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(
                              ([key, config]) => (
                                <SelectItem
                                  key={key}
                                  value={key}
                                  disabled={key === serviceRequest.status}
                                >
                                  {config.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Update Note (Optional)</Label>
                        <Textarea
                          placeholder="Add a note about this status change..."
                          value={updateNote}
                          onChange={(e) => setUpdateNote(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setUpdateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleStatusUpdate}
                        disabled={!newStatus || isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Update Status"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Link
                  href={`/dashboard/services/${serviceRequest.id}/communication`}
                >
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Customer Communication
                  </Button>
                </Link>

                <ServicePaymentDialog serviceRequest={serviceRequest} />

                {isAdmin && (
                  <Dialog
                    open={assignDialogOpen}
                    onOpenChange={setAssignDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <User className="mr-2 h-4 w-4" />
                        Assign Technician
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Technician</DialogTitle>
                        <DialogDescription>
                          Assign or change the technician for this service
                          request.
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <Label>Technician</Label>
                        <Select
                          value={selectedTechnician}
                          onValueChange={setSelectedTechnician}
                          defaultValue={
                            serviceRequest.assigned_technician_id ||
                            "unassigned"
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select technician" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {technicians.map((technician) => (
                              <SelectItem
                                key={technician.id}
                                value={technician.id}
                              >
                                {technician.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAssignDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleTechnicianAssignment}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Assigning..." : "Assign Technician"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer Information */}
          {serviceRequest.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{serviceRequest.customer.name}</p>
                  {serviceRequest.customer.company && (
                    <p className="text-sm text-muted-foreground">
                      {serviceRequest.customer.company}
                    </p>
                  )}
                </div>
                {serviceRequest.customer.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {serviceRequest.customer.email}
                    </span>
                  </div>
                )}
                {serviceRequest.customer.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {serviceRequest.customer.phone}
                    </span>
                  </div>
                )}
                {serviceRequest.customer.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">
                      {serviceRequest.customer.address}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(serviceRequest.created_at)}
                </span>
              </div>

              {serviceRequest.assigned_technician && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Technician
                  </span>
                  <span className="text-sm font-medium">
                    {serviceRequest.assigned_technician.full_name}
                  </span>
                </div>
              )}

              {serviceRequest.estimated_completion && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Est. Completion
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(serviceRequest.estimated_completion)}
                  </span>
                </div>
              )}

              {serviceRequest.estimated_cost && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Est. Cost
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(serviceRequest.estimated_cost)}
                  </span>
                </div>
              )}

              {serviceRequest.final_cost && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Final Cost
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(serviceRequest.final_cost)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Status
                </span>
                {getPaymentStatusBadge(serviceRequest.payment_status)}
              </div>

              {serviceRequest.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Method
                  </span>
                  {getPaymentMethodBadge(serviceRequest.payment_method)}
                </div>
              )}

              {(isAdmin || isSales) && (
                <div className="pt-2">
                  <Link
                    href={`/dashboard/services/${serviceRequest.id}/payment`}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Payment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
