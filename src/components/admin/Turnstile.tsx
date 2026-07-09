"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function Turnstile({ siteKey, onSuccess, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const renderWidget = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).turnstile &&
        containerRef.current &&
        !widgetIdRef.current
      ) {
        try {
          widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onSuccess,
            "error-callback": onError,
            "expired-callback": onExpire,
          });
        } catch (e) {
          console.error("Turnstile render error:", e);
        }
      }
    };

    // If script is already loaded and window.turnstile is defined
    if (typeof window !== "undefined" && (window as any).turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && typeof window !== "undefined" && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          console.error("Turnstile cleanup error:", e);
        }
      }
    };
  }, [siteKey, onSuccess, onError, onExpire]);

  return (
    <div className="flex justify-center my-4">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        async
        defer
        onLoad={() => {
          if (
            typeof window !== "undefined" &&
            (window as any).turnstile &&
            containerRef.current &&
            !widgetIdRef.current
          ) {
            try {
              widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: onSuccess,
                "error-callback": onError,
                "expired-callback": onExpire,
              });
            } catch (e) {
              console.error("Turnstile render error on load:", e);
            }
          }
        }}
      />
      <div ref={containerRef} />
    </div>
  );
}
