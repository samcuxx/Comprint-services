"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  MoonIcon,
  SunIcon,
  User,
  LogOut,
  Monitor,
  Zap,
  Shield,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // Get role icon
  const getRoleIcon = (role: UserRole | null) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "sales":
        return <User className="w-3 h-3" />;
      case "technician":
        return <Settings className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  // Get role color
  const getRoleColor = (role: UserRole | null): string => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 text-red-800 dark:text-red-200";
      case "sales":
        return "bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50 text-green-800 dark:text-green-200";
      case "technician":
        return "bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-800 dark:text-purple-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 text-gray-800 dark:text-gray-200";
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
      // The auth state change will handle navigation, but we'll add a fallback
      setTimeout(() => {
        router.push("/auth/login");
      }, 500);
    } catch (error) {
      // If there was an error, we still want to redirect to login
      router.push("/auth/login");

      if (process.env.NODE_ENV === "development") {
        console.error("Error handling signOut:", error);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Brand & User Info */}
        <div className="flex items-center space-x-6">
          {/* Brand Logo */}
          {/* <div className="flex items-center space-x-3">
            <div className="relative">
              <Monitor className="h-7 w-7 text-primary" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Comprint Services
              </span>
              <div className="text-xs text-muted-foreground">Dashboard</div>
            </div>
          </div> */}

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <div className="text-sm font-medium text-foreground">
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-xs text-muted-foreground">
                Welcome back to your dashboard
              </div>
            </div>
            <Badge className={`${getRoleColor(userRole)} border-0 font-medium`}>
              {getRoleIcon(userRole)}
              <span className="ml-1">{getRoleDisplay(userRole)}</span>
            </Badge>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="relative hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all duration-300"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-blue-600" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all duration-300"
              >
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.user_metadata?.full_name || "User"}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 p-2 bg-background/95 backdrop-blur-xl border shadow-xl rounded-xl"
              align="end"
            >
          
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all duration-300"
                >
                  <User className="h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
          
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center space-x-2 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Sign Out Button */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="hidden lg:flex items-center gap-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/50 dark:hover:to-pink-950/50 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button> */}
        </div>
      </div>
    </header>
  );
}
