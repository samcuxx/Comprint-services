import { z } from "zod";

export const UserRole = {
  ADMIN: "admin",
  SALES: "sales",
  TECHNICIAN: "technician",
} as const;

export type UserRole = "admin" | "sales" | "technician";

export const TransactionType = {
  COMMISSION: "commission",
  SERVICE: "service",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  staff_id: string;
  address?: string;
  contact_number?: string;
  profile_image_url?: string;
  is_active: boolean;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  commission_cutoff: number;
  commission_percentage: number;
}

export interface TransferType {
  id: string;
  name: string;
  daily_limit: number;
  percentage_payout: number;
  branch_id: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  user_id: string;
  description?: string;
  created_at: string;
}
