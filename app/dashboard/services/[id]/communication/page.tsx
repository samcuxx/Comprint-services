"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useServiceRequest } from "@/hooks/use-service-requests";
import { CustomerCommunication } from "@/components/services/customer-communication";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function ServiceCommunicationPage() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/services/${serviceRequest.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service Request
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Customer Communication
            </h1>
            <p className="text-muted-foreground">
              {serviceRequest.request_number} - {serviceRequest.title}
            </p>
          </div>
        </div>
      </div>

      {/* Communication Component */}
      <CustomerCommunication serviceRequestId={serviceRequestId} />
    </div>
  );
}
