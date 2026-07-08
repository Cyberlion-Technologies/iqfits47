import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "Learn about the return, refund, and exchange policies for sneakers, apparel, and accessories at IQFITS-47.",
  alternates: {
    canonical: "/policies/returns",
  },
};

export default function ReturnsPolicyPage() {
  return (
    <>
      <section className="space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-ink">Returns & Exchanges</h2>
        <p className="font-mono text-xs text-ink/40">Last Updated: July 2026</p>
        <p>
          At <strong>IQFITS-47</strong>, we source authentic sneakers, premium apparel, and accessories. Because our inventory consists of highly-coveted items and limited drops, we enforce a strict policy to ensure all items remain completely authentic and pristine for our community.
        </p>
      </section>

      <div className="border-t border-ink/10 my-6" />

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">1. Returns & Exchange Period</h3>
        <p>
          You have exactly <strong>7 calendar days</strong> from the date of delivery to request an exchange or store credit. Any requests submitted after this 7-day window will unfortunately not be accepted.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">2. Condition Requirements</h3>
        <p>
          To be eligible for an exchange or store credit, items must meet the following criteria:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Sneakers:</strong> Must be completely unworn, clean, uncreased, with original tissue paper, tags, accessories, and the original undamaged sneaker box. Do not use the sneaker box as the shipping container; place it inside a outer protective carton.</li>
          <li><strong>Apparel:</strong> Must be unworn, unwashed, free of perfume/odors, and have all original tags intact.</li>
          <li><strong>Accessories:</strong> Must be in their original packaging, unopened, and unused.</li>
        </ul>
        <p className="text-sm italic text-hazard">
          * Note: We inspect every returned item. If an item shows signs of wear, creasing, or damage, the return request will be rejected, and the item will be sent back to you at your expense.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">3. Refund Method</h3>
        <p>
          We do not issue direct cash, bank, or M-Pesa refunds except in the rare event of a confirmed manufacturer defect. For all approved returns:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>We will process an exchange for a different size (subject to stock availability).</li>
          <li>If the size is unavailable, we will issue a store credit in the form of a digital gift voucher valid for 12 months.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">4. Shipping & Delivery Fees</h3>
        <p>
          Return shipping fees are the responsibility of the customer unless the return is due to our error (e.g., wrong size or item shipped).
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Nairobi & Kiambu:</strong> A flat rate of KES 300 applies for courier pickup, or you can drop it off directly at our Nairobi pickup hub.</li>
          <li><strong>Nationwide:</strong> A flat rate of KES 500 applies for returns sent via partner courier services.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">5. How to Initiate a Return</h3>
        <p>
          To start a return or exchange:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Send a WhatsApp message to our customer service line: <strong>+254 716 672 878</strong>.</li>
          <li>Provide your **Order Number** (e.g., IQ-XXXX) and photos showing the condition of the item and its packaging.</li>
          <li>Our team will respond within 24 hours to guide you on drop-off or pickup coordination.</li>
        </ol>
      </section>
    </>
  );
}
