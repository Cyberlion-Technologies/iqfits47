import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { DeliveryDetails, Order, OrderItem, OrderStatus, OrderTimelineEntry } from "@/lib/types";
import { generateOrderNumber } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  payment_pending: "Waiting for M-Pesa payment",
  paid: "Payment received",
  processing: "Order is being packed",
  dispatched: "Dispatched from our Nairobi store",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Order cancelled",
};

function timelineEntry(status: OrderStatus, note?: string): OrderTimelineEntry {
  return {
    status,
    label: STATUS_LABELS[status],
    timestamp: new Date().toISOString(),
    note,
  };
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    items: row.items as OrderItem[],
    subtotal: row.subtotal as number,
    deliveryFee: row.delivery_fee as number,
    total: row.total as number,
    delivery: row.delivery as DeliveryDetails,
    status: row.status as OrderStatus,
    timeline: row.timeline as OrderTimelineEntry[],
    paymentMethod: "mpesa",
    mpesaReceipt: (row.mpesa_receipt as string) ?? undefined,
    transactionReference: (row.transaction_reference as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export interface CreateOrderInput {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: DeliveryDetails;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!isSupabaseServerConfigured()) {
    throw new Error(
      "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local."
    );
  }

  const orderNumber = generateOrderNumber();
  const timeline = [timelineEntry("payment_pending")];

  const { data, error } = await supabaseServer
    .from("orders")
    .insert({
      order_number: orderNumber,
      items: input.items,
      subtotal: input.subtotal,
      delivery_fee: input.deliveryFee,
      total: input.total,
      delivery: input.delivery,
      status: "payment_pending",
      timeline,
      payment_method: "mpesa",
      customer_phone: input.delivery.phone,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create order.");
  }

  return rowToOrder(data);
}

export async function attachTransactionReference(
  orderNumber: string,
  reference: string
) {
  await supabaseServer
    .from("orders")
    .update({ transaction_reference: reference })
    .eq("order_number", orderNumber);
}

export async function markOrderPaid(orderNumber: string, mpesaReceipt?: string): Promise<{ order: Order; newlyPaid: boolean } | null> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return null;

  if (order.status !== "payment_pending") {
    return { order, newlyPaid: false };
  }

  const timeline = [...order.timeline, timelineEntry("paid"), timelineEntry("processing")];

  const { data, error } = await supabaseServer
    .from("orders")
    .update({
      status: "processing",
      mpesa_receipt: mpesaReceipt,
      timeline,
    })
    .eq("order_number", orderNumber)
    .eq("status", "payment_pending")
    .select()
    .single();

  if (error || !data) {
    const refreshed = await getOrderByNumber(orderNumber);
    return refreshed ? { order: refreshed, newlyPaid: false } : null;
  }

  return { order: rowToOrder(data), newlyPaid: true };
}

export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus,
  note?: string,
  mpesaReceipt?: string
) {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return null;

  const timeline = [...order.timeline, timelineEntry(status, note)];

  const updatePayload: any = { status, timeline };
  if (mpesaReceipt) {
    updatePayload.mpesa_receipt = mpesaReceipt;
  }

  const { data, error } = await supabaseServer
    .from("orders")
    .update(updatePayload)
    .eq("order_number", orderNumber)
    .select()
    .single();

  if (error || !data) return null;
  return rowToOrder(data);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabaseServer
    .from("orders")
    .select()
    .eq("order_number", orderNumber.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) return null;
  return rowToOrder(data);
}

export async function getOrderForTracking(
  orderNumber: string,
  phone: string
): Promise<Order | null> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return null;

  const normalizedInput = phone.replace(/\D/g, "").slice(-9);
  const normalizedStored = order.delivery.phone.replace(/\D/g, "").slice(-9);

  if (normalizedInput !== normalizedStored) return null;
  return order;
}
