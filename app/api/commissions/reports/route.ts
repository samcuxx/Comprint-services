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
    const reportType = searchParams.get("reportType") || "summary"; // summary or detailed

    // Build the query for sales commissions
    let query = supabase.from("sales_commissions").select(
      `
        *,
        sale:sale_id (id, invoice_number, sale_date, total_amount),
        sales_person:sales_person_id (id, full_name, staff_id)
      `
    );

    // Apply access controls
    if (userData.role !== "admin") {
      // Non-admin users can only see their own commissions
      query = query.eq("sales_person_id", user.id);
    } else if (salesPersonId) {
      // Admin can filter by sales person
      query = query.eq("sales_person_id", salesPersonId);
    }

    // Apply filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (isPaid !== null && isPaid !== undefined) {
      query = query.eq("is_paid", isPaid === "true");
    }

    // Execute the query and order by date
    const { data: commissions, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format report based on type
    if (reportType === "summary") {
      // Group by sales person and calculate totals
      const summary = commissions.reduce((acc, commission) => {
        const personId = commission.sales_person_id;
        if (!acc[personId]) {
          acc[personId] = {
            sales_person: commission.sales_person,
            total_commission: 0,
            paid_commission: 0,
            unpaid_commission: 0,
            sale_count: 0,
          };
        }

        acc[personId].total_commission += commission.commission_amount || 0;
        if (commission.is_paid) {
          acc[personId].paid_commission += commission.commission_amount || 0;
        } else {
          acc[personId].unpaid_commission += commission.commission_amount || 0;
        }
        acc[personId].sale_count += 1;

        return acc;
      }, {});

      // Convert to array and sort by total commission
      const summaryArray = Object.values(summary).sort(
        (a: any, b: any) => b.total_commission - a.total_commission
      );

      // Calculate overall totals
      const totals = {
        total_commission: commissions.reduce(
          (sum, c) => sum + (c.commission_amount || 0),
          0
        ),
        paid_commission: commissions
          .filter((c) => c.is_paid)
          .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        unpaid_commission: commissions
          .filter((c) => !c.is_paid)
          .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        sale_count: commissions.length,
      };

      return NextResponse.json({
        data: {
          summary: summaryArray,
          totals,
        },
      });
    } else {
      // Detailed report with all commissions
      return NextResponse.json({
        data: {
          commissions,
          totals: {
            total_commission: commissions.reduce(
              (sum, c) => sum + (c.commission_amount || 0),
              0
            ),
            paid_commission: commissions
              .filter((c) => c.is_paid)
              .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
            unpaid_commission: commissions
              .filter((c) => !c.is_paid)
              .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
            sale_count: commissions.length,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error in commissions report route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
