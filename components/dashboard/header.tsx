"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

export function Header() {
  const { user, userRole, signOut } = useAuth();
  const router = useRouter();
  const isAdmin = userRole === "admin";

  console.log("Header - Current userRole:", userRole);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
          {isAdmin ? "Administrator" : "Employee"}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
