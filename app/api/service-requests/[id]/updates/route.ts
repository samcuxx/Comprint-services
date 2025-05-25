import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schema for service request updates
const updateSchema = z.object({
  update_type: z.enum([
    "status_change",
    "note_added",
    "technician_assigned",
    "parts_added",
    "customer_contacted",
    "payment_received",
    "completion_notice",
    "issue_found",
    "progress_update",
    "general_update",
  ]),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).nullable().optional(),
  status_from: z.string().nullable().optional(),
  status_to: z.string().nullable().optional(),
  is_customer_visible: z.boolean().default(true),
  notification_sent: z.boolean().default(false),
});

// GET updates for a service request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceRequestId = params.id;
    if (!serviceRequestId) {
      return NextResponse.json(
        { error: "Service request ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Verify the user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Check if user has access to this service request
    const { data: serviceRequest, error: serviceError } = await supabase
      .from("service_requests")
      .select("id, assigned_technician_id")
      .eq("id", serviceRequestId)
      .single();

    if (serviceError) {
      if (serviceError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Service request not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: serviceError.message },
        { status: 500 }
      );
    }

    // Check access permissions
    if (
      userData.role === "technician" &&
      serviceRequest.assigned_technician_id !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to view updates for this service request",
        },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const customerVisible = searchParams.get("customer_visible");
    const updateType = searchParams.get("update_type");

    // Build query
    let updatesQuery = supabase
      .from("service_request_updates")
      .select(
        `
        *,
        updated_by_user:updated_by (id, full_name)
      `
      )
      .eq("service_request_id", serviceRequestId);

    // Apply filters
    if (customerVisible !== null) {
      updatesQuery = updatesQuery.eq(
        "is_customer_visible",
        customerVisible === "true"
      );
    }

    if (updateType) {
      updatesQuery = updatesQuery.eq("update_type", updateType);
    }

    // Execute query
    const { data: updates, error: updatesError } = await updatesQuery.order(
      "created_at",
      { ascending: false }
    );

    if (updatesError) {
      return NextResponse.json(
        { error: updatesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(updates);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST to create a new update
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceRequestId = params.id;
    if (!serviceRequestId) {
      return NextResponse.json(
        { error: "Service request ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Verify the user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Check if user has access to this service request
    const { data: serviceRequest, error: serviceError } = await supabase
      .from("service_requests")
      .select("id, assigned_technician_id")
      .eq("id", serviceRequestId)
      .single();

    if (serviceError) {
      if (serviceError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Service request not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: serviceError.message },
        { status: 500 }
      );
    }

    // Check permissions to add updates
    const canAddUpdate =
      userData.role === "admin" ||
      userData.role === "sales" ||
      (userData.role === "technician" &&
        serviceRequest.assigned_technician_id === user.id);

    if (!canAddUpdate) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to add updates to this service request",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Insert the new update
    const { data, error } = await supabase
      .from("service_request_updates")
      .insert([
        {
          ...validatedData,
          service_request_id: serviceRequestId,
          updated_by: user.id,
        },
      ])
      .select(
        `
        *,
        updated_by_user:updated_by (id, full_name)
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
