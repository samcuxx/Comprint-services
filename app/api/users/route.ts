import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      full_name,
      staff_id,
      role,
      contact_number,
      address,
    } = body;

    // Validate role
    if (!["admin", "sales", "technician"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin', 'sales', or 'technician'" },
        { status: 400 }
      );
    }

    // Create the user in auth with user metadata
    // This will trigger our handle_new_user function
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          staff_id,
          role,
        },
      });

    if (authError) {
      console.error("Auth Error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    // Update additional fields that aren't set by the trigger
    if (contact_number || address) {
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          contact_number: contact_number || null,
          address: address || null,
        })
        .eq("id", authData.user.id);

      if (updateError) {
        console.error("Update Error:", updateError);
        // Don't delete the user, just log the error
        // The basic profile was already created by the trigger
      }
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
