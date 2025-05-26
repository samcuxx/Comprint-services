"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useUpdateServiceRequest,
  useAddServiceRequestUpdate,
} from "@/hooks/use-service-requests";
import { ServiceRequest } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  DollarSign,
  Loader2,
  Receipt,
  CheckCircle,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

const paymentSchema = z.object({
  final_cost: z.number().positive("Final cost must be positive"),
  payment_method: z.enum(["cash", "card", "transfer", "check", "other"]),
  payment_status: z.enum(["pending", "paid", "partial", "cancelled"]),
  payment_notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface ServicePaymentDialogProps {
  serviceRequest: ServiceRequest;
  trigger?: React.ReactNode;
}

export function ServicePaymentDialog({
  serviceRequest,
  trigger,
}: ServicePaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateServiceRequest = useUpdateServiceRequest();
  const addUpdate = useAddServiceRequestUpdate();
  const { data: currentUser } = useCurrentUser();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      final_cost: serviceRequest.final_cost || 0,
      payment_method: serviceRequest.payment_method || "cash",
      payment_status: serviceRequest.payment_status || "pending",
      payment_notes: "",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const previousStatus = serviceRequest.payment_status || "pending";

      // Update the service request
      await updateServiceRequest.mutateAsync({
        id: serviceRequest.id,
        final_cost: data.final_cost,
        payment_method: data.payment_method,
        payment_status: data.payment_status,
        payment_notes: data.payment_notes,
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

      setIsOpen(false);
      form.reset();
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "partial":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
            <span>Service Payment</span>
          </DialogTitle>
          <DialogDescription>
            Update payment information for service request{" "}
            {serviceRequest.request_number}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Payment Status */}
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Status</span>
                <span
                  className={`text-sm font-medium ${getPaymentStatusColor(
                    serviceRequest.payment_status || "pending"
                  )}`}
                >
                  {serviceRequest.payment_status || "pending"}
                </span>
              </div>
              {serviceRequest.final_cost && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current Amount
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(serviceRequest.final_cost)}
                  </span>
                </div>
              )}
            </div>

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

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
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
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Partial</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>Cancelled</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Update Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
