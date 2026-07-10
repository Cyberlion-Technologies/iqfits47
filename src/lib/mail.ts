import { Order } from "@/lib/types";
import { formatKES } from "@/lib/utils";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const MAIL_SENDER = "IQFITS-47 <notifications@iqfits47.store>";
const ADMIN_EMAIL = "iqfits47@gmail.com"; // Notify admin here

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

function getEmailHeader(title: string, subtitle: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Space Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #15151A; background-color: #F4F2ED;">
      <!-- Header Block -->
      <div style="background-color: #15151A; padding: 32px 24px; text-align: center; border-radius: 20px 20px 0 0; border-bottom: 3px solid #FF5A1F;">
        <!-- Real logo from header/footer -->
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
              <h1 style="font-size: 32px; margin: 0; letter-spacing: -0.05em; text-transform: uppercase; color: #F4F2ED; line-height: 1; font-weight: 900; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                IQFITS-<span style="color: #FF5A1F;">47</span>
              </h1>
            </td>
          </tr>
        </table>
        <p style="font-size: 8px; color: #DFDBCF; margin: 6px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: 0.18em; font-weight: bold; text-transform: uppercase; text-align: center;">
          KICKS &bull; STREETWEAR &bull; DESIGNER FITS
        </p>
        <div style="display: inline-block; margin-top: 16px; background-color: #FF5A1F; color: #ffffff; padding: 6px 16px; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; border-radius: 9999px; text-transform: uppercase; font-weight: bold;">
          ${subtitle}
        </div>
      </div>
      <!-- Main Content Container -->
      <div style="background-color: #ffffff; border-radius: 0 0 20px 20px; padding: 32px 24px; border: 1px solid #DFDBCF; border-top: none; box-shadow: 0 4px 12px rgba(21, 21, 26, 0.03); font-size: 15px; line-height: 1.6; color: #15151A;">
  `;
}

function getEmailFooter(): string {
  return `
      </div>
      <!-- Branded Footer -->
      <div style="text-align: center; margin-top: 32px; padding: 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <!-- Social Links Section -->
        <div style="margin-bottom: 24px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #7c7c8c; margin-bottom: 12px; font-weight: bold;">Connect With Us</p>
          <a href="https://www.instagram.com/47.iqfits._/" target="_blank" style="display: inline-block; background-color: #15151A; color: #F4F2ED; padding: 10px 20px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 12px; margin: 0 6px; border: 1px solid rgba(255, 90, 31, 0.2); letter-spacing: 0.02em;">
            Instagram
          </a>
          <a href="https://chat.whatsapp.com/HKekz4fQhR8AQudjaP4qeH" target="_blank" style="display: inline-block; background-color: #15151A; color: #F4F2ED; padding: 10px 20px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 12px; margin: 0 6px; border: 1px solid rgba(255, 90, 31, 0.2); letter-spacing: 0.02em;">
            WhatsApp Community
          </a>
        </div>

        <!-- Contact & Store Info -->
        <div style="font-size: 12px; color: #57534e; line-height: 1.6; border-top: 1px solid #DFDBCF; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0; font-weight: bold; color: #15151A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">IQFITS-47 Store</p>
          <p style="margin: 4px 0;">Nairobi, Kenya</p>
          <p style="margin: 4px 0;">WhatsApp/Phone: <a href="https://wa.me/254716672878" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">+254 716 672 878</a></p>
          <p style="margin: 4px 0;">Email: <a href="mailto:support@iqfits47.store" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">support@iqfits47.store</a></p>
        </div>

        <!-- Security/Trust Notes -->
        <p style="font-size: 10px; color: #7c7c8c; margin-top: 24px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.08em;">
          Payments secured via M-Pesa STK Push &bull; 100% Authentic Kicks
        </p>
        <p style="font-size: 10px; color: #a8a29e; margin-top: 8px;">
          &copy; ${new Date().getFullYear()} IQFITS-47. All rights reserved.
        </p>
      </div>
    </div>
  `;
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

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">ORDER SUMMARY</h3>
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

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">DELIVERY INFORMATION</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 0; color: #15151A;">
        <strong>Recipient:</strong> ${order.delivery.fullName}<br>
        <strong>Phone:</strong> ${order.delivery.phone}<br>
        <strong>Address:</strong> ${order.delivery.town}, ${order.delivery.county}<br>
        ${order.delivery.notes ? `<strong>Notes:</strong> ${order.delivery.notes}` : ""}
      </p>
    ${getEmailFooter()}
  `;

  if (!order.delivery.email) {
    console.warn("Order does not have a customer email address, skipping confirmation email.");
    return false;
  }

  return sendEmail({
    to: order.delivery.email,
    subject: `Order Confirmation — ${order.orderNumber} [IQFITS-47]`,
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
    <li style="margin-bottom: 8px;"><strong>${item.name}</strong> (Size: ${item.size}, Qty: ${item.quantity}) &bull; <span style="font-family: monospace; font-weight: bold;">${formatKES(item.price * item.quantity)}</span></li>
  `
    )
    .join("");

  const html = `
    ${getEmailHeader(`New Order Received`, `Fulfillment Alert`)}
      <h2 style="font-size: 20px; margin-top: 0; color: #15151A;">New Order Received: ${order.orderNumber}</h2>
      <p>A new order has been paid and is ready for fulfillment.</p>
      
      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Order Details</h3>
      <ul style="padding-left: 20px; color: #15151A;">
        ${itemsList}
      </ul>
      <p style="font-size: 16px;"><strong>Total Amount:</strong> <span style="color: #FF5A1F; font-weight: bold; font-family: monospace;">${formatKES(order.total)}</span></p>
      
      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Delivery Address</h3>
      <p style="font-size: 14px; line-height: 1.5; color: #15151A;">
        <strong>Name:</strong> ${order.delivery.fullName}<br>
        <strong>Phone:</strong> ${order.delivery.phone}<br>
        <strong>Email:</strong> ${order.delivery.email || "Not provided"}<br>
        <strong>Location:</strong> ${order.delivery.town}, ${order.delivery.county}<br>
        <strong>Notes:</strong> ${order.delivery.notes || "None"}
      </p>

      <p style="margin-top: 30px; text-align: center;">
        <a href="https://iqfits47.store/admin" style="background-color: #FF5A1F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 14px; border: 1px solid #FF5A1F;">
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
    ${getEmailHeader(`Order Update`, `Status: ${currentStatusLabel}`)}
      <p style="margin-top: 0;">Hi <strong>${order.delivery.fullName}</strong>,</p>
      <p>The status of your order <strong>${order.orderNumber}</strong> has been updated to:</p>
      
      <div style="background-color: #F4F2ED; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; border: 1px solid #DFDBCF;">
        <span style="font-size: 18px; font-weight: bold; text-transform: uppercase; color: #FF5A1F; letter-spacing: 0.05em;">${currentStatusLabel}</span>
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
        <a href="https://iqfits47.store/track-order?order=${order.orderNumber}" style="background-color: #15151A; color: #F4F2ED; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 14px; border: 1px solid #FF5A1F;">
          Track Your Order
        </a>
      </p>
    ${getEmailFooter()}
  `;

  if (!order.delivery.email) {
    console.warn("Order does not have a customer email address, skipping status update email.");
    return false;
  }

  return sendEmail({
    to: order.delivery.email,
    subject: `Order Update: ${currentStatusLabel} — ${order.orderNumber} [IQFITS-47]`,
    html,
  });
}

/**
 * Notifies the store admin about a successful referral event.
 */
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

/**
 * Notifies the store admin about a new affiliate/referral registration.
 */
export async function sendAdminNewAffiliateNotificationEmail(
  phone: string,
  displayName: string,
  referralCode: string
): Promise<boolean> {
  const html = `
    ${getEmailHeader(`New Referral Sign-up`, `New Affiliate`)}
      <p style="margin-top: 0; font-size: 16px;">Hey Admin,</p>
      <p>A new user has registered for the referral program!</p>
      
      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #15151A;">AFFILIATE DETAILS</h3>
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

/**
 * Notifies the store admin about a new partner application.
 */
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

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #15151A;">APPLICANT DETAILS</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c; width: 140px;">Name</td>
          <td style="padding: 6px 0; color: #15151A;">${app.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Email</td>
          <td style="padding: 6px 0; color: #15151A;"><a href="mailto:${app.email}" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">${app.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Phone</td>
          <td style="padding: 6px 0; color: #15151A;">${app.phone}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Company / Brand</td>
          <td style="padding: 6px 0; color: #15151A;">${app.company || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Website / Socials</td>
          <td style="padding: 6px 0; color: #15151A;">
            ${app.website ? `<a href="${app.website.startsWith("http") ? app.website : "https://" + app.website}" target="_blank" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">${app.website}</a>` : "Not provided"}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #7c7c8c;">Partnership Type</td>
          <td style="padding: 6px 0; color: #15151A; font-weight: bold; text-transform: uppercase;">${app.partnershipType.replace(/_/g, " ")}</td>
        </tr>
      </table>

      <h3 style="border-bottom: 2px solid #15151A; padding-bottom: 8px; margin-top: 30px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #15151A;">PROPOSAL / MESSAGE</h3>
      <div style="background-color: #F4F2ED; border-radius: 12px; padding: 16px; margin-top: 10px; font-size: 14px; line-height: 1.5; color: #15151A; white-space: pre-wrap; border: 1px solid #DFDBCF;">${app.message}</div>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[PARTNER APPLICATION] ${app.name} - ${app.partnershipType.toUpperCase()}`,
    html,
  });
}

/**
 * Sends a confirmation email to the partner applicant.
 */
export async function sendPartnerConfirmationEmail(app: {
  name: string;
  email: string;
  partnershipType: string;
}): Promise<boolean> {
  const html = `
    ${getEmailHeader(`Application Received`, `Application Received`)}
      <p style="margin-top: 0;">Hi <strong>${app.name}</strong>,</p>
      <p>Thank you for your interest in partnering with <strong>IQFITS-47</strong>!</p>
      <p>We've successfully received your application to join us as a <strong style="text-transform: uppercase; color: #FF5A1F;">${app.partnershipType.replace(/_/g, " ")}</strong>.</p>
      
      <div style="background-color: #F4F2ED; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #DFDBCF; font-size: 14px; line-height: 1.5; color: #15151A;">
        <p style="margin-top: 0; font-weight: bold; color: #15151A; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">What happens next?</p>
        <ol style="margin-bottom: 0; padding-left: 20px; color: #57534e;">
          <li style="margin-bottom: 6px;">Our team will review your application details and proposal.</li>
          <li style="margin-bottom: 6px;">We will assess how your style/brand aligns with our upcoming drops.</li>
          <li>We will get in touch with you via email or phone within 3-5 business days.</li>
        </ol>
      </div>

      <p>If you have any questions or would like to send additional portfolio materials, feel free to reply directly to this email or chat with us on WhatsApp.</p>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: app.email,
    subject: `Partnership Application Received — ${app.name} [IQFITS-47]`,
    html,
  });
}

/**
 * Sends a status update email to the partner applicant when accepted/rejected.
 */
export async function sendPartnerStatusUpdateEmail(
  app: { name: string; email: string; partnershipType: string },
  status: "accepted" | "rejected" | "reviewed"
): Promise<boolean> {
  let subtitleText = "Application Update";
  let subjectText = `Partnership Application Update — [IQFITS-47]`;
  let statusHtml = "";

  if (status === "accepted") {
    subtitleText = "Application Approved";
    subjectText = `Partnership Application Approved! 🎉 [IQFITS-47]`;
    statusHtml = `
      <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #bbf7d0; font-size: 14px; line-height: 1.6; color: #15803d;">
        <p style="margin-top: 0; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #166534;">Congratulations! Your application has been ACCEPTED.</p>
        <p style="margin-bottom: 16px; color: #166534;">We are thrilled to welcome you to the IQFITS-47 circle. A member of our team will contact you in the next 24-48 hours to discuss next steps, share exclusive codes, and set up our onboarding call.</p>
        <p style="margin-bottom: 0; text-align: center;">
          <a href="https://iqfits47.store/partner/onboarding?name=${encodeURIComponent(app.name)}&type=${encodeURIComponent(app.partnershipType)}" style="background-color: #FF5A1F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 14px; border: 1px solid #FF5A1F;">
            Start Onboarding Setup
          </a>
        </p>
      </div>
    `;
  } else if (status === "reviewed") {
    subtitleText = "Application Under Review";
    subjectText = `Partnership Application Under Review ⏳ [IQFITS-47]`;
    statusHtml = `
      <div style="background-color: #fffbeb; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #fef3c7; font-size: 14px; line-height: 1.6; color: #92400e;">
        <p style="margin-top: 0; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #d97706;">Application Under Review ⏳</p>
        <p style="margin-bottom: 12px; color: #78350f;">Great news! We have started reviewing your application. Our creative team is currently evaluating your profile, social handles, and proposal to see how they align with our upcoming drops and brand vibe.</p>
        <p style="margin-bottom: 0; color: #78350f;">No further action is required from you at this moment. We will update you as soon as the review is complete (usually within 3-5 business days). Thank you for your patience!</p>
      </div>
    `;
  } else {
    // rejected
    subtitleText = "Application Update";
    subjectText = `Partnership Application Update — [IQFITS-47]`;
    statusHtml = `
      <div style="background-color: #fafaf9; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e7e5e4; font-size: 14px; line-height: 1.6; color: #57534e;">
        <p style="margin-top: 0; font-weight: bold; color: #1c1917; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; color: #44403c;">Update on your application:</p>
        <p style="margin-bottom: 0;">At this time, we are unable to move forward with an active partnership. However, we were highly impressed by your profile and will keep your contact details and proposal on file as new drops and campaigns roll out in the future.</p>
      </div>
    `;
  }

  const html = `
    ${getEmailHeader(`Partnership Update`, subtitleText)}
      <p style="margin-top: 0;">Hi <strong>${app.name}</strong>,</p>
      <p>We are writing to update you on your partnership application with <strong>IQFITS-47</strong> as a <strong style="text-transform: uppercase; color: #FF5A1F;">${app.partnershipType.replace(/_/g, " ")}</strong>.</p>
      
      ${statusHtml}

      <p>Thank you again for connecting with us. We appreciate your passion and support for our brand!</p>
    ${getEmailFooter()}
  `;

  return sendEmail({
    to: app.email,
    subject: subjectText,
    html,
  });
}


