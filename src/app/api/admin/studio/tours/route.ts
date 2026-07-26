import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "iqfits_admin_token";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return token === ADMIN_PASSCODE;
}

// GET — List all tour dates
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ tourDates: [] });
  }

  try {
    const { data, error } = await supabaseServer
      .from("tour_dates")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tourDates: data });
  } catch (err) {
    console.error("Studio tours GET error:", err);
    return NextResponse.json({ error: "Failed to fetch tours" }, { status: 500 });
  }
}

// POST — Create a new tour city stop
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { city, venue, venue_address, start_date, end_date, total_slots, deposit_price_kes, status, is_featured } = body;

  if (!city || !venue || !start_date || !end_date) {
    return NextResponse.json({ error: "City, venue, start_date, and end_date are required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseServer
      .from("tour_dates")
      .insert({
        city: city.trim(),
        venue: venue.trim(),
        venue_address: venue_address?.trim() || null,
        start_date,
        end_date,
        total_slots: Number(total_slots) || 20,
        deposit_price_kes: Number(deposit_price_kes) || 1500,
        status: status || "upcoming",
        is_featured: Boolean(is_featured),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tourDate: data }, { status: 201 });
  } catch (err) {
    console.error("Studio tours POST error:", err);
    return NextResponse.json({ error: "Failed to create tour stop" }, { status: 500 });
  }
}

// PUT — Update an existing tour stop
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Tour ID is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseServer
      .from("tour_dates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tourDate: data });
  } catch (err) {
    console.error("Studio tours PUT error:", err);
    return NextResponse.json({ error: "Failed to update tour stop" }, { status: 500 });
  }
}

// DELETE — Delete or cancel a tour stop
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Tour ID required" }, { status: 400 });

  try {
    const { error } = await supabaseServer.from("tour_dates").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Studio tours DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete tour stop" }, { status: 500 });
  }
}
