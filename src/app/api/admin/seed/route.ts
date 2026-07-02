import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { products } from "@/lib/data/products";

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json(
        { error: "Supabase server client is not configured." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    // Check if products already exist
    const { count, error: countError } = await supabaseServer
      .from("products")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count && count > 0 && !force) {
      return NextResponse.json({
        success: false,
        message: `Database already has ${count} products. Use force=true to clear and re-seed.`,
      });
    }

    if (force) {
      // Clear products
      const { error: deleteError } = await supabaseServer
        .from("products")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    // Map products to the database fields (camelCase to snake_case)
    const dbProducts = products.map((p) => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      compare_at_price: p.compareAtPrice ?? null,
      description: p.description,
      details: p.details,
      images: p.images,
      colorway: p.colorway,
      sizes: p.sizes,
      tags: p.tags,
      is_new_drop: p.isNewDrop ?? false,
      drop_number: p.dropNumber ?? null,
      rating: p.rating,
      review_count: p.reviewCount,
    }));

    const { data, error: insertError } = await supabaseServer
      .from("products")
      .insert(dbProducts)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data.length} products.`,
      count: data.length,
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
