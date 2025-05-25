import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schema for service category data
const serviceCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  estimated_duration: z
    .number()
    .positive("Duration must be positive")
    .optional(),
  base_price: z.number().positive("Base price must be positive").optional(),
  is_active: z.boolean().default(true),
});

// GET handler to retrieve all service categories
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const isActive = searchParams.get("active");

    // Base query
    let categoryQuery = supabase.from("service_categories").select("*");

    // Apply search filter if provided
    if (query) {
      categoryQuery = categoryQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Apply active filter if provided
    if (isActive !== null) {
      categoryQuery = categoryQuery.eq("is_active", isActive === "true");
    }

    // Execute the query
    const { data, error } = await categoryQuery.order("name");

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

// POST handler to create a new service category
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });

    // Verify the user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = serviceCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from("service_categories")
      .select("id")
      .eq("name", validationResult.data.name)
      .maybeSingle();

    if (existingCategory) {
      return NextResponse.json(
        { error: "Service category name already exists" },
        { status: 409 }
      );
    }

    // Insert the new service category
    const { data, error } = await supabase
      .from("service_categories")
      .insert([validationResult.data])
      .select()
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
