import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const description = formData.get("description") as string;
    const isCustomerVisible = formData.get("isCustomerVisible") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!serviceRequestId) {
      return NextResponse.json(
        { error: "Service request ID is required" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
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

    // Check permissions to upload files
    const canUpload =
      userData.role === "admin" ||
      userData.role === "sales" ||
      (userData.role === "technician" &&
        serviceRequest.assigned_technician_id === user.id);

    if (!canUpload) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to upload files to this service request",
        },
        { status: 403 }
      );
    }

    // Generate unique file name
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `service-requests/${serviceRequestId}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("service-attachments")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("service-attachments")
      .getPublicUrl(filePath);

    // Create attachment record in database
    const { data: attachment, error: dbError } = await supabase
      .from("service_request_attachments")
      .insert([
        {
          service_request_id: serviceRequestId,
          uploaded_by: user.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          description: description || null,
          is_customer_visible: isCustomerVisible,
        },
      ])
      .select(
        `
        *,
        uploaded_by_user:uploaded_by (id, full_name)
      `
      )
      .single();

    if (dbError) {
      // If database insert fails, try to clean up the uploaded file
      await supabase.storage.from("service-attachments").remove([filePath]);

      return NextResponse.json(
        { error: "Failed to create attachment record" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        attachment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
