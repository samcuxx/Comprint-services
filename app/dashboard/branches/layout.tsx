"use client";

import { AdminGuard } from "@/components/auth/admin-guard";

export default function BranchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
