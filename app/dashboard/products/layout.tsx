"use client";

import { AdminSalesGuard } from "@/components/auth/admin-sales-guard";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminSalesGuard>{children}</AdminSalesGuard>;
}
