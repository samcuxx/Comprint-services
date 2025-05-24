import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Endpoint to repair all commission records that have incorrect amounts
export async function POST(request: NextRequest) {
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

    // Only admin can repair all commissions
    if (userData.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can repair commissions" },
        { status: 403 }
      );
    }

    // Get all commission records, or filtered by a specific condition
    const params = request.nextUrl.searchParams;
    const onlyZeroAmount = params.get("onlyZeroAmount") === "true";

    let commissionsQuery = supabase.from("sales_commissions").select("*");

    // Filter to only commissions with zero or null amounts if specified
    if (onlyZeroAmount) {
      commissionsQuery = commissionsQuery.or(
        "commission_amount.eq.0,commission_amount.is.null"
      );
    }

    const { data: commissions, error: commissionsError } =
      await commissionsQuery;

    if (commissionsError) {
      return NextResponse.json(
        { error: commissionsError.message },
        { status: 500 }
      );
    }

    // Keep track of successes and failures
    const results = {
      total: commissions.length,
      success: 0,
      failure: 0,
      details: [] as { id: string; success: boolean; error?: string }[],
    };

    // Process each commission
    for (const commission of commissions) {
      try {
        // Get the sale items for this commission's sale
        const { data: saleItems, error: saleItemsError } = await supabase
          .from("sale_items")
          .select("*")
          .eq("sale_id", commission.sale_id);

        if (saleItemsError) {
          throw new Error(
            `Error fetching sale items: ${saleItemsError.message}`
          );
        }

        // Calculate the correct commission amount
        const totalCommissionAmount = saleItems.reduce(
          (sum, item) =>
            sum +
            item.quantity * item.unit_price * (item.commission_rate / 100),
          0
        );

        // Update the commission record with the correct amount
        const { error: updateError } = await supabase
          .from("sales_commissions")
          .update({
            commission_amount: totalCommissionAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", commission.id);

        if (updateError) {
          throw new Error(`Error updating commission: ${updateError.message}`);
        }

        results.success++;
        results.details.push({ id: commission.id, success: true });
      } catch (error) {
        results.failure++;
        results.details.push({
          id: commission.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in commission repair route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
