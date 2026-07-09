import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { updateOrderStatus } from "@/lib/orders";
import { sendOrderStatusUpdateEmail } from "@/lib/mail";
import { sendOrderStatusUpdateSMS } from "@/lib/sms";
import { checkAdminAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseServer
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Parse order items, delivery details, and timeline if they are strings
  const parsedOrders = (data || []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    delivery: typeof row.delivery === "string" ? JSON.parse(row.delivery) : row.delivery,
    status: row.status,
    timeline: typeof row.timeline === "string" ? JSON.parse(row.timeline) : row.timeline,
    paymentMethod: row.payment_method,
    mpesaReceipt: row.mpesa_receipt,
    transactionReference: row.transaction_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json({ orders: parsedOrders });
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
    const { orderNumber, status, note } = body;

    if (!orderNumber || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedOrder = await updateOrderStatus(orderNumber, status, note);
    
    if (!updatedOrder) {
      return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
    }

    // Trigger email notification to the customer about status change
    try {
      await sendOrderStatusUpdateEmail(updatedOrder, note);
    } catch (mailErr) {
      console.error("Failed to send order status update email:", mailErr);
      // Don't fail the request just because email failed
    }

    // Trigger SMS notification to the customer about status change
    try {
      await sendOrderStatusUpdateSMS(updatedOrder, note);
    } catch (smsErr) {
      console.error("Failed to send order status update SMS:", smsErr);
      // Don't fail the request just because SMS failed
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Error updating admin order:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
