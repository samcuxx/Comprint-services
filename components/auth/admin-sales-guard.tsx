"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loading } from "@/components/ui/loading";

interface AdminSalesGuardProps {
  children: React.ReactNode;
}

export function AdminSalesGuard({ children }: AdminSalesGuardProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !isError) {
      // If user is not admin or sales, redirect to dashboard
      if (user?.role !== "admin" && user?.role !== "sales") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Only render children if user is admin or sales
  if (user?.role === "admin" || user?.role === "sales") {
    return <>{children}</>;
  }

  // This will be briefly shown before the redirect
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-semibold">Access Denied</h2>
      <p className="text-muted-foreground">
        You don't have permission to access this page.
      </p>
    </div>
  );
}
