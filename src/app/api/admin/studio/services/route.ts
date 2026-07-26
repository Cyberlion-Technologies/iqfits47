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

// GET — List all studio services & prices
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ services: [] });
  }

  try {
    const { data, error } = await supabaseServer
      .from("studio_services")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ services: data });
  } catch (err) {
    console.error("Studio services GET error:", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST — Create a new studio service
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { category, title, starting_price_kes, deposit_required_kes, estimated_duration, description, is_active } = body;

  if (!title || !starting_price_kes) {
    return NextResponse.json({ error: "Title and starting_price_kes are required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseServer
      .from("studio_services")
      .insert({
        category: category || "tattoo",
        title: title.trim(),
        starting_price_kes: Number(starting_price_kes),
        deposit_required_kes: Number(deposit_required_kes) || 1000,
        estimated_duration: estimated_duration?.trim() || "1-2 Hours",
        description: description?.trim() || null,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ service: data }, { status: 201 });
  } catch (err) {
    console.error("Studio services POST error:", err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

// PUT — Update an existing service / price
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Service ID required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseServer
      .from("studio_services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ service: data });
  } catch (err) {
    console.error("Studio services PUT error:", err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE — Remove a service
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Service ID required" }, { status: 400 });

  try {
    const { error } = await supabaseServer.from("studio_services").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Studio services DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
