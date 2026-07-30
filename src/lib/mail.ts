import { Order } from "@/lib/types";
import { formatKES } from "@/lib/utils";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const MAIL_SENDER = process.env.RESEND_FROM_EMAIL || "IQFITS-47 <notifications@iqfits47.store>";
const STUDIO_SENDER = process.env.STUDIO_FROM_EMAIL || "47Studio <bookings@iqfits47.store>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "iqfits47@gmail.com";
const STUDIO_ADMIN_EMAIL = process.env.STUDIO_ADMIN_EMAIL || ADMIN_EMAIL;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log("==================================================");
    console.log(`[EMAIL SIMULATOR] Sending email to: ${to}`);
    console.log(`[EMAIL SIMULATOR] From: ${from || MAIL_SENDER}`);
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
        from: from || MAIL_SENDER,
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

function getEmailHeader(title: string, subtitle: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Space Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #15151A; background-color: #F4F2ED;">
      <div style="background-color: #15151A; padding: 32px 24px; text-align: center; border-radius: 20px 20px 0 0; border-bottom: 3px solid #FF5A1F;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 4px auto; border-collapse: collapse;">
          <tr>
            <td style="padding: 0; vertical-align: middle;">
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; transform: skewX(-12deg); -webkit-transform: skewX(-12deg);">
                <tr>
                  <td style="width: 4px; height: 20px; background-color: #FF5A1F; padding: 0;"></td>
                  <td style="width: 4px; padding: 0;"></td>
                  <td style="width: 4px; height: 20px; background-color: #FF5A1F; padding: 0;"></td>
                </tr>
              </table>
            </td>
            <td style="width: 8px; padding: 0;"></td>
            <td style="padding: 0; vertical-align: middle;">
              <h1 style="font-size: 32px; margin: 0; letter-spacing: -0.05em; text-transform: uppercase; color: #F4F2ED; line-height: 1; font-weight: 900;">
                IQFITS-<span style="color: #FF5A1F;">47</span>
              </h1>
            </td>
          </tr>
        </table>
        <p style="font-size: 8px; color: #DFDBCF; margin: 6px 0 0 0; letter-spacing: 0.18em; font-weight: bold; text-transform: uppercase; text-align: center;">
          KICKS &bull; STREETWEAR &bull; DESIGNER FITS
        </p>
        <div style="display: inline-block; margin-top: 16px; background-color: #FF5A1F; color: #ffffff; padding: 6px 16px; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; border-radius: 9999px; text-transform: uppercase; font-weight: bold;">
          ${subtitle}
        </div>
      </div>
      <div style="background-color: #ffffff; border-radius: 0 0 20px 20px; padding: 32px 24px; border: 1px solid #DFDBCF; border-top: none; font-size: 15px; line-height: 1.6; color: #15151A;">
  `;
}

function getEmailFooter(): string {
  return `
      </div>
      <div style="text-align: center; margin-top: 32px; padding: 0 16px;">
        <div style="margin-bottom: 24px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #7c7c8c; margin-bottom: 12px; font-weight: bold;">Connect With Us</p>
          <a href="https://www.instagram.com/47.iqfits._/" target="_blank" style="display: inline-block; background-color: #15151A; color: #F4F2ED; padding: 10px 20px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 12px; margin: 0 6px;">
            Instagram
          </a>
          <a href="https://chat.whatsapp.com/HKekz4fQhR8AQudjaP4qeH" target="_blank" style="display: inline-block; background-color: #15151A; color: #F4F2ED; padding: 10px 20px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 12px; margin: 0 6px;">
            WhatsApp Community
          </a>
        </div>
        <div style="font-size: 12px; color: #57534e; line-height: 1.6; border-top: 1px solid #DFDBCF; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0; font-weight: bold; color: #15151A; font-size: 13px; text-transform: uppercase;">IQFITS-47 Store</p>
          <p style="margin: 4px 0;">Nairobi, Kenya</p>
          <p style="margin: 4px 0;">WhatsApp/Phone: <a href="https://wa.me/254716672878" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">+254 716 672 878</a></p>
          <p style="margin: 4px 0;">Email: <a href="mailto:support@iqfits47.store" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">support@iqfits47.store</a></p>
        </div>
        <p style="font-size: 10px; color: #7c7c8c; margin-top: 24px; font-family: monospace; text-transform: uppercase;">
          Payments secured via M-Pesa STK Push &bull; 100% Authentic Kicks
        </p>
        <p style="font-size: 10px; color: #a8a29e; margin-top: 8px;">
          &copy; ${new Date().getFullYear()} IQFITS-47. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #15151A;">${item.name}</strong><br>
        <span style="font-size: 12px; color: #6b7280;">Size: ${item.size} &bull; Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-family: monospace; color: #15151A; font-weight: bold;">
        ${formatKES(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join("");

  const devDetails = (order.delivery || {}) as any;
  let discountRow = "";
  if (devDetails.discountAmount && devDetails.discountAmount > 0) {
    discountRow = `
      <tr>
        <td style="padding: 4px 12px; color: #ef4444;">Promo Discount (${devDetails.discountPercent || 0}%)</td>
        <td style="padding: 4px 12px; text-align: right; font-family: monospace; color: #ef4444;">-${formatKES(devDetails.discountAmount)}</td>
      </tr>
    `;
  } else if (devDetails.referralDiscountAmount && devDetails.referralDiscountAmount > 0) {
    discountRow = `
      <tr>
        <td style="padding: 4px 12px; color: #ef4444;">Referral Discount (${devDetails.referralDiscountPercent || 0}%)</td>
        <td style="padding: 4px 12px; text-align: right; font-family: monospace; color: #ef4444;">-${formatKES(devDetails.referralDiscountAmount)}</td>
      </tr>
    `;
  }

  const html = `
    ${getEmailHeader(`Order Confirmed`, `Order Confirmed`)}
      <p style="margin-top: 0;">Hi <strong>${order.delivery.fullName}</strong>,</p>
      <p>Your payment for order <strong>${order.orderNumber}</strong> has been received successfully. We are now packing your order for delivery!</p>

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 16px; text-transform: uppercase;">ORDER SUMMARY</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${itemsList}
        <tr>
          <td style="padding: 12px 12px 4px 12px; color: #7c7c8c;">Subtotal</td>
          <td style="padding: 12px 12px 4px 12px; text-align: right; font-family: monospace; color: #15151A;">${formatKES(order.subtotal)}</td>
        </tr>
        ${discountRow}
        <tr>
          <td style="padding: 4px 12px 12px 12px; border-bottom: 1px solid #e5e7eb; color: #7c7c8c;">Delivery Fee</td>
          <td style="padding: 4px 12px 12px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-family: monospace; color: #15151A;">${formatKES(order.deliveryFee)}</td>
        </tr>
        <tr>
          <td style="padding: 16px 12px; font-weight: bold; font-size: 18px;">Total Paid</td>
          <td style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #FF5A1F; font-family: monospace;">${formatKES(order.total)}</td>
        </tr>
      </table>

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 16px; text-transform: uppercase;">DELIVERY INFORMATION</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 0; color: #15151A;">
        <strong>Recipient:</strong> ${order.delivery.fullName}<br>
        <strong>Phone:</strong> ${order.delivery.phone}<br>
        <strong>Address:</strong> ${order.delivery.town}, ${order.delivery.county}<br>
        ${order.delivery.notes ? `<strong>Notes:</strong> ${order.delivery.notes}` : ""}
      </p>
    ${getEmailFooter()}
  `;

  if (!order.delivery.email) {
    return false;
  }

  return sendEmail({
    to: order.delivery.email,
    subject: `Order Confirmation — ${order.orderNumber} [IQFITS-47]`,
    html,
  });
}

export async function sendAdminNewOrderEmail(order: Order): Promise<boolean> {
  const itemsList = order.items
    .map(
      (item) => `
    <li style="margin-bottom: 8px;"><strong>${item.name}</strong> (Size: ${item.size}, Qty: ${item.quantity}) &bull; <span style="font-family: monospace; font-weight: bold;">${formatKES(item.price * item.quantity)}</span></li>
  `
    )
    .join("");

  const html = `
    ${getEmailHeader(`New Order Received`, `Fulfillment Alert`)}
      <h2 style="font-size: 20px; margin-top: 0; color: #15151A;">New Order Received: ${order.orderNumber}</h2>
      <p>A new order has been paid and is ready for fulfillment.</p>
      
      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 24px; font-size: 14px; text-transform: uppercase;">Order Details</h3>
      <ul style="padding-left: 20px; color: #15151A;">
        ${itemsList}
      </ul>
      <p style="font-size: 16px;"><strong>Total Amount:</strong> <span style="color: #FF5A1F; font-weight: bold; font-family: monospace;">${formatKES(order.total)}</span></p>
      
      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 24px; font-size: 14px; text-transform: uppercase;">Delivery Address</h3>
      <p style="font-size: 14px; line-height: 1.5; color: #15151A;">
        <strong>Name:</strong> ${order.delivery.fullName}<br>
        <strong>Phone:</strong> ${order.delivery.phone}<br>
        <strong>Email:</strong> ${order.delivery.email || "Not provided"}<br>
        <strong>Location:</strong> ${order.delivery.town}, ${order.delivery.county}<br>
        <strong>Notes:</strong> ${order.delivery.notes || "None"}
      </p>

      <p style="margin-top: 30px; text-align: center;">
        <a href="https://iqfits47.store/admin" style="background-color: #FF5A1F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 14px;">
          Go to Admin Console
        </a>
      </p>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[NEW ORDER] ${order.orderNumber} - ${order.delivery.fullName}`,
    html,
  });
}

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
    ${getEmailHeader(`Order Update`, `Status: ${currentStatusLabel}`)}
      <p style="margin-top: 0;">Hi <strong>${order.delivery.fullName}</strong>,</p>
      <p>The status of your order <strong>${order.orderNumber}</strong> has been updated to:</p>
      
      <div style="background-color: #F4F2ED; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; border: 1px solid #DFDBCF;">
        <span style="font-size: 18px; font-weight: bold; text-transform: uppercase; color: #FF5A1F;">${currentStatusLabel}</span>
      </div>

      ${
        note
          ? `
        <div style="border-left: 4px solid #FF5A1F; padding-left: 16px; margin: 20px 0; font-style: italic; color: #57534e; font-size: 14px;">
          "${note}"
        </div>
      `
          : ""
      }

      <p>You can track your order live on our website using your order number.</p>
      
      <p style="margin-top: 28px; text-align: center;">
        <a href="https://iqfits47.store/track-order?order=${order.orderNumber}" style="background-color: #15151A; color: #F4F2ED; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 14px;">
          Track Your Order
        </a>
      </p>
    ${getEmailFooter()}
  `;

  if (!order.delivery.email) {
    return false;
  }

  return sendEmail({
    to: order.delivery.email,
    subject: `Order Update: ${currentStatusLabel} — ${order.orderNumber} [IQFITS-47]`,
    html,
  });
}

export async function sendAdminReferralNotificationEmail(
  affiliateCode: string,
  affiliateName: string,
  orderNumber: string,
  creditAwarded: number
): Promise<boolean> {
  const html = `
    ${getEmailHeader(`Referral Completed`, `Referral Success`)}
      <p style="margin-top: 0; font-size: 16px;">Hey Admin,</p>
      <p>A referral event was successfully completed!</p>
      <p>Affiliate <strong>${affiliateName}</strong> (Code: <strong>${affiliateCode}</strong>) referred order <strong>${orderNumber}</strong>.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; border: 1px solid #bbf7d0;">
        <span style="font-size: 16px; font-weight: bold; color: #15803d; font-family: monospace;">Credit Awarded: ${formatKES(creditAwarded)}</span>
      </div>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[REFERRAL SUCCESS] ${affiliateCode} referred ${orderNumber} [IQFITS-47]`,
    html,
  });
}

export async function sendAdminNewAffiliateNotificationEmail(
  phone: string,
  displayName: string,
  referralCode: string
): Promise<boolean> {
  const html = `
    ${getEmailHeader(`New Referral Sign-up`, `New Affiliate`)}
      <p style="margin-top: 0; font-size: 16px;">Hey Admin,</p>
      <p>A new user has registered for the referral program!</p>
      
      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 14px; text-transform: uppercase; color: #15151A;">AFFILIATE DETAILS</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c; width: 140px;">Phone</td>
          <td style="padding: 6px 0; color: #15151A;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Display Name</td>
          <td style="padding: 6px 0; color: #15151A;">${displayName || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Referral Code</td>
          <td style="padding: 6px 0; color: #15151A; font-weight: bold; text-transform: uppercase;">${referralCode}</td>
        </tr>
      </table>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[NEW REFERRAL SIGN-UP] Code: ${referralCode} - ${displayName || phone} [IQFITS-47]`,
    html,
  });
}

export async function sendAdminPartnerApplicationEmail(app: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  website?: string;
  partnershipType: string;
  message: string;
}): Promise<boolean> {
  const html = `
    ${getEmailHeader(`New Partner Application`, `Partner Request`)}
      <p style="margin-top: 0; font-size: 16px;">Hey Admin,</p>
      <p>A new partnership application has been received from the portal.</p>

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 14px; text-transform: uppercase; color: #15151A;">APPLICANT DETAILS</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c; width: 140px;">Name</td>
          <td style="padding: 6px 0; color: #15151A;">${app.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Email</td>
          <td style="padding: 6px 0; color: #15151A;"><a href="mailto:${app.email}" style="color: #FF5A1F;">${app.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Phone</td>
          <td style="padding: 6px 0; color: #15151A;">${app.phone}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Company</td>
          <td style="padding: 6px 0; color: #15151A;">${app.company || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Partnership Type</td>
          <td style="padding: 6px 0; color: #15151A; font-weight: bold; text-transform: uppercase;">${app.partnershipType.replace(/_/g, " ")}</td>
        </tr>
      </table>

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 14px; text-transform: uppercase; color: #15151A;">PROPOSAL</h3>
      <div style="background-color: #F4F2ED; border-radius: 12px; padding: 16px; margin-top: 10px; font-size: 14px; line-height: 1.5; color: #15151A; white-space: pre-wrap;">${app.message}</div>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[PARTNER APPLICATION] ${app.name} - ${app.partnershipType.toUpperCase()}`,
    html,
  });
}

export async function sendPartnerConfirmationEmail(app: {
  name: string;
  email: string;
  partnershipType: string;
}): Promise<boolean> {
  const html = `
    ${getEmailHeader(`Application Received`, `Application Received`)}
      <p style="margin-top: 0;">Hi <strong>${app.name}</strong>,</p>
      <p>Thank you for your interest in partnering with <strong>IQFITS-47</strong>!</p>
      <p>We've received your application to join us as a <strong style="text-transform: uppercase; color: #FF5A1F;">${app.partnershipType.replace(/_/g, " ")}</strong>.</p>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: app.email,
    subject: `Partnership Application Received — ${app.name} [IQFITS-47]`,
    html,
  });
}

export async function sendPartnerStatusUpdateEmail(
  app: { name: string; email: string; partnershipType: string },
  status: "accepted" | "rejected" | "reviewed"
): Promise<boolean> {
  const html = `
    ${getEmailHeader(`Partnership Update`, `Application Update`)}
      <p style="margin-top: 0;">Hi <strong>${app.name}</strong>,</p>
      <p>Your application status is now: <strong style="text-transform: uppercase; color: #FF5A1F;">${status}</strong>.</p>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: app.email,
    subject: `Partnership Application Update — [IQFITS-47]`,
    html,
  });
}

export async function sendBookingConfirmationEmail(booking: {
  booking_ref: string;
  full_name: string;
  email?: string | null;
  booking_type: string;
  tattoo_style: string;
  tattoo_size: string;
  body_placement: string;
  preferred_date?: string | null;
}): Promise<boolean> {
  if (!booking.email) return false;

  const html = `
    <div style="font-family: 'Space Grotesk', sans-serif; background-color: #070709; color: #f5f5f7; padding: 32px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
      <div style="text-align: center; border-bottom: 2px solid #ff5500; padding-bottom: 20px; margin-bottom: 24px;">
        <h1 style="font-size: 28px; margin: 0; color: #fff;">47<span style="color: #ff5500;">STUDIO</span></h1>
        <p style="color: #ff5500; font-size: 11px; font-family: monospace; text-transform: uppercase;">47Cultures & Ink • Nairobi</p>
      </div>

      <div style="background-color: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.3); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <p style="color: #ff5500; font-family: monospace; font-size: 11px; text-transform: uppercase; margin: 0;">BOOKING REF</p>
        <h2 style="font-size: 24px; color: #fff; font-family: monospace; margin: 4px 0 0 0;">${booking.booking_ref}</h2>
      </div>

      <p>Habari <strong>${booking.full_name}</strong>, your ${booking.booking_type === "tour" ? "Kenya Tour" : "Studio Session"} booking has been received!</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; background: #12121c; padding: 16px; border-radius: 10px;">
        <tr><td style="color: #888; padding: 6px;">Style:</td><td style="font-weight: bold; color: #fff; text-align: right;">${booking.tattoo_style}</td></tr>
        <tr><td style="color: #888; padding: 6px;">Size:</td><td style="color: #fff; text-align: right;">${booking.tattoo_size}</td></tr>
        <tr><td style="color: #888; padding: 6px;">Placement:</td><td style="color: #fff; text-align: right;">${booking.body_placement}</td></tr>
        ${booking.preferred_date ? `<tr><td style="color: #888; padding: 6px;">Date:</td><td style="color: #ff5500; font-weight: bold; text-align: right;">${booking.preferred_date}</td></tr>` : ""}
      </table>

      <div style="text-align: center; margin-top: 28px;">
        <a href="https://www.instagram.com/47.studio._/" style="background-color: #ff5500; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-weight: bold; display: inline-block;">
          DM Us On Instagram @47.studio._
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: booking.email,
    subject: `47Studio Tattoo Booking Confirmation #${booking.booking_ref}`,
    html,
    from: STUDIO_SENDER,
  });
}

