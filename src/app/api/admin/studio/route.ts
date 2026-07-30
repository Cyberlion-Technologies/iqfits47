import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { sendBookingStatusUpdateSMS } from "@/lib/sms";
import { sendEmail, sendAdminBookingStatusUpdateEmail, sendAdminBookingCancelledEmail } from "@/lib/mail";

const ADMIN_COOKIE = "iqfits_admin_token";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return token === ADMIN_PASSCODE;
}

// GET — list bookings with optional filters
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ bookings: [], tourDates: [] });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // studio | tour | null
  const status = searchParams.get("status");
  const tour_date_id = searchParams.get("tour_date_id");

  try {
    // Bookings query
    let query = supabaseServer
      .from("studio_bookings")
      .select(`
        *,
        tour_date:tour_dates(city, venue, start_date, end_date)
      `)
      .order("created_at", { ascending: false });

    if (type) query = query.eq("booking_type", type);
    if (status) query = query.eq("status", status);
    if (tour_date_id) query = query.eq("tour_date_id", tour_date_id);

    const { data: bookings, error: bErr } = await query;
    if (bErr) throw bErr;

    // Tour dates with live counts
    const { data: tourDates, error: tErr } = await supabaseServer
      .from("tour_dates")
      .select("*")
      .order("start_date", { ascending: true });
    if (tErr) throw tErr;

    // Aggregate stats
    const total = bookings?.length ?? 0;
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const b of bookings ?? []) {
      byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
      byType[b.booking_type] = (byType[b.booking_type] ?? 0) + 1;
    }

    return NextResponse.json({ bookings, tourDates, stats: { total, byStatus, byType } });
  } catch (err) {
    console.error("Studio admin GET error:", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

// PATCH — update booking status
export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, notes } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  const VALID_STATUSES = ["pending", "confirmed", "deposit_paid", "completed", "cancelled", "no_show"];
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updatePayload: Record<string, unknown> = { status };
    if (notes !== undefined) updatePayload.notes = notes;

    const { data, error } = await supabaseServer
      .from("studio_bookings")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // ── Notify client & admin via SMS & Email on status change ────────────────
    if (data) {
      sendAdminBookingStatusUpdateEmail({
        booking_ref: data.booking_ref,
        full_name: data.full_name,
        status: data.status,
        notes: data.notes,
      }).catch((e) => console.error("Admin booking status update Email notify error:", e));
    }

    if (data?.phone) {
      sendBookingStatusUpdateSMS(data.phone, data.full_name, data.booking_ref, status).catch((e) =>
        console.error("Booking status SMS notify error:", e)
      );
    }

    if (data?.email && data.email.includes("@")) {
      const formattedStatus = status.replace(/_/g, " ").toUpperCase();
      const studioSender = process.env.STUDIO_FROM_EMAIL || "47Studio <bookings@iqfits47.store>";
      const html = `
        <div style="font-family: sans-serif; background-color: #070709; color: #fff; padding: 24px; border-radius: 12px; border: 1px solid #222;">
          <h2 style="color: #ff5500;">47Studio Booking Update: #${data.booking_ref}</h2>
          <p>Habari ${data.full_name},</p>
          <p>Your tattoo booking status has been updated to: <strong style="color: #ff5500;">${formattedStatus}</strong>.</p>
          <p>For questions or design changes, DM us on Instagram <a href="https://www.instagram.com/47.studio._/" style="color: #ff5500;">@47.studio._</a>.</p>
          <p style="font-size: 11px; color: #666;">47Cultures & Ink • Nairobi, Kenya</p>
        </div>
      `;

      sendEmail({
        to: data.email,
        subject: `47Studio Booking #${data.booking_ref} Status: ${formattedStatus}`,
        html,
        from: studioSender,
      }).catch((e) => console.error("Booking status Email notify error:", e));
    }

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("Studio admin PATCH error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// DELETE — cancel a booking
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const { data, error } = await supabaseServer
      .from("studio_bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      sendAdminBookingCancelledEmail({
        booking_ref: data.booking_ref,
        full_name: data.full_name,
        notes: data.notes,
      }).catch((e) => console.error("Admin booking cancellation Email notify error:", e));
    }

    if (data?.phone) {
      sendBookingStatusUpdateSMS(data.phone, data.full_name, data.booking_ref, "cancelled").catch((e) =>
        console.error("Booking cancellation SMS notify error:", e)
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Studio admin DELETE error:", err);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
