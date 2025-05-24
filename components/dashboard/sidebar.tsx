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
  Package,
  FolderClosed,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/database.types";
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
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
    description: "Manage product inventory",
  },
  {
    title: "Categories",
    href: "/dashboard/product-categories",
    icon: FolderClosed,
    description: "Manage product categories",
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
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
    description: "View product inventory",
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
    <aside className="flex flex-col w-64 h-full border-r shadow-sm bg-background">
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Comprint Services</h1>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
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
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          Comprint Services &copy; {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
}
