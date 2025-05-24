"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AlertCircle } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const isAdmin = userRole === "admin";

  console.log("AdminGuard - Current userRole:", userRole);
  console.log("AdminGuard - Is Admin:", isAdmin);

  useEffect(() => {
    if (!loading && !isAdmin) {
      console.log("Redirecting non-admin user to dashboard");
      router.push("/dashboard");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You need admin privileges to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
