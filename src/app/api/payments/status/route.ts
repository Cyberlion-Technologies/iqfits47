import { NextRequest, NextResponse } from "next/server";
import { checkTransactionStatus } from "@/lib/lipia";
import { getOrderByNumber, markOrderPaid, updateOrderStatus } from "@/lib/orders";
import { OrderStatus } from "@/lib/types";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail, sendOrderStatusUpdateEmail } from "@/lib/mail";
import { sendOrderConfirmationSMS, sendOrderStatusUpdateSMS, sendAdminNewOrderSMS } from "@/lib/sms";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Missing orderNumber" }, { status: 400 });
  }

  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If already paid/processing/dispatched/etc, don't check Lipia Online API
  if (order.status !== "payment_pending") {
    if (order.status === "cancelled") {
      return NextResponse.json({ status: "cancelled", order });
    }
    return NextResponse.json({ status: "success", order });
  }

  if (!order.transactionReference) {
    return NextResponse.json({ status: order.status, message: "No payment request found." });
  }

  const result = await checkTransactionStatus(order.transactionReference);

  if (result.success && result.status !== "pending") {
    if (result.status === "success") {
      const markPaidResult = await markOrderPaid(order.orderNumber, result.mpesaReceipt);
      if (markPaidResult) {
        if (markPaidResult.newlyPaid) {
          try {
            await sendOrderConfirmationEmail(markPaidResult.order);
            await sendAdminNewOrderEmail(markPaidResult.order);
          } catch (err) {
            console.error("Failed to send checkout success emails in status check:", err);
          }
          try {
            await sendOrderConfirmationSMS(markPaidResult.order);
          } catch (smsErr) {
            console.error("Failed to send confirmation SMS in status check:", smsErr);
          }
          try {
            await sendAdminNewOrderSMS(markPaidResult.order);
          } catch (smsErr) {
            console.error("Failed to send admin order paid SMS in status check:", smsErr);
          }
        }
        return NextResponse.json({
          status: "success",
          order: markPaidResult.order,
          message: result.message,
          receipt: markPaidResult.order.mpesaReceipt,
        });
      }
    } else {
      const dbStatus: OrderStatus = "cancelled";
      const updated = await updateOrderStatus(order.orderNumber, dbStatus, undefined, result.mpesaReceipt);
      if (updated) {
        try {
          await sendOrderStatusUpdateEmail(updated);
        } catch (err) {
          console.error("Failed to send cancellation email in status check:", err);
        }
        try {
          await sendOrderStatusUpdateSMS(updated);
        } catch (smsErr) {
          console.error("Failed to send cancellation SMS in status check:", smsErr);
        }
        return NextResponse.json({
          status: "cancelled",
          order: updated,
          message: result.message,
          receipt: result.mpesaReceipt,
        });
      }
    }
  }

  return NextResponse.json({
    status: order.status,
    message: result.message || "Still waiting for payment...",
  });
}
