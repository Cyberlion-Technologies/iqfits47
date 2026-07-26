/**
 * Resend Email Integration
 * Uses Resend REST API to send HTML email notifications for IQFITS-47 & 47Studio.
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface ResendResponse {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail({ to, subject, html, from, replyTo }: SendEmailOptions): Promise<ResendResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.RESEND_FROM_EMAIL || "IQFITS-47 <orders@iqfits47.store>";

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not configured. Email notification skipped.");
    return { success: false, error: "Resend API key not configured" };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const validRecipients = recipients.filter((e) => e && e.includes("@"));

  if (validRecipients.length === 0) {
    console.warn("[Resend] No valid recipient email provided.");
    return { success: false, error: "Invalid recipient email" };
  }

  try {
    const payload = {
      from: from || defaultFrom,
      to: validRecipients,
      subject: subject,
      html: html,
      reply_to: replyTo,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[Resend] Email sent successfully to ${validRecipients.join(", ")} (ID: ${data.id})`);
      return { success: true, id: data.id };
    } else {
      console.error(`[Resend] Failed to send email:`, data);
      return { success: false, error: data.message || "Resend API error" };
    }
  } catch (err) {
    console.error("[Resend] Exception sending email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
