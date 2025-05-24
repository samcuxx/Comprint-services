import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET a specific sale with its items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Fetch the sale
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(
        `
        *,
        customer:customer_id (*),
        sales_person:sales_person_id (*)
      `
      )
      .eq("id", id)
      .single();

    if (saleError) {
      console.error("Error fetching sale:", saleError);
      if (saleError.code === "PGRST116") {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 });
      }
      return NextResponse.json({ error: saleError.message }, { status: 500 });
    }

    // Fetch the sale items with product details
    const { data: items, error: itemsError } = await supabase
      .from("sale_items")
      .select(
        `
        *,
        product:product_id (*)
      `
      )
      .eq("sale_id", id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("Error fetching sale items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Combine sale and items
    const saleWithItems = {
      ...sale,
      items: items || [],
    };

    return NextResponse.json({ data: saleWithItems });
  } catch (error) {
    console.error("Error in sale GET[id] route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a sale and its items
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user role:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Only admin can delete sales
    if (userData.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can delete sales" },
        { status: 403 }
      );
    }

    // Delete the sale (items will be cascaded due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from("sales")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting sale:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in sale DELETE route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
