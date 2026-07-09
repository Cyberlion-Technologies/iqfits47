import { NextResponse, NextRequest } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  try {
    // Full affiliate list (admin gets untruncated data)
    const { data: affiliates, error: affErr } = await supabaseServer
      .from("affiliates")
      .select("id, phone, display_name, referral_code, referral_count, total_credit_kes, pending_credit_kes, rank, created_at")
      .order("referral_count", { ascending: false });

    if (affErr) throw affErr;

    // Recent referral events
    const { data: events, error: evErr } = await supabaseServer
      .from("referral_events")
      .select("id, affiliate_id, order_number, order_total_kes, credit_awarded, discount_given, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (evErr) throw evErr;

    // Aggregate stats
    const list = affiliates ?? [];
    const eventList = events ?? [];

    const totalAffiliates = list.length;
    const activeAffiliates = list.filter((a: any) => a.referral_count > 0).length;
    const totalReferrals = list.reduce((sum: number, a: any) => sum + (a.referral_count ?? 0), 0);
    const totalCreditIssued = list.reduce((sum: number, a: any) => sum + (a.total_credit_kes ?? 0), 0);
    const pendingCredit = list.reduce((sum: number, a: any) => sum + (a.pending_credit_kes ?? 0), 0);
    const totalOrdersReferred = eventList.length;
    const totalOrderValueReferred = eventList.reduce((sum: number, e: any) => sum + (e.order_total_kes ?? 0), 0);

    return NextResponse.json({
      stats: {
        totalAffiliates,
        activeAffiliates,
        totalReferrals,
        totalCreditIssued,
        pendingCredit,
        totalOrdersReferred,
        totalOrderValueReferred,
      },
      affiliates: list,
      events: eventList,
    });
  } catch (err) {
    console.error("Admin affiliate fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
