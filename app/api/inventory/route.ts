import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Schema for inventory validation
const inventorySchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
  reorder_level: z.number().int().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client authenticated on the server
    const supabase = createServerComponentClient({ cookies });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("product_id");
    const lowStock = searchParams.get("low_stock") === "true";
    const outOfStock = searchParams.get("out_of_stock") === "true";

    // Start building the query
    let query = supabase.from("inventory").select(`
        *,
        product:product_id (
          id,
          name,
          sku,
          category_id,
          selling_price,
          cost_price,
          image_url,
          is_active
        )
      `);

    // Apply filters if they exist
    if (productId) {
      query = query.eq("product_id", productId);
    }

    if (lowStock) {
      query = query.or(`quantity.lte.reorder_level,quantity.eq.0`);
    }

    if (outOfStock) {
      query = query.eq("quantity", 0);
    }

    // Execute the query
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching inventory:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in inventory GET route:", error);
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

    // Validate the data with Zod
    const validatedData = inventorySchema.parse(body);

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Check if inventory already exists for this product
    const { data: existingInventory, error: checkError } = await supabase
      .from("inventory")
      .select()
      .eq("product_id", validatedData.product_id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing inventory:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingInventory) {
      return NextResponse.json(
        { error: "Inventory already exists for this product" },
        { status: 400 }
      );
    }

    // Insert the new inventory item
    const { data, error } = await supabase
      .from("inventory")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error in inventory POST route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
