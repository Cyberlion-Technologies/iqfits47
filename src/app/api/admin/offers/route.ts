import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";

function checkAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get("iqfit_admin_session");
  return cookie?.value === "true";
}

export async function GET(req: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseServer
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ offers: data || [] });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { title, description, code, discount_percent, active, banner_image } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("offers")
      .insert({
        title,
        description: description || "",
        code: code || null,
        discount_percent: discount_percent ? Number(discount_percent) : null,
        active: active !== undefined ? !!active : true,
        banner_image: banner_image || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, offer: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, title, description, code, discount_percent, active, banner_image } = body;

    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("offers")
      .update({
        title,
        description,
        code: code || null,
        discount_percent: discount_percent ? Number(discount_percent) : null,
        active: !!active,
        banner_image: banner_image || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, offer: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("offers")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Offer deleted." });
}
