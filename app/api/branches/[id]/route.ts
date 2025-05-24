import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { id } = params;

    const { error } = await supabaseAdmin
      .from("branches")
      .update(body)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update branch" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if branch has associated users
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("branch_id", id);

    if (usersError) throw usersError;

    if (users && users.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete branch with associated employees" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("branches")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete branch" },
      { status: 400 }
    );
  }
}
