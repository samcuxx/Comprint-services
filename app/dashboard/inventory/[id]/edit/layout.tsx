"use client";

import { AdminGuard } from "@/components/auth/admin-guard";

export default function EditInventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
