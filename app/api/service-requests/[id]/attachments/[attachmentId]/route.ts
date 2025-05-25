import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schema for attachment updates
const attachmentUpdateSchema = z.object({
  description: z.string().max(500).nullable().optional(),
  is_customer_visible: z.boolean().optional(),
});

// GET a specific attachment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const { id: serviceRequestId, attachmentId } = params;

    if (!serviceRequestId || !attachmentId) {
      return NextResponse.json(
        { error: "Service request ID and attachment ID are required" },
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
        { error: "You don't have permission to view this attachment" },
        { status: 403 }
      );
    }

    // Fetch the specific attachment
    const { data: attachment, error: attachmentError } = await supabase
      .from("service_request_attachments")
      .select(
        `
        *,
        uploaded_by_user:uploaded_by (id, full_name)
      `
      )
      .eq("id", attachmentId)
      .eq("service_request_id", serviceRequestId)
      .single();

    if (attachmentError) {
      if (attachmentError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Attachment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: attachmentError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(attachment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT to update an attachment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const { id: serviceRequestId, attachmentId } = params;

    if (!serviceRequestId || !attachmentId) {
      return NextResponse.json(
        { error: "Service request ID and attachment ID are required" },
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
    const validationResult = attachmentUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if the attachment exists and get current data
    const { data: existingAttachment, error: fetchError } = await supabase
      .from("service_request_attachments")
      .select("*, service_request:service_request_id(assigned_technician_id)")
      .eq("id", attachmentId)
      .eq("service_request_id", serviceRequestId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Attachment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check permissions to update attachment
    const canUpdate =
      userData.role === "admin" ||
      existingAttachment.uploaded_by === user.id ||
      (userData.role === "technician" &&
        existingAttachment.service_request?.assigned_technician_id === user.id);

    if (!canUpdate) {
      return NextResponse.json(
        { error: "You don't have permission to update this attachment" },
        { status: 403 }
      );
    }

    // Update the attachment
    const { data, error } = await supabase
      .from("service_request_attachments")
      .update(validatedData)
      .eq("id", attachmentId)
      .eq("service_request_id", serviceRequestId)
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

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const { id: serviceRequestId, attachmentId } = params;

    if (!serviceRequestId || !attachmentId) {
      return NextResponse.json(
        { error: "Service request ID and attachment ID are required" },
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

    // Check if the attachment exists and get current data
    const { data: existingAttachment, error: fetchError } = await supabase
      .from("service_request_attachments")
      .select("*, service_request:service_request_id(assigned_technician_id)")
      .eq("id", attachmentId)
      .eq("service_request_id", serviceRequestId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Attachment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check permissions to delete attachment
    const canDelete =
      userData.role === "admin" ||
      existingAttachment.uploaded_by === user.id ||
      (userData.role === "technician" &&
        existingAttachment.service_request?.assigned_technician_id === user.id);

    if (!canDelete) {
      return NextResponse.json(
        { error: "You don't have permission to delete this attachment" },
        { status: 403 }
      );
    }

    // Extract file path from URL for storage deletion
    const fileUrl = existingAttachment.file_url;
    let filePath = null;

    if (fileUrl && fileUrl.includes("service-attachments")) {
      // Extract the file path from the URL
      const urlParts = fileUrl.split("/");
      const bucketIndex = urlParts.findIndex(
        (part) => part === "service-attachments"
      );
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        filePath = urlParts.slice(bucketIndex + 1).join("/");
      }
    }

    // Delete from storage if file path is found
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("service-attachments")
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the attachment record
    const { error } = await supabase
      .from("service_request_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("service_request_id", serviceRequestId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Attachment deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
