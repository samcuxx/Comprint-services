import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema for product data
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters").max(50),
  category_id: z.string().uuid().nullable(),
  cost_price: z.number().positive("Cost price must be positive"),
  selling_price: z.number().positive("Selling price must be positive"),
  commission_rate: z.number().min(0).max(100).default(0),
  image_url: z.string().url().nullable().optional(),
  is_active: z.boolean().default(true),
});

// GET handler to retrieve all products
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const categoryId = searchParams.get("category");
    const isActive = searchParams.get("active");

    // Base query
    let productQuery = supabase.from("products").select("*");

    // Apply search filter if provided
    if (query) {
      productQuery = productQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`
      );
    }

    // Apply category filter if provided
    if (categoryId) {
      productQuery = productQuery.eq("category_id", categoryId);
    }

    // Apply active filter if provided
    if (isActive !== null) {
      productQuery = productQuery.eq("is_active", isActive === "true");
    }

    // Execute the query
    const { data, error } = await productQuery.order("name");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST handler to create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Verify the user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = productSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const { data: existingSku, error: skuError } = await supabase
      .from("products")
      .select("id")
      .eq("sku", validationResult.data.sku)
      .maybeSingle();

    if (existingSku) {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 409 }
      );
    }

    // Insert the new product
    const { data, error } = await supabase
      .from("products")
      .insert([{
        ...validationResult.data,
        created_by: session.user.id,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Create initial inventory record
    await supabase
      .from("inventory")
      .insert([{
        product_id: data.id,
        quantity: 0,
        reorder_level: 10,
      }]);

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
} 