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

// GET — Fetch studio settings
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ settings: null });
  }

  try {
    const { data, error } = await supabaseServer
      .from("studio_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ settings: data });
  } catch (err) {
    console.error("Studio settings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch studio settings" }, { status: 500 });
  }
}

// PUT — Update studio operational settings & pricing policies
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const { data, error } = await supabaseServer
      .from("studio_settings")
      .upsert({ id: "default", ...body, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ settings: data });
  } catch (err) {
    console.error("Studio settings PUT error:", err);
    return NextResponse.json({ error: "Failed to update studio settings" }, { status: 500 });
  }
}