export async function sendAdminNewBookingEmail(booking: {
  booking_ref: string;
  full_name: string;
  phone: string;
  email?: string | null;
  booking_type: string;
  tattoo_style: string;
  tattoo_size: string;
  body_placement: string;
  design_description: string;
}): Promise<boolean> {
  const html = `
    <h2>💉 New 47Studio Tattoo Booking #${booking.booking_ref}</h2>
    <p><strong>Client:</strong> ${booking.full_name} (${booking.phone}, ${booking.email || "No email"})</p>
    <p><strong>Type:</strong> ${booking.booking_type}</p>
    <p><strong>Style:</strong> ${booking.tattoo_style}</p>
    <p><strong>Size:</strong> ${booking.tattoo_size}</p>
    <p><strong>Placement:</strong> ${booking.body_placement}</p>
    <p><strong>Design Idea:</strong> ${booking.design_description}</p>
    <p><a href="https://iqfits47.store/studio">Manage in 47Studio Console</a></p>
  `;

  return sendEmail({
    to: STUDIO_ADMIN_EMAIL,
    subject: `💉 New 47Studio Booking #${booking.booking_ref} - ${booking.full_name}`,
    html,
    from: STUDIO_SENDER,
  });
}

export async function sendAdminBookingStatusUpdateEmail(booking: {
  booking_ref: string;
  full_name: string;
  status: string;
  notes?: string | null;
}): Promise<boolean> {
  const formattedStatus = booking.status.replace(/_/g, " ").toUpperCase();
  const html = `
    <h2>🔄 47Studio Booking Status Update #${booking.booking_ref}</h2>
    <p><strong>Client:</strong> ${booking.full_name}</p>
    <p><strong>New Status:</strong> <strong style="color: #ff5500;">${formattedStatus}</strong></p>
    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
    <p><a href="https://iqfits47.store/studio">Manage in 47Studio Console</a></p>
  `;

  return sendEmail({
    to: STUDIO_ADMIN_EMAIL,
    subject: `🔄 47Studio Booking #${booking.booking_ref} Status: ${formattedStatus}`,
    html,
    from: STUDIO_SENDER,
  });
}

export async function sendAdminBookingCancelledEmail(booking: {
  booking_ref: string;
  full_name: string;
  notes?: string | null;
}): Promise<boolean> {
  const html = `
    <h2 style="color: #ef4444;">❌ 47Studio Booking Cancelled #${booking.booking_ref}</h2>
    <p><strong>Client:</strong> ${booking.full_name}</p>
    <p><strong>Status:</strong> CANCELLED</p>
    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
    <p><a href="https://iqfits47.store/studio">Manage in 47Studio Console</a></p>
  `;

  return sendEmail({
    to: STUDIO_ADMIN_EMAIL,
    subject: `❌ 47Studio Booking Cancelled #${booking.booking_ref} - ${booking.full_name}`,
    html,
    from: STUDIO_SENDER,
  });
}
