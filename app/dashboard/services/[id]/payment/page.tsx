"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useServiceRequest,
  useUpdateServiceRequest,
  useAddServiceRequestUpdate,
} from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Package,
  Loader2,
} from "lucide-react";

const paymentSchema = z.object({
  final_cost: z.number().positive("Final cost must be positive"),
  payment_method: z.enum(["cash", "card", "transfer", "check", "other"]),
  payment_status: z.enum(["pending", "paid", "partial", "cancelled"]),
  payment_notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function ServicePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const serviceRequestId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const {
    data: serviceRequest,
    isLoading,
    error,
  } = useServiceRequest(serviceRequestId);

  const updateServiceRequest = useUpdateServiceRequest();
  const addUpdate = useAddServiceRequestUpdate();
  const { toast } = useToast();

  // Allow all users to manage payments
  const canManagePayment = !!currentUser;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      final_cost:
        serviceRequest?.final_cost || serviceRequest?.estimated_cost || 0,
      payment_method: serviceRequest?.payment_method || "cash",
      payment_status: serviceRequest?.payment_status || "pending",
      payment_notes: "",
    },
  });

  // Update form when service request data loads
  React.useEffect(() => {
    if (serviceRequest) {
      form.reset({
        final_cost:
          serviceRequest.final_cost || serviceRequest.estimated_cost || 0,
        payment_method: serviceRequest.payment_method || "cash",
        payment_status: serviceRequest.payment_status || "pending",
        payment_notes: "",
      });
    }
  }, [serviceRequest, form]);

  const handleSubmit = async (data: PaymentFormData) => {
    if (!serviceRequest || !currentUser) return;

    setIsSubmitting(true);
    try {
      const previousStatus = serviceRequest.payment_status;

      await updateServiceRequest.mutateAsync({
        id: serviceRequest.id,
        final_cost: data.final_cost,
        payment_method: data.payment_method,
        payment_status: data.payment_status,
        payment_notes: data.payment_notes,
        // Add completion date if status is paid and service is completed
        completed_date:
          data.payment_status === "paid" &&
          serviceRequest.status === "completed"
            ? new Date().toISOString()
            : serviceRequest.completed_date,
      });

      // Add update log
      await addUpdate.mutateAsync({
        service_request_id: serviceRequest.id,
        updated_by: currentUser.id,
        update_type: "payment_received",
        title: `Payment status updated to ${data.payment_status}`,
        description: `Payment method: ${
          data.payment_method
        }. Final cost: ${formatCurrency(data.final_cost)}${
          data.payment_notes ? `. Notes: ${data.payment_notes}` : ""
        }`,
        status_from: previousStatus,
        status_to: data.payment_status,
        is_customer_visible: true,
      });

      toast({
        title: "Success",
        description: "Payment information updated successfully",
      });

      router.push(`/dashboard/services/${serviceRequest.id}`);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="text-green-800 bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="text-yellow-800 bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "partial":
        return <Badge className="text-blue-800 bg-blue-100">₵ Partial</Badge>;
      case "cancelled":
        return (
          <Badge className="text-red-800 bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            ₵ Cash
          </Badge>
        );
      case "card":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <CreditCard className="w-3 h-3 mr-1" />
            Card
          </Badge>
        );
      case "transfer":
        return (
          <Badge
            variant="outline"
            className="text-purple-600 border-purple-600"
          >
            <Package className="w-3 h-3 mr-1" />
            Transfer
          </Badge>
        );
      case "check":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            <FileText className="w-3 h-3 mr-1" />
            Check
          </Badge>
        );
      default:
        return <Badge variant="outline">{method}</Badge>;
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
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Service request not found</h2>
        <p className="text-muted-foreground">
          The service request you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have permission to view it.
        </p>
        <Link href="/dashboard/services">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Requests
          </Button>
        </Link>
      </div>
    );
  }

  if (!canManagePayment) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to manage payments for this service
          request.
        </p>
        <Link href={`/dashboard/services/${serviceRequest.id}`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Request
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/services/${serviceRequest.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payment Management
            </h1>
            <p className="text-muted-foreground">
              {serviceRequest.request_number} - {serviceRequest.title}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  {/* Final Cost */}
                  <FormField
                    control={form.control}
                    name="final_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Cost *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Payment Method */}
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">
                                <div className="flex items-center space-x-2">
                                  {/* <DollarSign className="w-4 h-4" /> */}
                                  <span>₵ Cash</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Status */}
                    <FormField
                      control={form.control}
                      name="payment_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-yellow-600" />
                                  <span>Pending</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="paid">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>Paid</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="partial">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-blue-600" />
                                  <span>Partial</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cancelled">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  <span>Cancelled</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Payment Notes */}
                  <FormField
                    control={form.control}
                    name="payment_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about the payment..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-4">
                    <Link href={`/dashboard/services/${serviceRequest.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Update Payment
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Current Payment Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getPaymentStatusBadge(
                  serviceRequest.payment_status || "pending"
                )}
              </div>

              {serviceRequest.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  {getPaymentMethodBadge(serviceRequest.payment_method)}
                </div>
              )}

              <Separator />

              {serviceRequest.estimated_cost && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Estimated
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

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {formatDateTime(serviceRequest.created_at)}
                </span>
              </div>

              {serviceRequest.completed_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completed
                  </span>
                  <span className="text-sm font-medium">
                    {formatDateTime(serviceRequest.completed_date)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          {serviceRequest.customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
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
                  <p className="text-sm text-muted-foreground">
                    {serviceRequest.customer.email}
                  </p>
                )}
                {serviceRequest.customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {serviceRequest.customer.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
