import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTrackableSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    // Authenticate user via session cookies
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = createTrackableSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for insert
    const adminClient = createAdminClient();

    const { data: trackable, error: insertError } = await adminClient
      .from("trackables")
      .insert({
        account_id: user.id,
        name: result.data.name,
        entity_type: result.data.entity_type,
        tracker_type: result.data.tracker_type,
        hardware_imei: result.data.hardware_imei ?? null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating trackable:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Trackable created successfully", trackable },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create trackable API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
