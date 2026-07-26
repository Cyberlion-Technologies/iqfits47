/**
 * Email & SMS Notification Templates
 * Provides styled HTML email layouts & concise text messages for IQFITS-47 & 47Studio.
 */

// ── IQFITS-47 ORDER CONFIRMATION EMAIL ───────────────────────────────────────
export function renderOrderEmailHtml({
  customerName,
  orderNumber,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryAddress,
}: {
  customerName: string;
  orderNumber: string;
  items: { name: string; size?: string; price: number; quantity: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
}): string {
  const itemsListHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #282830; color: #f5f5f7;">
        <strong style="color: #ffffff;">${item.name}</strong>
        ${item.size ? `<span style="display: block; font-size: 11px; color: #888899; font-family: monospace;">Size: ${item.size}</span>` : ""}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #282830; color: #888899; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #282830; color: #ff5500; font-weight: bold; text-align: right; font-family: monospace;">
        KES ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation #${orderNumber}</title>
  </head>
  <body style="background-color: #0f0f12; color: #f5f5f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #16161d; border-radius: 16px; border: 1px solid #2a2a35; padding: 32px; overflow: hidden;">
      
      <!-- Header -->
      <div style="border-bottom: 2px solid #ff5500; padding-bottom: 20px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 26px; margin: 0; letter-spacing: -0.5px; text-transform: uppercase;">
          IQFITS-<span style="color: #ff5500;">47</span>
        </h1>
        <p style="color: #888899; font-size: 11px; text-transform: uppercase; tracking: 2px; margin-top: 4px;">Kicks • Streetwear • Designer Fits</p>
      </div>

      <!-- Hero Message -->
      <div style="background-color: rgba(255, 85, 0, 0.08); border-left: 4px solid #ff5500; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="color: #ff5500; font-size: 18px; margin: 0 0 6px 0;">Order Received!</h2>
        <p style="color: #d0d0dc; font-size: 14px; margin: 0;">
          Hi <strong>${customerName}</strong>, thank you for shopping with IQFITS-47. Your order <strong>#${orderNumber}</strong> has been logged and is being processed.
        </p>
      </div>

      <!-- Items Table -->
      <h3 style="color: #ffffff; font-size: 14px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px; margin-bottom: 12px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #333344; color: #888899; text-align: left; font-size: 11px; text-transform: uppercase; font-family: monospace;">
            <th style="padding-bottom: 8px;">Item</th>
            <th style="padding-bottom: 8px; text-align: center;">Qty</th>
            <th style="padding-bottom: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
        </tbody>
      </table>

      <!-- Total Breakdown -->
      <div style="background-color: #1a1a24; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #aaaabb; margin-bottom: 6px;">
          <span>Subtotal:</span>
          <span>KES ${subtotal.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #aaaabb; margin-bottom: 6px;">
          <span>Delivery Fee:</span>
          <span>${deliveryFee === 0 ? "FREE" : `KES ${deliveryFee.toLocaleString()}`}</span>
        </div>
        <div style="border-top: 1px solid #2a2a3a; pt: 10px; margin-top: 10px; display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #ffffff;">
          <span>Total:</span>
          <span style="color: #ff5500; font-family: monospace;">KES ${total.toLocaleString()}</span>
        </div>
      </div>

      <!-- Address -->
      <div style="margin-bottom: 24px;">
        <h4 style="color: #888899; font-size: 11px; text-transform: uppercase; font-family: monospace; margin: 0 0 6px 0;">Delivery Address</h4>
        <p style="color: #cccccc; font-size: 13px; margin: 0; line-height: 1.4;">${deliveryAddress}</p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://iqfits47.store/track-order" style="display: inline-block; background-color: #ff5500; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 99px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
          Track Order Live
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #222230; margin-top: 32px; pt: 20px; text-align: center; font-size: 11px; color: #666677;">
        <p>IQFITS-47 Kenya • Authentic Kicks & Streetwear • Nairobi, Kenya</p>
        <p style="margin-top: 4px;">Need help? Email <a href="mailto:support@iqfits47.store" style="color: #ff5500;">support@iqfits47.store</a> or WhatsApp +254 716 672 878</p>
      </div>

    </div>
  </body>
  </html>
  `;
}

// ── 47STUDIO TATTOO BOOKING EMAIL ────────────────────────────────────────────
export function renderBookingEmailHtml({
  clientName,
  bookingRef,
  bookingType,
  style,
  size,
  placement,
  dateOrCity,
}: {
  clientName: string;
  bookingRef: string;
  bookingType: string;
  style: string;
  size: string;
  placement: string;
  dateOrCity: string;
}): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>47Studio Booking #${bookingRef}</title>
  </head>
  <body style="background-color: #070709; color: #f5f5f7; font-family: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border-radius: 20px; border: 1px solid #222230; padding: 36px; overflow: hidden;">
      
      <!-- Studio Header -->
      <div style="border-bottom: 2px solid #ff5500; padding-bottom: 20px; margin-bottom: 28px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0; letter-spacing: -1px; text-transform: uppercase;">
          47<span style="color: #ff5500;">STUDIO</span>
        </h1>
        <p style="color: #ff5500; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">47Cultures &amp; Ink • Nairobi, Kenya</p>
      </div>

      <!-- Booking Badge -->
      <div style="background-color: rgba(255, 85, 0, 0.1); border: 1px solid rgba(255, 85, 0, 0.3); padding: 20px; border-radius: 14px; margin-bottom: 28px; text-align: center;">
        <p style="color: #ff5500; font-family: monospace; font-size: 12px; uppercase; margin: 0 0 4px 0;">Booking Reference</p>
        <h2 style="color: #ffffff; font-size: 24px; margin: 0; font-family: monospace; letter-spacing: 2px;">${bookingRef}</h2>
        <p style="color: #aaaabb; font-size: 13px; margin-top: 8px;">
          Habari <strong>${clientName}</strong>, your ${bookingType === "tour" ? "Kenya Tour" : "Studio Session"} request has been logged!
        </p>
      </div>

      <!-- Details Card -->
      <div style="background-color: #12121c; border-radius: 14px; border: 1px solid #1e1e2d; padding: 20px; margin-bottom: 28px;">
        <h3 style="color: #888899; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 0;">Tattoo Session Specs</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #666677; font-family: monospace; text-transform: uppercase; font-size: 11px;">Style:</td>
            <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${style}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666677; font-family: monospace; text-transform: uppercase; font-size: 11px;">Size:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666677; font-family: monospace; text-transform: uppercase; font-size: 11px;">Placement:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${placement}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666677; font-family: monospace; text-transform: uppercase; font-size: 11px;">${bookingType === "tour" ? "Tour Stop" : "Requested Date"}:</td>
            <td style="padding: 8px 0; color: #ff5500; font-weight: bold; text-align: right;">${dateOrCity}</td>
          </tr>
        </table>
      </div>

      <!-- Next Steps -->
      <div style="margin-bottom: 32px;">
        <h4 style="color: #ffffff; font-size: 14px; text-transform: uppercase; font-family: monospace; margin: 0 0 10px 0;">What happens next?</h4>
        <ul style="color: #aaaaee; font-size: 13px; padding-left: 20px; margin: 0; line-height: 1.6;">
          <li>Our lead artist will review your design idea and placement.</li>
          <li>We'll contact you via Instagram DM (<a href="https://www.instagram.com/47.studio._/" style="color: #ff5500;">@47.studio._</a>) or WhatsApp to confirm your slot.</li>
          <li>A small deposit locks in your date &amp; time.</li>
        </ul>
      </div>

      <!-- Instagram CTA Button -->
      <div style="text-align: center;">
        <a href="https://www.instagram.com/47.studio._/" style="display: inline-block; background-color: #ff5500; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 99px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
          DM Us On Instagram @47.studio._
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #1a1a24; margin-top: 36px; pt: 20px; text-align: center; font-size: 11px; color: #555566;">
        <p>47Studio (47Cultures &amp; Ink) • Nairobi, Kenya</p>
        <p style="margin-top: 4px;">Every tattoo tells a story.</p>
      </div>

    </div>
  </body>
  </html>
  `;
}
