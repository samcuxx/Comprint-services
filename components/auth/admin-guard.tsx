"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loading } from "@/components/ui/loading";

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
    return <Loading />;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
