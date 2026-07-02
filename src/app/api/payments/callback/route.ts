import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { supabaseServer } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/mail";

/**
 * Webhook receiver for Lipia Online payment callbacks.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const reference =
    payload.reference ?? payload.CheckoutRequestID ?? payload.checkout_request_id;
  const status = String(payload.status ?? "").toLowerCase();
  const mpesaReceipt = payload.mpesa_receipt ?? payload.MpesaReceiptNumber;

  if (!reference) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  const { data: order } = await supabaseServer
    .from("orders")
    .select("order_number")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found for this transaction" }, { status: 404 });
  }

  if (["success", "completed", "paid"].includes(status)) {
    const result = await markOrderPaid(order.order_number, mpesaReceipt);
    if (result && result.newlyPaid) {
      try {
        await sendOrderConfirmationEmail(result.order);
        await sendAdminNewOrderEmail(result.order);
      } catch (err) {
        console.error("Failed to send notification emails in callback:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
