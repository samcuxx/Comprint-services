"use client";

import { useParams, useRouter } from "next/navigation";
import { useCustomer } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Edit,
} from "lucide-react";
import Link from "next/link";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  // Get current user to check role
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isSales = currentUser?.role === "sales";

  const { data: customer, isLoading, isError, error } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-semibold">Customer Not Found</h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "The customer you're looking for doesn't exist or has been removed."}
        </p>
        <Button onClick={() => router.push("/dashboard/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(customer.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

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
          <h1 className="text-2xl font-bold">Customer Details</h1>
        </div>
        {(isAdmin || isSales) && (
          <Button asChild>
            <Link href={`/dashboard/customers/${customerId}/edit`}>
              <Edit className="h-4 w-4 mr-2" /> Edit Customer
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{customer.name}</h2>
              {customer.company && (
                <p className="text-muted-foreground">{customer.company}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium">Contact Information</h3>
          <div className="space-y-4">
            {customer.email && (
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {customer.address && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Address</h3>
            </div>
            <p className="whitespace-pre-line">{customer.address}</p>
          </div>
        )}

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Customer Since</h3>
          </div>
          <p>{formattedDate}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Sales History</h3>
        <p className="text-muted-foreground">
          Sales history will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
