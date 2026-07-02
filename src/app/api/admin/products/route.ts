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
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data || [] });
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
    const {
      name,
      brand,
      category,
      price,
      compare_at_price,
      description,
      details,
      images,
      colorway,
      sizes,
      tags,
      is_new_drop,
      drop_number,
    } = body;

    if (!name || !brand || !category || !price || !colorway) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate slug from name
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${colorway.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabaseServer
      .from("products")
      .insert({
        slug,
        name,
        brand,
        category,
        price: Number(price),
        compare_at_price: compare_at_price ? Number(compare_at_price) : null,
        description: description || "",
        details: details || [],
        images: images || [],
        colorway,
        sizes: sizes || [],
        tags: tags || [],
        is_new_drop: !!is_new_drop,
        drop_number: drop_number || null,
        rating: 5.0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
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
    const {
      id,
      name,
      brand,
      category,
      price,
      compare_at_price,
      description,
      details,
      images,
      colorway,
      sizes,
      tags,
      is_new_drop,
      drop_number,
      rating,
      review_count,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("products")
      .update({
        name,
        brand,
        category,
        price: Number(price),
        compare_at_price: compare_at_price ? Number(compare_at_price) : null,
        description,
        details,
        images,
        colorway,
        sizes,
        tags,
        is_new_drop: !!is_new_drop,
        drop_number: drop_number || null,
        rating: rating !== undefined ? Number(rating) : 5.0,
        review_count: review_count !== undefined ? Number(review_count) : 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
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
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Product deleted." });
}
