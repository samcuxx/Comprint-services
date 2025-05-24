import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First get the current status
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch Error:", fetchError);
      throw fetchError;
    }

    // Toggle the status
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        is_active: userData?.is_active === null ? false : !userData.is_active,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Update Error:", updateError);
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle user status" },
      { status: 400 }
    );
  }
}
