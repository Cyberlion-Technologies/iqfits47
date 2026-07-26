/**
 * TextSMS.co.ke SMS integration
 * -----------------------------
 * 
 * This file is the primary interface for sending SMS notifications via TextSMS.co.ke.
 * If the api credentials are not configured, it falls back to simulator logging.
 */

const TEXTSMS_API_KEY = process.env.TEXTSMS_API_KEY || "";
const TEXTSMS_PARTNER_ID = process.env.TEXTSMS_PARTNER_ID || "";
const TEXTSMS_SENDER_ID = process.env.TEXTSMS_SENDER_ID || ""; // shortcode / Sender ID
const STUDIO_ADMIN_PHONE = process.env.STUDIO_ADMIN_PHONE || process.env.ADMIN_PHONE || "254716672878";

interface SendSMSParams {
  mobile: string; // Phone number (will be normalized)
  message: string; // The text message content
}

/**
 * Normalizes phone numbers to standard 2547XXXXXXXX or 2541XXXXXXXX format.
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("254")) {
    // already starts with 254
  } else if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

/**
 * Sends an SMS message using the TextSMS.co.ke API.
 */
export async function sendSMS({ mobile, message }: SendSMSParams): Promise<boolean> {
  const normalizedPhone = normalizePhoneNumber(mobile);

  if (!TEXTSMS_API_KEY || !TEXTSMS_PARTNER_ID) {
    console.log("==================================================");
    console.log(`[SMS SIMULATOR] Sending SMS to: ${normalizedPhone}`);
    console.log(`[SMS SIMULATOR] Sender ID: ${TEXTSMS_SENDER_ID || "MOCK_SENDER"}`);
    console.log(`[SMS SIMULATOR] Message: ${message}`);
    console.log("==================================================");
    return true;
  }

  try {
    const res = await fetch("https://sms.textsms.co.ke/api/services/sendsms/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: TEXTSMS_API_KEY,
        partnerID: TEXTSMS_PARTNER_ID,
        message: message,
        shortcode: TEXTSMS_SENDER_ID,
        mobile: normalizedPhone,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`TextSMS API error: Status ${res.status}. Body: ${errText}`);
      return false;
    }

    const data = await res.json().catch(() => ({}));
    const responseDetail = data?.responses?.[0];
    const responseCode = responseDetail?.["respose-code"] ?? responseDetail?.["response-code"];

    if (responseCode === 200 || responseCode === "200") {
      return true;
    } else {
      console.error("TextSMS API returned failure response:", data);
      return false;
    }
  } catch (error) {
    console.error("Failed to send SMS via TextSMS:", error);
    return false;
  }
}

/**
 * Helper to notify customer on order confirmation.
 */
export async function sendOrderConfirmationSMS(order: any): Promise<boolean> {
  const message = `Order Confirmed! Hi ${order.delivery.fullName}, we have received payment for your order #${order.orderNumber}. We will update you once it's packed. Thank you for shopping with us!`;
  return sendSMS({
    mobile: order.delivery.phone,
    message,
  });
}

/**
 * Helper to notify customer on order status changes.
 */
export async function sendOrderStatusUpdateSMS(order: any, note?: string): Promise<boolean> {
  let statusText = "";
  switch (order.status) {
    case "processing":
      statusText = "is now being packed and prepared for delivery";
      break;
    case "dispatched":
      statusText = "has been dispatched from our Nairobi store";
      break;
    case "out_for_delivery":
      statusText = "is out for delivery and will reach you shortly";
      break;
    case "delivered":
      statusText = "has been successfully delivered. Enjoy your purchase!";
      break;
    case "cancelled":
      statusText = "has been cancelled";
      break;
    default:
      statusText = `status has been updated to "${order.status}"`;
      break;
  }

  let message = `IQFITS-47 Order Update: Hi ${order.delivery.fullName}, your order #${order.orderNumber} ${statusText}.`;
  if (note) {
    message += ` Note: ${note}`;
  }

  return sendSMS({
    mobile: order.delivery.phone,
    message,
  });
}

