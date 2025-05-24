import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Schema for sale validation
const saleItemSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unit_price: z.number().positive("Unit price must be positive"),
  commission_rate: z.number().min(0, "Commission rate cannot be negative"),
  discount_percent: z
    .number()
    .min(0, "Discount percent cannot be negative")
    .max(100, "Discount percent cannot exceed 100"),
  total_price: z.number().positive("Total price must be positive"),
});

const saleSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  customer_id: z.string().uuid("Invalid customer ID").nullable().optional(),
  sales_person_id: z.string().uuid("Invalid sales person ID"),
  sale_date: z.string().datetime("Invalid date format"),
  subtotal: z.number().positive("Subtotal must be positive"),
  tax_amount: z.number().min(0, "Tax amount cannot be negative"),
  discount_amount: z.number().min(0, "Discount amount cannot be negative"),
  total_amount: z.number().positive("Total amount must be positive"),
  payment_status: z.enum(["pending", "paid", "partial", "cancelled"]),
  payment_method: z.enum(["cash", "card", "transfer", "check", "other"]),
  notes: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerId = searchParams.get("customerId");
    const salesPersonId = searchParams.get("salesPersonId");
    const status = searchParams.get("status");

    // Start building the query
    let supabaseQuery = supabase.from("sales").select(`
        *,
        customer:customer_id (*),
        sales_person:sales_person_id (*)
      `);

    // Apply filters if they exist
    if (startDate) {
      supabaseQuery = supabaseQuery.gte("sale_date", startDate);
    }
    if (endDate) {
      supabaseQuery = supabaseQuery.lte("sale_date", endDate);
    }
    if (customerId) {
      supabaseQuery = supabaseQuery.eq("customer_id", customerId);
    }
    if (salesPersonId) {
      supabaseQuery = supabaseQuery.eq("sales_person_id", salesPersonId);
    }
    if (status) {
      supabaseQuery = supabaseQuery.eq("payment_status", status);
    }

    // Execute the query with order
    const { data, error } = await supabaseQuery.order("sale_date", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching sales:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in sales GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { sale, saleItems } = body;

    // Validate the data with Zod
    const validatedSale = saleSchema.parse(sale);
    const validatedSaleItems = z.array(saleItemSchema).parse(saleItems);

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Get the current user ID for created_by field if needed
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Start a transaction
    // Insert the sale
    const { data: newSale, error: saleError } = await supabase
      .from("sales")
      .insert([validatedSale])
      .select()
      .single();

    if (saleError) {
      console.error("Error creating sale:", saleError);
      return NextResponse.json({ error: saleError.message }, { status: 500 });
    }

    // Add the sale_id to each item
    const itemsWithSaleId = validatedSaleItems.map((item) => ({
      ...item,
      sale_id: newSale.id,
    }));

    // Insert the sale items
    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(itemsWithSaleId);

    if (itemsError) {
      console.error("Error creating sale items:", itemsError);
      // Note: In a real transaction we would roll back the sale, but Supabase doesn't support transactions directly
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Calculate total commission amount for this sale
    const totalCommissionAmount = validatedSaleItems.reduce(
      (sum, item) =>
        sum + item.quantity * item.unit_price * (item.commission_rate / 100),
      0
    );

    // Create commission record if commission amount is greater than 0
    if (totalCommissionAmount > 0) {
      const { error: commissionError } = await supabase
        .from("sales_commissions")
        .insert([
          {
            sale_id: newSale.id,
            sales_person_id: validatedSale.sales_person_id,
            commission_amount: totalCommissionAmount,
            is_paid: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (commissionError) {
        console.error("Error creating commission record:", commissionError);
        // We'll continue even if commission creation fails
        // but log the error for troubleshooting
      }
    }

    return NextResponse.json({ data: newSale }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error in sales POST route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
