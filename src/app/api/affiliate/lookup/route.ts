import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { normalizeMpesaPhone } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Phone parameter required." }, { status: 400 });
  }

  const normalizedPhone = normalizeMpesaPhone(phone);
  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "Enter a valid Safaricom number." },
      { status: 400 }
    );
  }

  try {
    const { data: affiliate, error } = await supabaseServer
      .from("affiliates")
      .select("*")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (error) throw error;
    if (!affiliate) {
      return NextResponse.json({ affiliate: null });
    }

    // Fetch recent referral events for this affiliate
    const { data: events } = await supabaseServer
      .from("referral_events")
      .select("order_number, credit_awarded, discount_given, created_at")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ affiliate, events: events ?? [] });
  } catch (err) {
    console.error("Affiliate lookup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
