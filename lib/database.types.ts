export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "sales" | "technician";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          address: string | null;
          contact_number: string | null;
          staff_id: string;
          profile_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: UserRole;
          address?: string | null;
          contact_number?: string | null;
          staff_id: string;
          profile_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          address?: string | null;
          contact_number?: string | null;
          staff_id?: string;
          profile_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          amount: number;
          type: string;
          user_id: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          type: string;
          user_id: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          type?: string;
          user_id?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sku: string;
          category_id: string | null;
          cost_price: number;
          selling_price: number;
          commission_rate: number;
          image_url: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sku: string;
          category_id?: string | null;
          cost_price: number;
          selling_price: number;
          commission_rate?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          sku?: string;
          category_id?: string | null;
          cost_price?: number;
          selling_price?: number;
          commission_rate?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          reorder_level: number | null;
          last_restock_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity: number;
          reorder_level?: number | null;
          last_restock_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity?: number;
          reorder_level?: number | null;
          last_restock_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          company: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          company?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          company?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string | null;
          sales_person_id: string;
          sale_date: string;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          payment_status: string;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_id?: string | null;
          sales_person_id: string;
          sale_date?: string;
          subtotal: number;
          tax_amount?: number;
          discount_amount?: number;
          total_amount: number;
          payment_status?: string;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_id?: string | null;
          sales_person_id?: string;
          sale_date?: string;
          subtotal?: number;
          tax_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          payment_status?: string;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          commission_rate: number;
          discount_percent: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          commission_rate: number;
          discount_percent?: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          commission_rate?: number;
          discount_percent?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      sales_commissions: {
        Row: {
          id: string;
          sale_id: string;
          sales_person_id: string;
          commission_amount: number;
          is_paid: boolean;
          payment_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          sales_person_id: string;
          commission_amount: number;
          is_paid?: boolean;
          payment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          sales_person_id?: string;
          commission_amount?: number;
          is_paid?: boolean;
          payment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  estimated_duration: number;
  base_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  customer_id: string | null;
  service_category_id: string;
  assigned_technician_id: string | null;
  created_by: string;

  // Request details
  title: string;
  description: string;
  device_type: string | null;
  device_brand: string | null;
  device_model: string | null;
  device_serial_number: string | null;

  // Service details
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "pending"
    | "assigned"
    | "in_progress"
    | "waiting_parts"
    | "completed"
    | "cancelled"
    | "on_hold";

  // Dates and timing
  requested_date: string;
  assigned_date: string | null;
  started_date: string | null;
  completed_date: string | null;
  estimated_completion: string | null;

  // Pricing
  estimated_cost: number | null;
  final_cost: number | null;
  payment_status: "pending" | "paid" | "partial" | "cancelled";
  payment_method: "cash" | "card" | "transfer" | "check" | "other" | null;

  // Additional info
  customer_notes: string | null;
  technician_notes: string | null;
  internal_notes: string | null;

  created_at: string;
  updated_at: string;

  // Relations
  customer?: Customer;
  service_category?: ServiceCategory;
  assigned_technician?: User;
  created_by_user?: User;
}

export interface ServiceRequestUpdate {
  id: string;
  service_request_id: string;
  updated_by: string;

  // Update details
  status_from: string | null;
  status_to: string | null;
  update_type:
    | "status_change"
    | "note_added"
    | "assignment"
    | "cost_update"
    | "completion";
  title: string;
  description: string | null;

  // Visibility
  is_customer_visible: boolean;

  created_at: string;

  // Relations
  updated_by_user?: User;
}

export interface ServicePartUsed {
  id: string;
  service_request_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  added_by: string;
  created_at: string;

  // Relations
  product?: Product;
  added_by_user?: User;
}

export interface ServiceRequestAttachment {
  id: string;
  service_request_id: string;
  uploaded_by: string;

  // File details
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;

  // Metadata
  description: string | null;
  is_customer_visible: boolean;

  created_at: string;

  // Relations
  uploaded_by_user?: User;
}
