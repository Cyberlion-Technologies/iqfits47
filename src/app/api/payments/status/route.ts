import { NextRequest, NextResponse } from "next/server";
import { checkTransactionStatus } from "@/lib/lipia";
import { getOrderByNumber, markOrderPaid, updateOrderStatus } from "@/lib/orders";
import { OrderStatus } from "@/lib/types";
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const bookingRef = searchParams.get("bookingRef");
  const reference = searchParams.get("reference");

  // ── 1. Check Storefront Order Payment Status ───────────────────────────────
  if (orderNumber) {
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "payment_pending") {
      if (order.status === "cancelled") {
        return NextResponse.json({ status: "cancelled", order, message: "Order payment was cancelled or failed." });
      }
      return NextResponse.json({ status: "success", order, message: "Payment verified successfully." });
    }

    if (!order.transactionReference) {
      return NextResponse.json({ status: order.status, message: "No payment request reference found." });
    }

    const result = await checkTransactionStatus(order.transactionReference);

    if (result.status === "success") {
      const markPaidResult = await markOrderPaid(order.orderNumber, result.mpesaReceipt);
      if (markPaidResult && markPaidResult.newlyPaid) {
        Promise.allSettled([
          sendOrderConfirmationEmail(markPaidResult.order),
          sendAdminNewOrderEmail(markPaidResult.order),
          sendOrderConfirmationSMS(markPaidResult.order),
          sendAdminNewOrderSMS(markPaidResult.order),
        ]).catch((err) => console.error("Order status polling notifications failed:", err));
      }
      return NextResponse.json({
        status: "success",
        order: markPaidResult?.order || order,
        message: result.message || "Payment received successfully!",
        receipt: result.mpesaReceipt,
      });
    } else if (result.status === "cancelled") {
      const updated = await updateOrderStatus(order.orderNumber, "cancelled", "User cancelled M-Pesa payment on phone.");
      if (updated) {
        Promise.allSettled([
          sendOrderStatusUpdateEmail(updated, "M-Pesa payment cancelled on phone."),
          sendOrderStatusUpdateSMS(updated, "Payment cancelled on phone."),
        ]).catch((err) => console.error("Order status cancellation notifications failed:", err));
      }
      return NextResponse.json({
        status: "cancelled",
        order: updated || order,
        message: "Payment request was cancelled on your phone.",
      });
    } else if (result.status === "failed") {
      const updated = await updateOrderStatus(order.orderNumber, "cancelled", `Payment failed: ${result.message}`);
      return NextResponse.json({
        status: "failed",
        order: updated || order,
        message: result.message || "M-Pesa payment failed. Please try again.",
      });
    }

    return NextResponse.json({
      status: "pending",
      message: result.message || "Waiting for M-Pesa PIN prompt on phone...",
    });
  }

  // ── 2. Check 47Studio Booking Payment Status ──────────────────────────────
  const targetBookingRef = bookingRef || reference;
  if (targetBookingRef) {
    const { data: booking } = await supabaseServer
      .from("studio_bookings")
      .select("*")
      .or(`booking_ref.eq.${targetBookingRef},mpesa_receipt.eq.${targetBookingRef}`)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json({ error: "Booking reference not found" }, { status: 404 });
    }

    if (booking.deposit_paid) {
      return NextResponse.json({
        status: "success",
        booking,
        message: "Deposit payment verified!",
        receipt: booking.mpesa_receipt,
      });
    }

    const txRef = booking.mpesa_receipt || targetBookingRef;
    const result = await checkTransactionStatus(txRef);

    if (result.status === "success") {
      const { data: updatedBooking } = await supabaseServer
        .from("studio_bookings")
        .update({
          deposit_paid: true,
          status: "deposit_paid",
          mpesa_receipt: result.mpesaReceipt || txRef,
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
        ]).catch((err) => console.error("Studio deposit status notifications failed:", err));
      }

      return NextResponse.json({
        status: "success",
        booking: updatedBooking || booking,
        message: "Deposit paid successfully!",
        receipt: result.mpesaReceipt,
      });
    } else if (result.status === "cancelled") {
      return NextResponse.json({
        status: "cancelled",
        booking,
        message: "Deposit M-Pesa STK Push was cancelled on your phone.",
      });
    } else if (result.status === "failed") {
      return NextResponse.json({
        status: "failed",
        booking,
        message: result.message || "M-Pesa deposit payment failed.",
      });
    }

    return NextResponse.json({
      status: "pending",
      message: result.message || "Waiting for M-Pesa PIN input...",
    });
  }

  return NextResponse.json({ error: "Missing orderNumber or bookingRef parameter" }, { status: 400 });
}
