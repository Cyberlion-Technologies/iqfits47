"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ReferralCapture } from "@/components/layout/referral-capture";

const Navbar = dynamic(() => import("@/components/layout/navbar").then((m) => m.Navbar), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const ToasterClient = dynamic(() => import("@/components/layout/toaster-client").then((m) => m.ToasterClient), { ssr: false });
const CompareDrawer = dynamic(() => import("@/components/product/compare-drawer").then((m) => m.CompareDrawer), { ssr: false });

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isStudioPage = pathname === "/bookings" || pathname?.startsWith("/studio");

  React.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
        .catch((err) => console.error("PWA Service Worker registration failed:", err));
    }
  }, []);

  return (
    <>
      {/* Capture ?ref= query param into localStorage on any page */}
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      {!isStudioPage && <Navbar />}
      <main className="min-h-[60vh]">{children}</main>
      {!isStudioPage && <CartDrawer />}
      <ToasterClient />
      {!isStudioPage && <CompareDrawer />}
    </>
  );
}
