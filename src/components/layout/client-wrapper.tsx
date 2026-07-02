"use client";

import React from "react";
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/layout/navbar").then((m) => m.Navbar), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const ToasterClient = dynamic(() => import("@/components/layout/toaster-client").then((m) => m.ToasterClient), { ssr: false });

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <CartDrawer />
      <ToasterClient />
    </>
  );
}
