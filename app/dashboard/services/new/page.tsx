"use client";

import { ServiceRequestForm } from "@/components/services/service-request-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { redirect } from "next/navigation";
import { Loading } from "@/components/ui/loading";

export default function NewServiceRequestPage() {
  const { data: currentUser, isLoading } = useCurrentUser();

  // Redirect if user doesn't have permission to create service requests
  if (!isLoading && currentUser && !["admin", "sales"].includes(currentUser.role)) {
    redirect("/dashboard/services");
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!currentUser) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto py-6">
      <ServiceRequestForm />
    </div>
  );
}
