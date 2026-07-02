"use client";

import { ShieldCheck, Smartphone, Truck, PackageSearch } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "100% Authentic", body: "Every pair checked before it ships." },
  { icon: Smartphone, title: "Pay with M-Pesa", body: "Secure STK push at checkout." },
  { icon: Truck, title: "Nationwide delivery", body: "From Nairobi to anywhere in Kenya." },
  { icon: PackageSearch, title: "Track your order", body: "Real-time status, no login needed." },
];

export function TrustStrip() {
  return (
    <section className="border-y border-ink/10 bg-stone-100">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <Icon size={22} className="shrink-0 text-hazard" />
            <div>
              <p className="font-display text-sm uppercase tracking-wide">{title}</p>
              <p className="text-xs text-ink/50">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
