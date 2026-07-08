import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service and sales conditions for shopping on IQFITS-47.",
  alternates: {
    canonical: "/policies/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <section className="space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-ink">Terms of Service</h2>
        <p className="font-mono text-xs text-ink/40">Last Updated: July 2026</p>
        <p>
          Welcome to <strong>IQFITS-47</strong>. By browsing, accessing, or placing an order on our website, you agree to comply with and be bound by the following Terms of Service. Please read them carefully before completing any transaction.
        </p>
      </section>

      <div className="border-t border-ink/10 my-6" />

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">1. Product Authenticity & Inventory</h3>
        <p>
          We guarantee that all sneakers, apparel, and accessories listed on IQFITS-47 are <strong>100% authentic</strong>. 
        </p>
        <p>
          Due to the exclusive and limited nature of our products, items in your cart are not reserved until payment is fully completed and confirmed by M-Pesa. In rare cases where a product sells out concurrently due to processing lag, we will contact you immediately to arrange an alternative product exchange or a full refund.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">2. Pricing & Currency</h3>
        <p>
          All prices on our store are listed in <strong>Kenyan Shillings (KES)</strong> and are inclusive of any applicable sales taxes. Shipping and delivery fees are calculated separately during checkout based on the delivery county and location. We reserve the right to adjust pricing or withdraw promotional offers at any time without prior notice.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">3. Payments & Order Validation</h3>
        <p>
          We accept payments via <strong>M-Pesa STK Push</strong>. By confirming your order:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You authorize us to trigger an STK prompt to your Safaricom phone number for the total order amount.</li>
          <li>Your order will remain in a pending state until payment is verified by our system.</li>
          <li>Unpaid orders will automatically be cancelled after 15 minutes.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">4. Shipping & Delivery</h3>
        <p>
          We fulfill deliveries across Kenya. Delivery timelines are estimates and commence from the date of dispatch:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Nairobi & Kiambu:</strong> 1 to 2 business days.</li>
          <li><strong>Nationwide:</strong> 2 to 4 business days.</li>
          <li>Deliveries are carried out by third-party logistics agents. IQFITS-47 is not liable for transport delays caused by extreme weather, civil unrest, or courier errors.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">5. Customer Responsibilities</h3>
        <p>
          You agree to provide accurate, current, and complete details (name, phone number, and physical address) during checkout. Providing incorrect coordinates or an inactive M-Pesa number may result in delivery delays or order cancellation.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">6. Intellectual Property</h3>
        <p>
          All content on this website—including logo designs, layouts, graphics, text, and code—is the property of IQFITS-47 and protected by copyright laws. You may not copy, reproduce, or reuse any part of our site without express written consent.
        </p>
      </section>
    </>
  );
}
