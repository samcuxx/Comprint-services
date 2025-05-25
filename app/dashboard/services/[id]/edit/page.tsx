"use client";

import { useParams } from "next/navigation";
import { useServiceRequest } from "@/hooks/use-service-requests";
import { ServiceRequestForm } from "@/components/services/service-request-form";
import { Loading } from "@/components/ui/loading";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditServiceRequestPage() {
  const params = useParams();
  const serviceRequestId = params.id as string;

  const {
    data: serviceRequest,
    isLoading,
    error,
  } = useServiceRequest(serviceRequestId);

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
          The service request you're trying to edit doesn't exist or you don't
          have permission to edit it.
        </p>
        <Link href="/dashboard/services">
          <Button>Back to Service Requests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ServiceRequestForm serviceRequest={serviceRequest} />
    </div>
  );
}
