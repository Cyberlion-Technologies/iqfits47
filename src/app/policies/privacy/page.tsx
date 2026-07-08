import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how IQFITS-47 handles your personal data, order information, and payment security.",
  alternates: {
    canonical: "/policies/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-ink">Privacy Policy</h2>
        <p className="font-mono text-xs text-ink/40">Last Updated: July 2026</p>
        <p>
          At <strong>IQFITS-47</strong>, we are committed to protecting the privacy and security of our customers. This Privacy Policy describes how we collect, use, and safeguard the personal information you provide when using our platform.
        </p>
      </section>

      <div className="border-t border-ink/10 my-6" />

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">1. Information We Collect</h3>
        <p>
          When you place an order or interact with our site, we collect specific details required to fulfill your purchase and provide a seamless experience:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Identity Data:</strong> Full name.</li>
          <li><strong>Contact Data:</strong> Phone number (used for M-Pesa STK prompts and delivery updates) and email address.</li>
          <li><strong>Delivery Data:</strong> Delivery address, county, town, and optional delivery notes.</li>
          <li><strong>Order History:</strong> Details of products you purchased, transaction dates, and delivery timelines.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">2. M-Pesa Payment Security</h3>
        <p>
          All mobile payments on our website are processed through <strong>Lipia Online</strong> via secure integration:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>We **never** collect, see, or store your M-Pesa PIN.</li>
          <li>The STK Push prompt is sent directly from Safaricom to your registered phone number.</li>
          <li>We only receive success/failure callbacks and receipt transaction reference codes from the payment gateway to confirm your order.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">3. How We Use Your Information</h3>
        <p>
          We use your collected personal data to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Process and fulfill orders, including forwarding shipping details to our third-party logistics/courier partners.</li>
          <li>Enable live order tracking on our platform.</li>
          <li>Provide customer support and resolve order queries via phone, email, or WhatsApp.</li>
          <li>Send security alerts, order confirmations, and optional promotional updates.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">4. Third-Party Sharing</h3>
        <p>
          We do not sell, rent, or trade your personal information to third parties. We only share essential details with trust-vetted operational service providers:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Logistics Partners:</strong> Local courier companies, riders, and transport operators (e.g., G4S, Wells Fargo, matatu shuttle offices) to execute delivery.</li>
          <li><strong>Database & Hosting Services:</strong> Supabase (used to securely store orders and tracking state) and Next.js/Vercel hosting.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">5. Data Retention & Your Rights</h3>
        <p>
          We retain order history details to facilitate return windows and order lookups. You have the right to request access to the personal data we hold about you, or request that we delete your contact record from our active marketing lists. To make a request, contact us at <strong>privacy@iqfits47.store</strong>.
        </p>
      </section>
    </>
  );
}
