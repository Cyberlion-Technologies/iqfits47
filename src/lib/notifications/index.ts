/**
 * Notification Service Hub
 * Unified API for sending SMS (TextSMS.co.ke) & Email (Resend) notifications
 * for both IQFITS-47 Storefront and 47Studio Tattoo Bookings.
 */

import { sendSMS } from "./textsms";
import { sendEmail } from "./resend";
import { renderOrderEmailHtml, renderBookingEmailHtml } from "./templates";

const STORE_ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "iqfits47@gmail.com";
const STORE_ADMIN_PHONE = process.env.ADMIN_NOTIFY_PHONE || "254716672878";

const STUDIO_ADMIN_EMAIL = process.env.STUDIO_ADMIN_EMAIL || STORE_ADMIN_EMAIL;
const STUDIO_ADMIN_PHONE = process.env.STUDIO_ADMIN_PHONE || STORE_ADMIN_PHONE;

// ── 1. IQFITS-47 NEW ORDER NOTIFICATION ──────────────────────────────────────
export async function notifyNewOrder({
  orderNumber,
  customerName,
  phone,
  email,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryAddress,
}: {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  items: { name: string; size?: string; price: number; quantity: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
}) {
  const tasks: Promise<unknown>[] = [];

  // 1a. SMS to Customer
  const customerSmsMsg = `Hi ${customerName}, your IQFITS-47 order #${orderNumber} (KES ${total.toLocaleString()}) has been placed! Track live: https://iqfits47.store/track-order`;
  tasks.push(sendSMS({ phone, message: customerSmsMsg }));

  // 1b. SMS Alert to Store Admin
  if (STORE_ADMIN_PHONE) {
    const adminSmsMsg = `[NEW ORDER] #${orderNumber} by ${customerName} (Phone: ${phone}). Total: KES ${total.toLocaleString()}.`;
    tasks.push(sendSMS({ phone: STORE_ADMIN_PHONE, message: adminSmsMsg }));
  }

  // 1c. Email to Customer (if provided)
  if (email && email.includes("@")) {
    const html = renderOrderEmailHtml({
      customerName,
      orderNumber,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
    });
    tasks.push(
      sendEmail({
        to: email,
        subject: `Order Confirmation #${orderNumber} — IQFITS-47`,
        html,
      })
    );
  }

  // 1d. Email Alert to Store Admin
  if (STORE_ADMIN_EMAIL) {
    const adminHtml = `
      <h2>New Order Received: #${orderNumber}</h2>
      <p><strong>Customer:</strong> ${customerName} (${phone}, ${email || "No email"})</p>
      <p><strong>Total:</strong> KES ${total.toLocaleString()}</p>
      <p><strong>Address:</strong> ${deliveryAddress}</p>
      <p><a href="https://iqfits47.store/admin">Manage in IQFITS Admin Console</a></p>
    `;
    tasks.push(
      sendEmail({
        to: STORE_ADMIN_EMAIL,
        subject: `🚨 New Store Order #${orderNumber} - KES ${total.toLocaleString()}`,
        html: adminHtml,
      })
    );
  }

  // Fire all notification tasks asynchronously
  await Promise.allSettled(tasks);
}

// ── 2. IQFITS-47 ORDER STATUS CHANGE NOTIFICATION ────────────────────────────
export async function notifyOrderStatusChange({
  orderNumber,
  customerName,
  phone,
  email,
  status,
}: {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  status: string;
}) {
  const tasks: Promise<unknown>[] = [];

  const formattedStatus = status.replace(/_/g, " ").toUpperCase();
  const smsMsg = `Hi ${customerName}, your IQFITS-47 order #${orderNumber} is now: ${formattedStatus}. Track live: https://iqfits47.store/track-order`;

  tasks.push(sendSMS({ phone, message: smsMsg }));

  if (email && email.includes("@")) {
    const html = `
      <div style="font-family: sans-serif; background-color: #0f0f12; color: #fff; padding: 24px; border-radius: 12px;">
        <h2 style="color: #ff5500;">Order Update: #${orderNumber}</h2>
        <p>Hi ${customerName},</p>
        <p>Your order status has been updated to: <strong>${formattedStatus}</strong>.</p>
        <p><a href="https://iqfits47.store/track-order" style="color: #ff5500;">Track your order here</a></p>
        <p style="font-size: 11px; color: #888;">IQFITS-47 Support</p>
      </div>
    `;
    tasks.push(
      sendEmail({
        to: email,
        subject: `Order #${orderNumber} Update: ${formattedStatus} — IQFITS-47`,
        html,
      })
    );
  }

  await Promise.allSettled(tasks);
}

// ── 3. 47STUDIO NEW TATTOO BOOKING NOTIFICATION ──────────────────────────────
export async function notifyNewBooking({
  bookingRef,
  clientName,
  phone,
  email,
  bookingType,
  style,
  size,
  placement,
  dateOrCity,
}: {
  bookingRef: string;
  clientName: string;
  phone: string;
  email?: string;
  bookingType: string;
  style: string;
  size: string;
  placement: string;
  dateOrCity: string;
}) {
  const tasks: Promise<unknown>[] = [];

  // 3a. SMS to Client
  const clientSmsMsg = `Habari ${clientName}! Your 47Studio tattoo booking #${bookingRef} (${style}) is received. We'll contact you on IG/WA shortly. DM @47.studio._ for queries.`;
  tasks.push(sendSMS({ phone, message: clientSmsMsg }));

  // 3b. SMS Alert to Studio Admin
  if (STUDIO_ADMIN_PHONE) {
    const studioAdminSmsMsg = `[47STUDIO BOOKING] #${bookingRef} by ${clientName} (${phone}). Style: ${style}, Size: ${size}, Stop/Date: ${dateOrCity}.`;
    tasks.push(sendSMS({ phone: STUDIO_ADMIN_PHONE, message: studioAdminSmsMsg }));
  }

  // 3c. Email to Client (if provided)
  if (email && email.includes("@")) {
    const html = renderBookingEmailHtml({
      clientName,
      bookingRef,
      bookingType,
      style,
      size,
      placement,
      dateOrCity,
    });
    tasks.push(
      sendEmail({
        to: email,
        subject: `Tattoo Booking Confirmation #${bookingRef} — 47Studio`,
        html,
        from: process.env.STUDIO_FROM_EMAIL || "47Studio <bookings@iqfits47.store>",
      })
    );
  }

  // 3d. Email Alert to Studio Admin
  if (STUDIO_ADMIN_EMAIL) {
    const adminHtml = `
      <h2>💉 New 47Studio Tattoo Booking #${bookingRef}</h2>
      <p><strong>Client:</strong> ${clientName} (${phone}, ${email || "No email"})</p>
      <p><strong>Type:</strong> ${bookingType === "tour" ? "Kenya Tour Stop" : "Studio Session"}</p>
      <p><strong>Style:</strong> ${style}</p>
      <p><strong>Size:</strong> ${size}</p>
      <p><strong>Placement:</strong> ${placement}</p>
      <p><strong>Requested:</strong> ${dateOrCity}</p>
      <p><a href="https://iqfits47.store/studio">Manage in 47Studio Console</a></p>
    `;
    tasks.push(
      sendEmail({
        to: STUDIO_ADMIN_EMAIL,
        subject: `💉 New 47Studio Tattoo Booking #${bookingRef} - ${clientName}`,
        html: adminHtml,
      })
    );
  }

  await Promise.allSettled(tasks);
}

// ── 4. 47STUDIO BOOKING STATUS CHANGE NOTIFICATION ───────────────────────────
export async function notifyBookingStatusChange({
  bookingRef,
  clientName,
  phone,
  email,
  status,
}: {
  bookingRef: string;
  clientName: string;
  phone: string;
  email?: string;
  status: string;
}) {
  const tasks: Promise<unknown>[] = [];

  const formattedStatus = status.replace(/_/g, " ").toUpperCase();
  const smsMsg = `Habari ${clientName}, your 47Studio booking #${bookingRef} status updated to: ${formattedStatus}. DM @47.studio._ on IG for details.`;

  tasks.push(sendSMS({ phone, message: smsMsg }));

  if (email && email.includes("@")) {
    const html = `
      <div style="font-family: sans-serif; background-color: #070709; color: #fff; padding: 24px; border-radius: 12px; border: 1px solid #222;">
        <h2 style="color: #ff5500;">47Studio Booking Update: #${bookingRef}</h2>
        <p>Habari ${clientName},</p>
        <p>Your tattoo booking status has been updated to: <strong style="color: #ff5500;">${formattedStatus}</strong>.</p>
        <p>If you have any questions, slide into our DMs on Instagram <a href="https://www.instagram.com/47.studio._/" style="color: #ff5500;">@47.studio._</a>.</p>
        <p style="font-size: 11px; color: #666;">47Cultures & Ink • Nairobi, Kenya</p>
      </div>
    `;
    tasks.push(
      sendEmail({
        to: email,
        subject: `47Studio Booking #${bookingRef} Status: ${formattedStatus}`,
        html,
        from: process.env.STUDIO_FROM_EMAIL || "47Studio <bookings@iqfits47.store>",
      })
    );
  }

  await Promise.allSettled(tasks);
}
