"use client";

import { useState, useEffect } from "react";
import { StudioNavbar } from "@/components/bookings/studio-navbar";
import { BookingsHero } from "@/components/bookings/bookings-hero";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";
import { InkGallery } from "@/components/bookings/ink-gallery";
import { StudioCta } from "@/components/bookings/studio-cta";
import { StudioFooter } from "@/components/bookings/studio-footer";
import { MobileFloatingCta } from "@/components/bookings/mobile-floating-cta";

export default function BookingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("47studio_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("47studio_theme", next);
  }

  return (
    <div className={theme === "light" ? "light" : "dark"}>
      <div className="bg-[#0a0a0c] light:bg-[#f7f7f9] text-stone-50 light:text-stone-900 min-h-screen selection:bg-hazard selection:text-white pb-20 md:pb-0 transition-colors duration-300">
        <StudioNavbar theme={theme} onToggleTheme={toggleTheme} />
        <main>
          <BookingsHero />
          <BookingsTabs />
          <section id="portfolio">
            <InkGallery />
          </section>
          <StudioCta />
        </main>
        <StudioFooter />
        <MobileFloatingCta />
      </div>
    </div>
  );
}
