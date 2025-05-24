"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { MoonIcon, SunIcon, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export function Header() {
  const { user, userRole, signOut } = useAuth();
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  // Get role display name
  const getRoleDisplay = (role: UserRole | null): string => {
    if (!role) return "User";

    switch (role) {
      case "admin":
        return "Administrator";
      case "sales":
        return "Sales Associate";
      case "technician":
        return "Technician";
      default:
        return "User";
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user?.user_metadata?.full_name) {
      return "U";
    }

    return user.user_metadata.full_name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error signing out:", error);
      }
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">
          {user?.user_metadata?.full_name || user?.email}
        </span>
        <span className="text-xs font-medium rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
          {getRoleDisplay(userRole)}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>

        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" aria-label="View profile">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.user_metadata?.avatar_url}
                alt={user?.user_metadata?.full_name || "User"}
              />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
