import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAffiliate } from "@/lib/affiliate";
import { normalizeMpesaPhone } from "@/lib/utils";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { phone, displayName } = body as { phone: string; displayName?: string };

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    const normalizedPhone = normalizeMpesaPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Enter a valid Safaricom number, e.g. 0712345678." },
        { status: 400 }
      );
    }

    const affiliate = await getOrCreateAffiliate(normalizedPhone, displayName?.trim());

    return NextResponse.json({ affiliate });
  } catch (err) {
    console.error("Affiliate register error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