/**
 * Helper to notify the partner applicant that their application has been received.
 */
export async function sendPartnerConfirmationSMS(name: string, phone: string, partnershipType: string): Promise<boolean> {
  const formattedType = partnershipType.replace(/_/g, " ");
  const message = `Hi ${name}, thank you for your interest in partnering with IQFITS-47! We have received your application for the ${formattedType} role and our team will get back to you within 48 hours.`;
  return sendSMS({
    mobile: phone,
    message,
  });
}

/**
 * Helper to notify partner of their application status update.
 */
export async function sendPartnerStatusUpdateSMS(
  name: string,
  phone: string,
  partnershipType: string,
  status: "accepted" | "rejected" | "reviewed"
): Promise<boolean> {
  const formattedType = partnershipType.replace(/_/g, " ");
  let statusText = "";
  if (status === "accepted") {
    statusText = `has been APPROVED! 🎉 Welcome to the circle. Start onboarding here: https://iqfits47.store/partner/onboarding?name=${encodeURIComponent(name)}&type=${encodeURIComponent(partnershipType)}`;
  } else if (status === "rejected") {
    statusText = "update: At this time, we are unable to move forward with an active partnership. We will keep your proposal on file for future campaigns. Thank you!";
  } else if (status === "reviewed") {
    statusText = "is currently under review by our team. We will update you soon.";
  } else {
    return false;
  }
  
  const message = `IQFITS-47 Partner Update: Hi ${name}, your application as a ${formattedType} ${statusText}`;
  return sendSMS({
    mobile: phone,
    message,
  });
}

/**
 * Helper to notify the admin when a new order is paid.
 */
export async function sendAdminNewOrderSMS(order: any): Promise<boolean> {
  const itemsText = order.items
    .map((item: any) => `${item.name} (${item.size} x${item.quantity})`)
    .join(", ");
  
  const message = `[NEW ORDER] Order #${order.orderNumber} paid by ${order.delivery.fullName} (${order.delivery.phone}). Items: ${itemsText}. Total: KES ${order.total}. Review in admin panel.`;
  const ADMIN_PHONE = process.env.ADMIN_PHONE || "254716672878";
  return sendSMS({
    mobile: ADMIN_PHONE,
    message,
  });
}

/**
 * Helper to notify studio client on booking confirmation.
 */
export async function sendBookingConfirmationSMS(booking: {
  booking_ref: string;
  full_name: string;
  phone: string;
  tattoo_style: string;
}): Promise<boolean> {
  const message = `Habari ${booking.full_name}! Your 47Studio tattoo booking #${booking.booking_ref} (${booking.tattoo_style}) is received. We'll contact you on IG/WA to confirm your slot. DM @47.studio._`;
  return sendSMS({
    mobile: booking.phone,
    message,
  });
}

/**
 * Helper to notify studio admin of a new booking.
 */
export async function sendAdminNewBookingSMS(booking: {
  booking_ref: string;
  full_name: string;
  phone: string;
  tattoo_style: string;
  tattoo_size: string;
}): Promise<boolean> {
  const message = `[47STUDIO BOOKING] #${booking.booking_ref} by ${booking.full_name} (${booking.phone}). Style: ${booking.tattoo_style}, Size: ${booking.tattoo_size}. Review in studio admin.`;
  return sendSMS({
    mobile: STUDIO_ADMIN_PHONE,
    message,
  });
}

/**
 * Helper to notify studio client on booking status change.
 */
export async function sendBookingStatusUpdateSMS(
  phone: string,
  clientName: string,
  bookingRef: string,
  status: string
): Promise<boolean> {
  const formattedStatus = status.replace(/_/g, " ").toUpperCase();
  const message = `Habari ${clientName}, your 47Studio tattoo booking #${bookingRef} status updated to: ${formattedStatus}. DM @47.studio._ on IG for details.`;
  return sendSMS({
    mobile: phone,
    message,
  });
}
