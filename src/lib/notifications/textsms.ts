/**
 * TextSMS.co.ke API Integration
 * Supports sending SMS notifications across Kenya via TextSMS API.
 */

interface SendSMSOptions {
  phone: string;
  message: string;
}

interface TextSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  raw?: unknown;
}

/**
 * Format any Kenyan phone number to 254XXXXXXXXX standard format
 */
export function formatKenyanPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

/**
 * Send an SMS via TextSMS.co.ke
 */
export async function sendSMS({ phone, message }: SendSMSOptions): Promise<TextSMSResponse> {
  const apiKey = process.env.TEXTSMS_API_KEY;
  const partnerId = process.env.TEXTSMS_PARTNER_ID;
  const senderId = process.env.TEXTSMS_SENDER_ID || "TEXTSMS";

  if (!apiKey || !partnerId) {
    console.warn("[TextSMS] TEXTSMS_API_KEY or TEXTSMS_PARTNER_ID not set. SMS notification skipped.");
    return { success: false, error: "SMS service not configured (missing API keys)" };
  }

  const formattedPhone = formatKenyanPhone(phone);
  if (!formattedPhone || formattedPhone.length !== 12) {
    console.warn(`[TextSMS] Invalid phone number format: ${phone}`);
    return { success: false, error: "Invalid phone number" };
  }

  try {
    const payload = {
      apikey: apiKey,
      partnerID: partnerId,
      shortcode: senderId,
      mobile: formattedPhone,
      message: message,
    };

    // Primary endpoint for TextSMS.co.ke
    const response = await fetch("https://sms.textsms.co.ke/api/services/sendsms/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      console.log(`[TextSMS] SMS sent to ${formattedPhone}:`, data);
      return { success: true, raw: data };
    } else {
      console.error(`[TextSMS] SMS send failed for ${formattedPhone}:`, data);
      return { success: false, error: data?.message || "TextSMS API error", raw: data };
    }
  } catch (err) {
    console.error("[TextSMS] Exception sending SMS:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
