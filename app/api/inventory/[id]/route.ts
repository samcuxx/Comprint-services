import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Schema for inventory update
const inventoryUpdateSchema = z.object({
  quantity: z.number().int().nonnegative().optional(),
  reorder_level: z.number().int().nonnegative().optional(),
  last_restock_date: z.string().optional(),
});

// GET a specific inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
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
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching inventory item:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Inventory item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in inventory GET[id] route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update an inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Validate the data
    const validatedData = inventoryUpdateSchema.parse(body);

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Add updated_at timestamp
    const dataToUpdate = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // Update the inventory item
    const { data, error } = await supabase
      .from("inventory")
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Inventory item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error in inventory PUT route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH to update specific fields of an inventory item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Validate the data
    const validatedData = inventoryUpdateSchema.parse(body);

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Add updated_at timestamp
    const dataToUpdate = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // Update the inventory item
    const { data, error } = await supabase
      .from("inventory")
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Inventory item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error in inventory PATCH route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE an inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Delete the inventory item
    const { error } = await supabase.from("inventory").delete().eq("id", id);

    if (error) {
      console.error("Error deleting inventory item:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Inventory item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in inventory DELETE route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
