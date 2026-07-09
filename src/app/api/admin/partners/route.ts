import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { sendPartnerStatusUpdateEmail } from "@/lib/mail";
import { sendPartnerStatusUpdateSMS } from "@/lib/sms";
import { checkAdminAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseServer
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ partners: data || [] });
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, status } = body as { id: string; status: "pending" | "reviewed" | "accepted" | "rejected" };

    if (!id || !status) {
      return NextResponse.json({ error: "ID and Status are required" }, { status: 400 });
    }

    // First fetch the applicant info to send email later
    const { data: partner, error: fetchError } = await supabaseServer
      .from("partners")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !partner) {
      return NextResponse.json({ error: fetchError?.message || "Partner not found" }, { status: 404 });
    }

    // Update status
    const { error: updateError } = await supabaseServer
      .from("partners")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Trigger notifications if status changes to accepted, rejected or reviewed
    if (status === "accepted" || status === "rejected" || status === "reviewed") {
      await sendPartnerStatusUpdateEmail(
        {
          name: partner.name,
          email: partner.email,
          partnershipType: partner.partnership_type,
        },
        status
      ).catch((emailErr) => {
        console.error("Failed to send status update email:", emailErr);
      });

      if (partner.phone) {
        await sendPartnerStatusUpdateSMS(
          partner.name,
          partner.phone,
          partner.partnership_type,
          status
        ).catch((smsErr) => {
          console.error("Failed to send status update SMS:", smsErr);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin partners update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
