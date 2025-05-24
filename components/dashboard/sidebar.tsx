"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wrench,
  ShoppingCart,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of system metrics",
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    description: "Manage employee accounts",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
    description: "Update your profile",
  },
];

const salesNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your performance metrics",
  },
  {
    title: "Sales",
    href: "/dashboard/sales",
    icon: ShoppingCart,
    description: "Record and track sales",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
    description: "Update your profile",
  },
];

const technicianNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your service metrics",
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Wrench,
    description: "Manage service requests",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
    description: "Update your profile",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userRole } = useAuth();

  // Determine navigation items based on user role
  const getNavItems = (role: UserRole | null): NavItem[] => {
    if (!role) return adminNavItems;

    switch (role) {
      case "sales":
        return salesNavItems;
      case "technician":
        return technicianNavItems;
      case "admin":
      default:
        return adminNavItems;
    }
  };

  const navItems = getNavItems(userRole);

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background shadow-sm">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Comprint Services</h1>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <TooltipProvider delayDuration={300}>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-2 h-5 w-5",
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span>{item.title}</span>
                </Link>
              </TooltipTrigger>
              {item.description && (
                <TooltipContent side="right">
                  <p>{item.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          Comprint Services &copy; {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
}
