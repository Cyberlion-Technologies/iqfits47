import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn how IQFIT47 uses cookies and local storage to enhance your shopping experience.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <section className="space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-ink">Cookie Policy</h2>
        <p className="font-mono text-xs text-ink/40">Last Updated: July 2026</p>
        <p>
          This Cookie Policy explains how <strong>IQFIT47</strong> uses cookies, local browser storage, and similar technologies to recognize you when you visit our website, remember your preferences, and maintain your active shopping sessions.
        </p>
      </section>

      <div className="border-t border-ink/10 my-6" />

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">1. What are Cookies and Local Storage?</h3>
        <p>
          Cookies are small text files stored on your device by your browser. In addition to cookies, we use <strong>Local Storage</strong> (via HTML5) which allows us to persist data locally in your browser for a faster, more responsive user experience.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">2. How We Use Them</h3>
        <p>
          We employ cookies and local storage for specific functional reasons:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Shopping Cart Persistence:</strong> We use local storage (via Zustand store) to keep track of items in your shopping bag. This ensures your items are saved if you refresh the page or return to the site later.</li>
          <li><strong>Session Integrity:</strong> Temporary session cookies are used to confirm user status when moving from the catalog to checkout pages.</li>
          <li><strong>Preferences:</strong> Saving user choices, such as filters or search queries, so you don't have to re-enter them.</li>
          <li><strong>Analytics:</strong> Aggregated, anonymous data is collected to understand site performance, page speeds, and general traffic patterns. We do not track you across other websites.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">3. Managing Your Preferences</h3>
        <p>
          Most web browsers allow you to control or refuse cookies through their settings. However, please note that disabling cookies or clearing browser local storage will have a direct impact on site functionality:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your shopping cart drawer will not save items between refreshes.</li>
          <li>The checkout process may fail to route correctly.</li>
          <li>Personalized configurations will reset.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-ink">4. Updates to This Policy</h3>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in our operational procedures or legal requirements. We encourage you to check this page periodically for updates.
        </p>
      </section>
    </>
  );
}
