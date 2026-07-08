import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackLocationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    // Parse and validate incoming payload
    const body = await request.json();
    const result = trackLocationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { trackable_id, hardware_imei, latitude, longitude, speed, battery_level } = result.data;

    let targetTrackableId = trackable_id;

    // Use admin client for ALL database operations to bypass RLS
    // (RLS policies on accounts/trackables cause infinite recursion with user client)
    const adminClient = createAdminClient();

    // If hardware tracker (IMEI provided) but no trackable_id, resolve it
    if (hardware_imei && !targetTrackableId) {
      const { data: trackable, error: lookupError } = await adminClient
        .from("trackables")
        .select("id")
        .eq("hardware_imei", hardware_imei)
        .single();

      if (lookupError || !trackable) {
        return NextResponse.json(
          { error: `Trackable not found for IMEI: ${hardware_imei}` },
          { status: 404 }
        );
      }
      targetTrackableId = trackable.id;
    }

    if (!targetTrackableId) {
      return NextResponse.json(
        { error: "Could not resolve trackable entity ID" },
        { status: 400 }
      );
    }

    // Auth validation: check for API key (for native apps) or session cookies (for web)
    const apiKey = request.headers.get("X-Tracker-Key");
    const validApiKey = process.env.TRACKER_API_KEY;

    if (apiKey && validApiKey && apiKey === validApiKey) {
      // API key is valid — allow tracking without session (native app flow)
      // Just verify the trackable exists
      const { data: trackable, error: checkError } = await adminClient
        .from("trackables")
        .select("id")
        .eq("id", targetTrackableId)
        .single();

      if (checkError || !trackable) {
        return NextResponse.json({ error: "Trackable not found" }, { status: 404 });
      }
    } else {
      // Fall back to session-based auth (web flow)
      const userClient = await createClient();
      const { data: { user } } = await userClient.auth.getUser();

      if (user) {
        const { data: trackable, error: ownerCheckError } = await adminClient
          .from("trackables")
          .select("account_id")
          .eq("id", targetTrackableId)
          .single();

        if (ownerCheckError || !trackable) {
          return NextResponse.json({ error: "Trackable not found" }, { status: 404 });
        }

        const { data: account } = await adminClient
          .from("accounts")
          .select("account_type")
          .eq("id", user.id)
          .single();

        const isAdmin = account?.account_type === "admin";
        const isOwner = trackable.account_id === user.id;

        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
        }
      } else if (!hardware_imei) {
        return NextResponse.json({ error: "Unauthorized: App tracking requires active session or API key" }, { status: 401 });
      }
    }

    // Insert location log using PostGIS format
    const coordinates = `SRID=4326;POINT(${longitude} ${latitude})`;

    const { data: log, error: insertError } = await adminClient
      .from("location_logs")
      .insert({
        trackable_id: targetTrackableId,
        coordinates,
        speed: speed !== undefined ? speed : null,
        battery_level: battery_level !== undefined ? battery_level : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting location log:", insertError);
      return NextResponse.json({ error: `Failed to store location: ${insertError.message}` }, { status: 500 });
    }

    // Broadcast the new location directly to bypass Postgres Realtime RLS issues
    const channel = adminClient.channel(`trackable:${targetTrackableId}`);
    await channel.send({
      type: 'broadcast',
      event: 'location_update',
      payload: {
        id: targetTrackableId,
        lat: latitude,
        lng: longitude,
        speed: speed !== undefined ? speed : undefined,
        battery_level: battery_level !== undefined ? battery_level : undefined,
        updated_at: log.created_at || new Date().toISOString(),
      },
    });
    
    // Clean up channel since we just used it once
    adminClient.removeChannel(channel);

    return NextResponse.json(
      { message: "Location tracked successfully", log_id: log.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Location tracking API error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message || String(error) }, { status: 500 });
  }
}
