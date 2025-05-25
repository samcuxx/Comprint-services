"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Wrench,
  UserCircle,
  Package,
  FolderClosed,
  PackageOpen,
  User,
  ShoppingCart,
  CircleDollarSign,
  BarChart3,
  Monitor,
  Zap,
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
  badge?: string;
  gradient?: string;
}

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of system metrics",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    description: "Manage employee accounts",
    gradient: "from-green-500 to-blue-500",
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
    description: "Manage product inventory",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: PackageOpen,
    description: "Manage stock levels",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Sales",
    href: "/dashboard/sales",
    icon: ShoppingCart,
    description: "Manage sales and invoices",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Wrench,
    description: "Manage service requests",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Service Tracking",
    href: "/dashboard/services/tracking",
    icon: BarChart3,
    description: "Service analytics and tracking",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Commissions",
    href: "/dashboard/commissions",
    icon: CircleDollarSign,
    description: "Track sales commissions",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    description: "Analytics and reports",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: User,
    description: "Manage customer database",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Categories",
    href: "/dashboard/product-categories",
    icon: FolderClosed,
    description: "Manage product categories",
    gradient: "from-slate-500 to-gray-500",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
    description: "Update your profile",
    gradient: "from-blue-500 to-indigo-500",
  },
];

const salesNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your performance metrics",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
    description: "View product inventory",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: PackageOpen,
    description: "View stock levels",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Sales",
    href: "/dashboard/sales",
    icon: ShoppingCart,
    description: "Create and manage sales",
    gradient: "from-emerald-500 to-teal-500",
    badge: "Active",
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Wrench,
    description: "Create service requests",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Service Tracking",
    href: "/dashboard/services/tracking",
    icon: BarChart3,
    description: "View service analytics",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Commissions",
    href: "/dashboard/commissions",
    icon: CircleDollarSign,
    description: "View your commissions",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    description: "View sales reports",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: User,
    description: "Manage customers",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
    description: "Update your profile",
    gradient: "from-blue-500 to-indigo-500",
  },
];

const technicianNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your service metrics",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Wrench,
    description: "Manage assigned service requests",
    gradient: "from-indigo-500 to-purple-500",
    badge: "Active",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
    description: "Update your profile",
    gradient: "from-blue-500 to-indigo-500",
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
    <aside className="flex flex-col w-64 h-full border-r bg-gradient-to-b from-background to-muted/30 shadow-sm">
      {/* Header */}
      <div className="flex items-center h-16 px-6 border-b bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <Monitor className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Comprint Services
            </h1>
          
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <TooltipProvider delayDuration={300}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-1 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm border border-primary/20"
                        : "text-foreground/70 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                          isActive
                            ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                            : "bg-muted/50 group-hover:bg-gradient-to-r group-hover:" +
                                item.gradient
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            isActive
                              ? "text-white"
                              : "text-muted-foreground group-hover:text-white"
                          )}
                        />
                      </div>
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge && (
                      <Badge className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50 text-green-800 dark:text-green-200 border-0 text-xs px-2 py-0.5">
                        <Zap className="w-2.5 h-2.5 mr-1" />
                        {item.badge}
                      </Badge>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></div>
                    )}
                  </Link>
                </TooltipTrigger>
                {item.description && (
                  <TooltipContent
                    side="right"
                    className="bg-background/95 backdrop-blur-xl border shadow-xl"
                  >
                    <p className="font-medium">{item.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t bg-gradient-to-r from-blue-50/30 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">Comprint Services</div>
            <div>&copy; {new Date().getFullYear()}</div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
