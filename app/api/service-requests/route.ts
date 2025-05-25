import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schema for service request data
const serviceRequestSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  service_category_id: z.string().uuid("Invalid service category"),
  customer_id: z.string().uuid("Invalid customer").nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  device_type: z.string().max(100).nullable().optional(),
  device_brand: z.string().max(100).nullable().optional(),
  device_model: z.string().max(100).nullable().optional(),
  device_serial_number: z.string().max(100).nullable().optional(),
  estimated_completion: z.string().nullable().optional(),
  estimated_cost: z.number().positive().nullable().optional(),
  customer_notes: z.string().max(1000).nullable().optional(),
  internal_notes: z.string().max(1000).nullable().optional(),
  assigned_technician_id: z.string().uuid().nullable().optional(),
});

// GET handler to retrieve service requests
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const technicianId = searchParams.get("technician_id");
    const categoryId = searchParams.get("category_id");

    // Base query with relations
    let serviceQuery = supabase.from("service_requests").select(`
      *,
      service_category:service_category_id (*),
      customer:customer_id (*),
      assigned_technician:assigned_technician_id (*)
    `);

    // Apply role-based filtering
    if (userData.role === "technician") {
      // Technicians can only see their assigned requests
      serviceQuery = serviceQuery.eq("assigned_technician_id", user.id);
    }

    // Apply search filter if provided
    if (query) {
      serviceQuery = serviceQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,request_number.ilike.%${query}%,device_type.ilike.%${query}%,device_brand.ilike.%${query}%`
      );
    }

    // Apply status filter if provided
    if (status) {
      serviceQuery = serviceQuery.eq("status", status);
    }

    // Apply priority filter if provided
    if (priority) {
      serviceQuery = serviceQuery.eq("priority", priority);
    }

    // Apply technician filter if provided (admin/sales only)
    if (technicianId && userData.role !== "technician") {
      serviceQuery = serviceQuery.eq("assigned_technician_id", technicianId);
    }

    // Apply category filter if provided
    if (categoryId) {
      serviceQuery = serviceQuery.eq("service_category_id", categoryId);
    }

    // Execute the query
    const { data, error } = await serviceQuery.order("created_at", {
      ascending: false,
    });

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

// POST handler to create a new service request
export async function POST(request: NextRequest) {
  try {
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

    // Check if user has permission to create service requests
    if (!["admin", "sales"].includes(userData.role)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = serviceRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // If technician assignment is provided, verify user is admin
    if (validatedData.assigned_technician_id && userData.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can assign technicians" },
        { status: 403 }
      );
    }

    // Insert the new service request
    const { data, error } = await supabase
      .from("service_requests")
      .insert([
        {
          ...validatedData,
          created_by: user.id,
          status: "pending",
        },
      ])
      .select(
        `
        *,
        service_category:service_category_id (*),
        customer:customer_id (*),
        assigned_technician:assigned_technician_id (*)
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
