"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudioBookingForm } from "./studio-booking-form";
import { TourDates } from "./tour-dates";
import { Syringe, MapPin } from "lucide-react";

const tabs = [
  {
    id: "studio",
    label: "Studio Sessions",
    icon: Syringe,
    description: "Book a private session at the studio. Choose your style, size, and preferred date.",
  },
  {
    id: "tour",
    label: "Tour Dates",
    icon: MapPin,
    description: "Catch us on the road. Secure a spot at our next pop-up city stop.",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function BookingsTabs() {
  const [active, setActive] = useState<TabId>("studio");

  // Honour hash on load
  useEffect(() => {
    if (window.location.hash === "#tour") setActive("tour");
  }, []);

  return (
    <section id="booking-form" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Tab selector */}
      <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-hazard">
            How do you want to book?
          </p>
          <h2 className="mt-1 font-display text-4xl uppercase tracking-tight sm:text-5xl">
            Choose a format
          </h2>
        </div>

        <div className="flex rounded-xl border border-stone-50/10 bg-stone-50/5 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`relative flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-sm uppercase tracking-wide transition-colors ${
                  isActive
                    ? "text-ink"
                    : "text-stone-50/50 hover:text-stone-50/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-stone-50"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={15} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab description */}
      <AnimatePresence mode="wait">
        {tabs.map(
          (tab) =>
            tab.id === active && (
              <motion.p
                key={tab.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mb-10 max-w-lg text-sm text-stone-50/50"
              >
                {tab.description}
              </motion.p>
            )
        )}
      </AnimatePresence>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {active === "studio" ? (
          <motion.div
            key="studio"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <StudioBookingForm />
          </motion.div>
        ) : (
          <motion.div
            key="tour"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <TourDates />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
