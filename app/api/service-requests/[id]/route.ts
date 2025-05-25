import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schema for service request updates
const serviceRequestUpdateSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200)
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  service_category_id: z.string().uuid("Invalid service category").optional(),
  customer_id: z.string().uuid("Invalid customer").nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z
    .enum([
      "pending",
      "assigned",
      "in_progress",
      "waiting_parts",
      "completed",
      "cancelled",
      "on_hold",
    ])
    .optional(),
  device_type: z.string().max(100).nullable().optional(),
  device_brand: z.string().max(100).nullable().optional(),
  device_model: z.string().max(100).nullable().optional(),
  device_serial_number: z.string().max(100).nullable().optional(),
  estimated_completion: z.string().nullable().optional(),
  estimated_cost: z.number().positive().nullable().optional(),
  final_cost: z.number().positive().nullable().optional(),
  customer_notes: z.string().max(1000).nullable().optional(),
  internal_notes: z.string().max(1000).nullable().optional(),
  assigned_technician_id: z.string().uuid().nullable().optional(),
  payment_status: z.enum(["pending", "paid", "refunded"]).optional(),
  completed_date: z.string().nullable().optional(),
});

// GET a specific service request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
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

    // Fetch the service request with relations
    const { data: serviceRequest, error: serviceError } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        service_category:service_category_id (*),
        customer:customer_id (*),
        assigned_technician:assigned_technician_id (*),
        created_by_user:created_by (*)
      `
      )
      .eq("id", id)
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
        { error: "You don't have permission to view this service request" },
        { status: 403 }
      );
    }

    return NextResponse.json(serviceRequest);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT to update a service request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = serviceRequestUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if the service request exists and get current data
    const { data: existingRequest, error: fetchError } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Service request not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check permissions
    const canEdit =
      userData.role === "admin" ||
      (userData.role === "technician" &&
        existingRequest.assigned_technician_id === user.id) ||
      userData.role === "sales";

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit this service request" },
        { status: 403 }
      );
    }

    // Restrict certain fields based on role
    if (userData.role === "technician") {
      // Technicians can only update status, internal notes, and completion details
      const allowedFields = [
        "status",
        "internal_notes",
        "final_cost",
        "completed_date",
      ];
      const restrictedFields = Object.keys(validatedData).filter(
        (field) => !allowedFields.includes(field)
      );

      if (restrictedFields.length > 0) {
        return NextResponse.json(
          {
            error: `Technicians cannot update: ${restrictedFields.join(", ")}`,
          },
          { status: 403 }
        );
      }
    }

    // If technician assignment is being changed, verify user is admin
    if (
      validatedData.assigned_technician_id !== undefined &&
      userData.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only admins can assign technicians" },
        { status: 403 }
      );
    }

    // Update the service request
    const { data, error } = await supabase
      .from("service_requests")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        service_category:service_category_id (*),
        customer:customer_id (*),
        assigned_technician:assigned_technician_id (*),
        created_by_user:created_by (*)
      `
      )
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

// DELETE a service request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
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

    // Only admins can delete service requests
    if (userData.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Check if the service request exists
    const { data: existingRequest, error: fetchError } = await supabase
      .from("service_requests")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Service request not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Prevent deletion of completed requests
    if (existingRequest.status === "completed") {
      return NextResponse.json(
        { error: "Cannot delete completed service requests" },
        { status: 400 }
      );
    }

    // Delete the service request (cascade will handle related records)
    const { error } = await supabase
      .from("service_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Service request deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
