"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/database.types";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AlertCircle } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Check if user is authenticated
        if (!user) {
          setIsAllowed(false);
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        // Check if user's role is in the allowed roles
        const hasAllowedRole = userRole
          ? allowedRoles.includes(userRole)
          : false;
        setIsAllowed(hasAllowedRole);

        // If not allowed, redirect to dashboard
        if (!hasAllowedRole) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsAllowed(false);
      }
    };

    if (!loading) {
      checkUserRole();
    }
  }, [router, pathname, allowedRoles, user, userRole, loading]);

  if (loading || isAllowed === null) {
    return <LoadingScreen />;
  }

  if (isAllowed === false) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
