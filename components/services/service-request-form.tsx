"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateServiceRequest,
  useUpdateServiceRequest,
} from "@/hooks/use-service-requests";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { useCustomers } from "@/hooks/use-customers";
import { useTechnicians } from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ServiceRequest } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const serviceRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  service_category_id: z.string().min(1, "Service category is required"),
  customer_id: z.string().optional(),
  assigned_technician_id: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  device_type: z.string().optional(),
  device_brand: z.string().optional(),
  device_model: z.string().optional(),
  device_serial_number: z.string().optional(),
  estimated_cost: z.number().optional(),
  estimated_completion: z.date().optional(),
  customer_notes: z.string().optional(),
  internal_notes: z.string().optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  serviceRequest?: ServiceRequest;
  onSuccess?: () => void;
}

export function ServiceRequestForm({
  serviceRequest,
  onSuccess,
}: ServiceRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: serviceCategories = [] } = useServiceCategories();
  const { data: customers = [] } = useCustomers();
  const { data: technicians = [] } = useTechnicians();

  const createServiceRequest = useCreateServiceRequest();
  const updateServiceRequest = useUpdateServiceRequest();

  const isAdmin = currentUser?.role === "admin";
  const isSales = currentUser?.role === "sales";
  const isEditing = !!serviceRequest;

  const form = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      title: serviceRequest?.title || "",
      description: serviceRequest?.description || "",
      service_category_id: serviceRequest?.service_category_id || "",
      customer_id: serviceRequest?.customer_id || undefined,
      assigned_technician_id:
        serviceRequest?.assigned_technician_id || undefined,
      priority: serviceRequest?.priority || "medium",
      device_type: serviceRequest?.device_type || undefined,
      device_brand: serviceRequest?.device_brand || "",
      device_model: serviceRequest?.device_model || "",
      device_serial_number: serviceRequest?.device_serial_number || "",
      estimated_cost: serviceRequest?.estimated_cost || undefined,
      estimated_completion: serviceRequest?.estimated_completion
        ? new Date(serviceRequest.estimated_completion)
        : undefined,
      customer_notes: serviceRequest?.customer_notes || "",
      internal_notes: serviceRequest?.internal_notes || "",
    },
  });

  const handleSubmit = async (data: ServiceRequestFormData) => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        ...data,
        customer_id:
          data.customer_id === "walk-in" ? null : data.customer_id || null,
        assigned_technician_id:
          data.assigned_technician_id === "unassigned"
            ? null
            : data.assigned_technician_id || null,
        device_type:
          data.device_type === "none" ? null : data.device_type || null,
        created_by: currentUser.id,
        requested_date: new Date().toISOString(),
        status: "pending" as const,
        payment_status: "pending" as const,
        estimated_completion: data.estimated_completion?.toISOString(),
      };

      if (isEditing && serviceRequest) {
        await updateServiceRequest.mutateAsync({
          id: serviceRequest.id,
          ...requestData,
        });
      } else {
        await createServiceRequest.mutateAsync(requestData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/services");
      }
    } catch (error) {
      console.error("Error saving service request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Service Request" : "Create Service Request"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing
            ? "Update the service request details below."
            : "Fill in the details to create a new service request."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of the issue"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the issue or service needed"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "walk-in"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="walk-in">
                            Walk-in Customer
                          </SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}{" "}
                              {customer.email && `(${customer.email})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="device_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            No device specified
                          </SelectItem>
                          <SelectItem value="Desktop">
                            Desktop Computer
                          </SelectItem>
                          <SelectItem value="Laptop">Laptop</SelectItem>
                          <SelectItem value="Smartphone">Smartphone</SelectItem>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                          <SelectItem value="Server">Server</SelectItem>
                          <SelectItem value="Printer">Printer</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device_brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dell, HP, Apple" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="device_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Device model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device_serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Serial number (if available)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="estimated_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_completion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Completion</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(isAdmin || isSales) && (
                <FormField
                  control={form.control}
                  name="assigned_technician_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Technician</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "unassigned"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select technician (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customer_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information from the customer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Internal notes for staff (not visible to customer)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditing ? "Update Service Request" : "Create Service Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
