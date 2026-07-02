"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ToasterClient() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#1c1917",
          color: "#fafaf9",
          border: "1px solid rgba(28, 25, 23, 0.1)",
        },
      }}
    />
  );
}
