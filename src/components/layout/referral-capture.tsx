"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Captures the ?ref= query parameter from ANY page the user lands on
 * and persists it in localStorage. This way the referral code is available
 * later at checkout even if the user browses around before buying.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.trim().length > 0) {
      localStorage.setItem("iqf_ref", ref.trim().toUpperCase());
    }
  }, [searchParams]);

  return null;
}
