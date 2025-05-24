import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Commission ID is required" },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the user's role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Fetch the commission
    const { data: commission, error: commissionError } = await supabase
      .from("sales_commissions")
      .select(
        `
        *,
        sale:sale_id (*),
        sales_person:sales_person_id (*)
      `
      )
      .eq("id", id)
      .single();

    if (commissionError) {
      if (commissionError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Commission not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: commissionError.message },
        { status: 500 }
      );
    }

    // Check if user has access (admin or the sales person)
    if (userData.role !== "admin" && commission.sales_person_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view this commission" },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: commission });
  } catch (error) {
    console.error("Error in commission GET[id] route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Commission ID is required" },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Check authentication and admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the user's role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Only admin can update commission payment status
    if (userData.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can update commission payment status" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { is_paid } = body;

    // Update the commission
    const { data: updatedCommission, error } = await supabase
      .from("sales_commissions")
      .update({
        is_paid,
        payment_date: is_paid ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: updatedCommission });
  } catch (error) {
    console.error("Error in commission PATCH route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
