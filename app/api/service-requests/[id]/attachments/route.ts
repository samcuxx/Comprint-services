import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schema for attachment data
const attachmentSchema = z.object({
  file_name: z.string().min(1, "File name is required"),
  file_url: z.string().url("Invalid file URL"),
  file_type: z.string().nullable().optional(),
  file_size: z.number().positive().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  is_customer_visible: z.boolean().default(false),
});

// GET attachments for a service request
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
            "You don't have permission to view attachments for this service request",
        },
        { status: 403 }
      );
    }

    // Fetch attachments
    const { data: attachments, error: attachmentsError } = await supabase
      .from("service_request_attachments")
      .select(
        `
        *,
        uploaded_by_user:uploaded_by (id, full_name)
      `
      )
      .eq("service_request_id", serviceRequestId)
      .order("created_at", { ascending: false });

    if (attachmentsError) {
      return NextResponse.json(
        { error: attachmentsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(attachments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST to create a new attachment
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

    // Check permissions to add attachments
    const canAddAttachment =
      userData.role === "admin" ||
      userData.role === "sales" ||
      (userData.role === "technician" &&
        serviceRequest.assigned_technician_id === user.id);

    if (!canAddAttachment) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to add attachments to this service request",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = attachmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Insert the new attachment
    const { data, error } = await supabase
      .from("service_request_attachments")
      .insert([
        {
          ...validatedData,
          service_request_id: serviceRequestId,
          uploaded_by: user.id,
        },
      ])
      .select(
        `
        *,
        uploaded_by_user:uploaded_by (id, full_name)
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
