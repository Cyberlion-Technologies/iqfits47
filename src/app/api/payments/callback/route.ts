import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid, updateOrderStatus } from "@/lib/orders";
import { supabaseServer } from "@/lib/supabase/server";
import {
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail,
  sendOrderStatusUpdateEmail,
  sendBookingConfirmationEmail,
  sendAdminNewBookingEmail,
} from "@/lib/mail";
import {
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS,
  sendAdminNewOrderSMS,
  sendBookingConfirmationSMS,
  sendAdminNewBookingSMS,
} from "@/lib/sms";

/**
 * Webhook receiver for Lipia Online payment callbacks.
 * Captures successful, failed, and user-cancelled payments for both Storefront Orders and 47Studio Bookings.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const reference =
    payload.reference ?? payload.CheckoutRequestID ?? payload.checkout_request_id;
  const rawStatus = String(payload.status ?? payload.ResultCode ?? "").toLowerCase();
  const mpesaReceipt = payload.mpesa_receipt ?? payload.MpesaReceiptNumber ?? payload.receipt;
  const failureReason = payload.message ?? payload.result_desc ?? payload.ResultDesc ?? "Payment processing issue";

  if (!reference) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  const isSuccess = ["success", "completed", "paid", "0"].includes(rawStatus);
  const isCancelled = ["cancelled", "canceled", "user_cancelled", "1032"].includes(rawStatus);

  // ── 1. Check Storefront Orders ─────────────────────────────────────────────
  const { data: order } = await supabaseServer
    .from("orders")
    .select("order_number, status")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (order) {
    if (isSuccess) {
      const result = await markOrderPaid(order.order_number, mpesaReceipt);
      if (result && result.newlyPaid) {
        Promise.allSettled([
          sendOrderConfirmationEmail(result.order),
          sendAdminNewOrderEmail(result.order),
          sendOrderConfirmationSMS(result.order),
          sendAdminNewOrderSMS(result.order),
        ]).catch((err) => console.error("Order payment callback notifications failed:", err));
      }
    } else if (isCancelled) {
      const updated = await updateOrderStatus(
        order.order_number,
        "cancelled",
        "Payment cancelled on phone by user"
      );
      if (updated) {
        Promise.allSettled([
          sendOrderStatusUpdateEmail(updated, "Payment request was cancelled on your phone."),
          sendOrderStatusUpdateSMS(updated, "M-Pesa payment was cancelled."),
        ]).catch((err) => console.error("Order cancellation callback notifications failed:", err));
      }
    } else {
      // Failed payment
      const updated = await updateOrderStatus(
        order.order_number,
        "cancelled",
        `Payment failed: ${failureReason}`
      );
      if (updated) {
        Promise.allSettled([
          sendOrderStatusUpdateEmail(updated, `M-Pesa payment failed (${failureReason}).`),
          sendOrderStatusUpdateSMS(updated, `M-Pesa payment failed.`),
        ]).catch((err) => console.error("Order failure callback notifications failed:", err));
      }
    }

    return NextResponse.json({ received: true, type: "order" });
  }

  // ── 2. Check 47Studio Tattoo Bookings ─────────────────────────────────────
  const { data: booking } = await supabaseServer
    .from("studio_bookings")
    .select("*")
    .or(`mpesa_receipt.eq.${reference},booking_ref.eq.${reference}`)
    .maybeSingle();

  if (booking) {
    if (isSuccess) {
      const { data: updatedBooking } = await supabaseServer
        .from("studio_bookings")
        .update({
          deposit_paid: true,
          status: "deposit_paid",
          mpesa_receipt: mpesaReceipt || reference,
          notes: booking.notes ? `${booking.notes}\n[Deposit Paid via M-Pesa ${mpesaReceipt || ""}]` : `[Deposit Paid via M-Pesa ${mpesaReceipt || ""}]`,
        })
        .eq("id", booking.id)
        .select()
        .single();

      if (updatedBooking) {
        const payload = {
          booking_ref: updatedBooking.booking_ref,
          full_name: updatedBooking.full_name,
          phone: updatedBooking.phone,
          email: updatedBooking.email,
          booking_type: updatedBooking.booking_type,
          tattoo_style: updatedBooking.tattoo_style,
          tattoo_size: updatedBooking.tattoo_size,
          body_placement: updatedBooking.body_placement,
          design_description: updatedBooking.design_description,
          preferred_date: updatedBooking.preferred_date,
        };

        Promise.allSettled([
          sendBookingConfirmationEmail(payload),
          sendAdminNewBookingEmail(payload),
          sendBookingConfirmationSMS(payload),
          sendAdminNewBookingSMS(payload),
        ]).catch((err) => console.error("Studio booking callback notifications failed:", err));
      }
    } else if (isCancelled) {
      await supabaseServer
        .from("studio_bookings")
        .update({
          notes: booking.notes ? `${booking.notes}\n[M-Pesa Deposit Cancelled by Client]` : `[M-Pesa Deposit Cancelled by Client]`,
        })
        .eq("id", booking.id);
    } else {
      await supabaseServer
        .from("studio_bookings")
        .update({
          notes: booking.notes ? `${booking.notes}\n[M-Pesa Deposit Failed: ${failureReason}]` : `[M-Pesa Deposit Failed: ${failureReason}]`,
        })
        .eq("id", booking.id);
    }

    return NextResponse.json({ received: true, type: "studio_booking" });
  }

  return NextResponse.json({ received: true, note: "Reference not matched to active order or booking" });
}
