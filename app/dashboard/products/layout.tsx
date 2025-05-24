"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={["admin", "sales"]}>{children}</RoleGuard>;
}
