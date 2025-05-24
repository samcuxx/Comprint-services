import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema for product updates
const productUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50)
    .optional(),
  category_id: z.string().uuid().nullable().optional(),
  cost_price: z.number().positive("Cost price must be positive").optional(),
  selling_price: z
    .number()
    .positive("Selling price must be positive")
    .optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  image_url: z.string().url().nullable().optional(),
  is_active: z.boolean().optional(),
});

// GET handler to retrieve a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();

    // Verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the product
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        inventory:inventory(quantity, reorder_level, last_restock_date),
        category:product_categories(id, name)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH handler to update a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();

    // Verify the user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const validationResult = productUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (checkError || !existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If SKU is being updated, check if it's unique
    if (
      validationResult.data.sku &&
      validationResult.data.sku !== existingProduct.sku
    ) {
      const { data: existingSku } = await supabase
        .from("products")
        .select("id")
        .eq("sku", validationResult.data.sku)
        .neq("id", id)
        .maybeSingle();

      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Update the product
    const { data, error } = await supabase
      .from("products")
      .update({
        ...validationResult.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();

    // Verify the user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Check if the product is used in any sales
    const { data: salesData, error: salesError } = await supabase
      .from("sale_items")
      .select("id")
      .eq("product_id", id)
      .limit(1);

    if (!salesError && salesData && salesData.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product that has been sold. Consider deactivating it instead.",
        },
        { status: 409 }
      );
    }

    // Delete related inventory records first
    await supabase.from("inventory").delete().eq("product_id", id);

    // Delete the product
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
