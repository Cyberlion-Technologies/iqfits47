import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { initiateStkPush } from "@/lib/lipia";
import { normalizeMpesaPhone } from "@/lib/utils";
import { sendBookingConfirmationEmail, sendAdminNewBookingEmail } from "@/lib/mail";
import { sendBookingConfirmationSMS, sendAdminNewBookingSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json(
        { error: "Booking service is temporarily unavailable. Please contact us on WhatsApp." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      booking_type,
      full_name,
      phone,
      email,
      tattoo_style,
      tattoo_size,
      body_placement,
      design_description,
      has_reference_art,
      notes,
      preferred_date,
      preferred_time,
      tour_date_id,
      pay_deposit,
      deposit_amount,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!full_name?.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    const normalizedPhone = normalizeMpesaPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json({ error: "Enter a valid Safaricom phone number, e.g. 0712345678." }, { status: 400 });
    }
    if (!tattoo_style) {
      return NextResponse.json({ error: "Tattoo style is required." }, { status: 400 });
    }
    if (!tattoo_size) {
      return NextResponse.json({ error: "Tattoo size is required." }, { status: 400 });
    }
    if (!body_placement?.trim()) {
      return NextResponse.json({ error: "Body placement is required." }, { status: 400 });
    }
    if (!design_description?.trim()) {
      return NextResponse.json({ error: "Please describe your design idea." }, { status: 400 });
    }
    if (booking_type === "studio" && !preferred_date) {
      return NextResponse.json({ error: "Please choose a preferred date." }, { status: 400 });
    }
    if (booking_type === "tour" && !tour_date_id) {
      return NextResponse.json({ error: "Please select a tour city." }, { status: 400 });
    }

    // ── Check tour date capacity ───────────────────────────────────────────────
    let tourCityDepositPrice = 1500;
    if (booking_type === "tour" && tour_date_id) {
      const { data: tourDate, error: tourErr } = await supabaseServer
        .from("tour_dates")
        .select("id, total_slots, booked_slots, status, deposit_price_kes")
        .eq("id", tour_date_id)
        .single();

      if (tourErr || !tourDate) {
        return NextResponse.json({ error: "Selected tour date not found." }, { status: 400 });
      }
      if (tourDate.status === "sold_out" || tourDate.booked_slots >= tourDate.total_slots) {
        return NextResponse.json(
          { error: "Sorry, this tour date is fully booked. Pick another city." },
          { status: 409 }
        );
      }
      if (tourDate.status === "cancelled") {
        return NextResponse.json(
          { error: "This tour date has been cancelled. Check the others." },
          { status: 400 }
        );
      }
      if (tourDate.deposit_price_kes) {
        tourCityDepositPrice = tourDate.deposit_price_kes;
      }
    }

    const calculatedDeposit = booking_type === "tour" ? tourCityDepositPrice : (deposit_amount || 1000);

    // ── Insert booking ────────────────────────────────────────────────────────
    const { data: booking, error: insertErr } = await supabaseServer
      .from("studio_bookings")
      .insert({
        booking_type: booking_type || "studio",
        full_name: full_name.trim(),
        phone: normalizedPhone,
        email: email?.trim() || null,
        tattoo_style,
        tattoo_size,
        body_placement: body_placement.trim(),
        design_description: design_description.trim(),
        has_reference_art: Boolean(has_reference_art),
        notes: notes?.trim() || null,
        preferred_date: booking_type === "studio" ? preferred_date : null,
        preferred_time: booking_type === "studio" ? (preferred_time || null) : null,
        tour_date_id: booking_type === "tour" ? tour_date_id : null,
        status: "pending",
        deposit_amount: calculatedDeposit,
        deposit_paid: false,
      })
      .select("id, booking_ref, status, created_at")
      .single();

    if (insertErr) {
      console.error("Booking insert error:", insertErr);
      return NextResponse.json(
        { error: "Could not save your booking. Please try again." },
        { status: 500 }
      );
    }

    // ── Trigger M-Pesa STK Push for Booking Deposit Fee (if requested) ───────
    let stkResult = null;
    if (pay_deposit) {
      try {
        stkResult = await initiateStkPush({
          phone: normalizedPhone,
          amount: calculatedDeposit,
          accountReference: booking.booking_ref,
          transactionDesc: `47Studio Tattoo Deposit ${booking.booking_ref}`,
        });

        // Store transaction reference on booking if available
        if (stkResult?.reference) {
          await supabaseServer
            .from("studio_bookings")
            .update({ mpesa_receipt: stkResult.reference })
            .eq("id", booking.id);
        }
      } catch (stkErr) {
        console.error("Booking deposit STK push error:", stkErr);
      }
    }

    // ── Trigger Email & SMS Notifications ─────────────────────────────────────
    const payload = {
      booking_ref: booking.booking_ref,
      full_name: full_name.trim(),
      phone: normalizedPhone,
      email: email?.trim() || null,
      booking_type: booking_type || "studio",
      tattoo_style,
      tattoo_size,
      body_placement: body_placement.trim(),
      design_description: design_description.trim(),
      preferred_date: booking_type === "studio" ? preferred_date : null,
    };

    Promise.allSettled([
      sendBookingConfirmationEmail(payload),
      sendAdminNewBookingEmail(payload),
      sendBookingConfirmationSMS(payload),
      sendAdminNewBookingSMS(payload),
    ]).catch((err) => console.error("Notification dispatch error:", err));

    return NextResponse.json({
      booking,
      payment: stkResult,
      depositAmount: calculatedDeposit,
    }, { status: 201 });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── GET: fetch available tour dates ──────────────────────────────────────────
export async function GET() {
  try {
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ tourDates: [] });
    }

    const { data, error } = await supabaseServer
      .from("tour_dates")
      .select("*")
      .not("status", "eq", "cancelled")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Tour dates fetch error:", error);
      return NextResponse.json({ tourDates: [] });
    }

    return NextResponse.json({ tourDates: data });
  } catch (err) {
    console.error("Tour dates API error:", err);
    return NextResponse.json({ tourDates: [] });
  }
}
