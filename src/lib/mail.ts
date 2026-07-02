import { Order } from "@/lib/types";
import { formatKES } from "@/lib/utils";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const MAIL_SENDER = "IQFIT47 <notifications@iqfits47.top>";
const ADMIN_EMAIL = "notifications@iqfits47.top"; // Notify admin here

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log("==================================================");
    console.log(`[EMAIL SIMULATOR] Sending email to: ${to}`);
    console.log(`[EMAIL SIMULATOR] Subject: ${subject}`);
    console.log(`[EMAIL SIMULATOR] Body:\n`, html.replace(/<[^>]*>/g, " ").trim().slice(0, 300) + "...");
    console.log("==================================================");
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: MAIL_SENDER,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Resend API error:", errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    return false;
  }
}

/**
 * Sends order receipt/confirmation to the customer.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #1c1917;">${item.name}</strong><br>
        <span style="font-size: 12px; color: #6b7280;">Size: ${item.size} · Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-family: monospace;">
        ${formatKES(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1917; background-color: #fafaf9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; margin: 0; letter-spacing: -0.05em; text-transform: uppercase;">IQFIT47</h1>
        <p style="font-size: 14px; color: #ef4444; margin: 5px 0 0 0; font-family: monospace; letter-spacing: 0.1em;">ORDER CONFIRMED</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e7e5e4;">
        <p style="margin-top: 0;">Hi <strong>${order.delivery.fullName}</strong>,</p>
        <p>Your payment for order <strong>${order.orderNumber}</strong> has been received successfully. We are now packing your order for delivery!</p>

        <h3 style="border-bottom: 2px solid #1c1917; padding-bottom: 8px; margin-top: 30px;">ORDER SUMMARY</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsList}
          <tr>
            <td style="padding: 12px 12px 4px 12px;">Subtotal</td>
            <td style="padding: 12px 12px 4px 12px; text-align: right; font-family: monospace;">${formatKES(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 12px 12px 12px; border-bottom: 1px solid #e5e7eb;">Delivery Fee</td>
            <td style="padding: 4px 12px 12px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${formatKES(order.deliveryFee)}</td>
          </tr>
          <tr>
            <td style="padding: 16px 12px; font-weight: bold; font-size: 18px;">Total Paid</td>
            <td style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #ef4444; font-family: monospace;">${formatKES(order.total)}</td>
          </tr>
        </table>

        <h3 style="border-bottom: 2px solid #1c1917; padding-bottom: 8px; margin-top: 30px;">DELIVERY INFORMATION</h3>
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 0;">
          <strong>Recipient:</strong> ${order.delivery.fullName}<br>
          <strong>Phone:</strong> ${order.delivery.phone}<br>
          <strong>Address:</strong> ${order.delivery.town}, ${order.delivery.county}<br>
          ${order.delivery.notes ? `<strong>Notes:</strong> ${order.delivery.notes}` : ""}
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #78716c;">
        <p>IQFIT47 Store · Nairobi, Kenya</p>
        <p>If you have any questions, contact us on WhatsApp at +254716672878</p>
      </div>
    </div>
  `;

  if (!order.delivery.email) {
    console.warn("Order does not have a customer email address, skipping confirmation email.");
    return false;
  }

  return sendEmail({
    to: order.delivery.email,
    subject: `Order Confirmation — ${order.orderNumber} [IQFIT47]`,
    html,
  });
}

/**
 * Notifies the store admin about a new paid order.
 */
export async function sendAdminNewOrderEmail(order: Order): Promise<boolean> {
  const itemsList = order.items
    .map(
      (item) => `
    <li><strong>${item.name}</strong> (Size: ${item.size}, Qty: ${item.quantity}) - ${formatKES(item.price * item.quantity)}</li>
  `
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1c1917;">
      <h2>New Order Received: ${order.orderNumber}</h2>
      <p>A new order has been paid and is ready for fulfillment.</p>
      
      <h3>Order Details</h3>
      <ul>
        ${itemsList}
      </ul>
      <p><strong>Total Amount:</strong> ${formatKES(order.total)}</p>
      
      <h3>Delivery Address</h3>
      <p>
        Name: ${order.delivery.fullName}<br>
        Phone: ${order.delivery.phone}<br>
        Email: ${order.delivery.email}<br>
        Location: ${order.delivery.town}, ${order.delivery.county}<br>
        Notes: ${order.delivery.notes || "None"}
      </p>

      <p style="margin-top: 30px;">
        <a href="https://iqfits47.top/admin" style="background-color: #1c1917; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
          Go to Admin Console
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[NEW ORDER] ${order.orderNumber} - ${order.delivery.fullName}`,
    html,
  });
}

/**
 * Notifies the customer about an order status change.
 */
export async function sendOrderStatusUpdateEmail(order: Order, note?: string): Promise<boolean> {
  const statusLabels: Record<string, string> = {
    processing: "Processing",
    dispatched: "Dispatched & On the Way",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered Successfully",
    cancelled: "Cancelled",
  };

  const currentStatusLabel = statusLabels[order.status] || order.status;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1917; background-color: #fafaf9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; margin: 0; letter-spacing: -0.05em; text-transform: uppercase;">IQFIT47</h1>
        <p style="font-size: 14px; color: #ef4444; margin: 5px 0 0 0; font-family: monospace; letter-spacing: 0.1em;">ORDER UPDATE</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e7e5e4;">
        <p style="margin-top: 0;">Hi <strong>${order.delivery.fullName}</strong>,</p>
        <p>The status of your order <strong>${order.orderNumber}</strong> has been updated to:</p>
        
        <div style="background-color: #f5f5f4; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <span style="font-size: 18px; font-weight: bold; text-transform: uppercase; color: #ef4444;">${currentStatusLabel}</span>
        </div>

        ${
          note
            ? `
          <div style="border-left: 4px solid #ef4444; padding-left: 16px; margin: 20px 0; font-style: italic; color: #57534e;">
            "${note}"
          </div>
        `
            : ""
        }

        <p>You can track your order live on our website using your order number.</p>
        
        <p style="margin-top: 24px;">
          <a href="https://iqfits47.top/track?order=${order.orderNumber}" style="background-color: #1c1917; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 14px;">
            Track Your Order
          </a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #78716c;">
        <p>IQFIT47 Store · Nairobi, Kenya</p>
        <p>If you have any questions, contact us on WhatsApp at +254716672878</p>
      </div>
    </div>
  `;

  if (!order.delivery.email) {
    console.warn("Order does not have a customer email address, skipping status update email.");
    return false;
  }

  return sendEmail({
    to: order.delivery.email,
    subject: `Order Update: ${currentStatusLabel} — ${order.orderNumber} [IQFIT47]`,
    html,
  });
}
