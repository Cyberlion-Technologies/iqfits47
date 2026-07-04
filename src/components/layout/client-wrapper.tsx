"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { ReferralCapture } from "@/components/layout/referral-capture";

const Navbar = dynamic(() => import("@/components/layout/navbar").then((m) => m.Navbar), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const ToasterClient = dynamic(() => import("@/components/layout/toaster-client").then((m) => m.ToasterClient), { ssr: false });

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Capture ?ref= query param into localStorage on any page */}
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <CartDrawer />
      <ToasterClient />
    </>
  );
}
