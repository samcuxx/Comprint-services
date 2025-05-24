import { z } from "zod";

export const UserRole = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
} as const;

export type UserRole = "admin" | "employee";

export const TransactionType = {
  COMMISSION: "commission",
  TRANSFER: "transfer",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  branch_id: string;
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
  branch_id: string;
  transfer_type_id?: string;
  created_at: string;
}
