import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const salesPersonId = searchParams.get("salesPersonId");
    const isPaid = searchParams.get("isPaid");

    // Build the query based on user role
    let query = supabase.from("sales_commissions").select(
      `
        *,
        sale:sale_id (*),
        sales_person:sales_person_id (*)
      `
    );

    // If the user is not an admin, they can only see their own commissions
    if (userData.role !== "admin") {
      query = query.eq("sales_person_id", user.id);
    } else if (salesPersonId) {
      // If admin and salesPersonId is provided, filter by it
      query = query.eq("sales_person_id", salesPersonId);
    }

    // Apply additional filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (isPaid !== null && isPaid !== undefined) {
      query = query.eq("is_paid", isPaid === "true");
    }

    // Execute the query
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in commissions GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update commission payment status
export async function PATCH(request: NextRequest) {
  try {
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
    const { id, is_paid } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Commission ID is required" },
        { status: 400 }
      );
    }

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
    console.error("Error in commissions PATCH route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
