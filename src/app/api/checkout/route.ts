import { NextRequest, NextResponse } from "next/server";
import { createOrder, attachTransactionReference } from "@/lib/orders";
import { initiateStkPush } from "@/lib/lipia";
import { normalizeMpesaPhone } from "@/lib/utils";
import { OrderItem } from "@/lib/types";
import { supabaseServer } from "@/lib/supabase/server";

const DELIVERY_FEE_NAIROBI = 300;
const DELIVERY_FEE_OTHER = 500;
const FREE_DELIVERY_THRESHOLD = 15000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, delivery, promoCode } = body as {
      items: OrderItem[];
      delivery: {
        fullName: string;
        phone: string;
        email?: string;
        county: string;
        town: string;
        addressLine: string;
        notes?: string;
      };
      promoCode?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    if (!delivery?.fullName || !delivery?.phone || !delivery?.county || !delivery?.addressLine) {
      return NextResponse.json(
        { error: "Please fill in all required delivery details." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeMpesaPhone(delivery.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Enter a valid Safaricom number, e.g. 0712345678." },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee =
      subtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : delivery.county.toLowerCase().includes("nairobi") ||
          delivery.county.toLowerCase().includes("kiambu")
        ? DELIVERY_FEE_NAIROBI
        : DELIVERY_FEE_OTHER;

    // Apply promo code discount if valid
    let discountAmount = 0;
    let discountPercent = 0;
    let appliedPromoCode = null;

    if (promoCode) {
      const { data: offer, error: offerError } = await supabaseServer
        .from("offers")
        .select("*")
        .eq("code", promoCode.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (offer && !offerError) {
        discountPercent = offer.discount_percent || 0;
        discountAmount = Math.round((subtotal * discountPercent) / 100);
        appliedPromoCode = offer.code;
      }
    }

    const total = Math.max(0, subtotal - discountAmount) + deliveryFee;

    const order = await createOrder({
      items,
      subtotal,
      deliveryFee,
      total,
      delivery: {
        ...delivery,
        phone: normalizedPhone,
        ...(appliedPromoCode ? { promoCode: appliedPromoCode, discountAmount, discountPercent } : {})
      },
    });

    const stk = await initiateStkPush({
      phone: normalizedPhone,
      amount: total,
      accountReference: order.orderNumber,
      transactionDesc: `IQFIT47 order ${order.orderNumber}`,
    });

    if (!stk.success) {
      return NextResponse.json(
        {
          order,
          payment: stk,
          error: stk.message || "Could not start the M-Pesa payment. Please try again.",
        },
        { status: 502 }
      );
    }

    if (stk.reference) {
      await attachTransactionReference(order.orderNumber, stk.reference);
    }

    return NextResponse.json({ order, payment: stk });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
