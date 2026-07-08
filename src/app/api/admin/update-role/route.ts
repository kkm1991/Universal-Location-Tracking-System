import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateRoleSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify requesting user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify requester is an admin (use admin client to bypass RLS)
    const adminClient = createAdminClient();
    const { data: requesterAccount, error: requesterError } = await adminClient
      .from("accounts")
      .select("account_type")
      .eq("id", user.id)
      .single();

    if (requesterError || !requesterAccount || requesterAccount.account_type !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { user_id, new_role } = result.data;

    // Prevent demoting or promoting other admins (only super admins can do this, database checks this too)
    // For safety, we block changing roles of self
    if (user_id === user.id) {
      return NextResponse.json({ error: "Forbidden: Cannot change your own role" }, { status: 403 });
    }

    // Check if target user exists and is not an admin
    const { data: targetAccount, error: targetError } = await adminClient
      .from("accounts")
      .select("account_type")
      .eq("id", user_id)
      .single();

    if (targetError || !targetAccount) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    if (targetAccount.account_type === "admin") {
      return NextResponse.json({ error: "Forbidden: Cannot alter admin accounts" }, { status: 403 });
    }

    // Update role
    const { error: updateError } = await adminClient
      .from("accounts")
      .update({ account_type: new_role })
      .eq("id", user_id);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error: any) {
    console.error("Role update API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
