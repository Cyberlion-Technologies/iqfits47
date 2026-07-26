"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { Syringe } from "lucide-react";

export function BookingsHero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0c] border-b border-stone-50/10">
      {/* Grain overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-60" />

      {/* Diagonal slash decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-full w-2 -skew-x-12 bg-hazard/20" />
        <div className="absolute -left-10 top-0 h-full w-1 -skew-x-12 bg-hazard/10" />
        <div className="absolute -right-16 top-0 h-full w-2 -skew-x-12 bg-hazard/20" />
        <div className="absolute -right-10 top-0 h-full w-1 -skew-x-12 bg-hazard/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-xl flex-1">
            {/* Studio badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-hazard/30 bg-hazard/10 px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-hazard" />
              <span className="font-mono text-xs uppercase tracking-widest text-hazard">
                47cultures &amp; Ink — Now Booking
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[15vw] leading-[0.85] tracking-tight sm:text-7xl lg:text-8xl"
            >
              YOUR INK.
              <br />
              YOUR{" "}
              <span className="text-hazard">STORY.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-lg text-base text-stone-50/60 sm:text-lg"
            >
              Book a studio session or lock in your spot on the 47Studio Kenya
              tour. Every tattoo is a collaboration — come with your vision, leave
              with a piece that's yours for life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#booking-form"
                className="group inline-flex items-center gap-2 rounded-full bg-hazard px-7 py-3.5 font-display text-sm uppercase tracking-wide text-white transition-transform hover:scale-105"
              >
                <Syringe size={16} />
                Book a session
              </a>
              <a
                href="https://www.instagram.com/47.studio._/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wide text-stone-50/60 underline-offset-4 hover:text-stone-50 hover:underline"
              >
                <InstagramIcon size={14} />
                @47.studio._
              </a>
            </motion.div>
          </div>

          {/* Logo column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex shrink-0 items-center justify-center lg:justify-end"
          >
            {/* Glow ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-hazard/20 blur-3xl scale-110" />
              <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl scale-125 animate-pulse" />
              <Image
                src="/studio-logo.jpg"
                alt="47cultures & Ink — Tattoo • Piercing • Body Art, Nairobi Kenya"
                width={380}
                height={380}
                className="relative z-10 rounded-full w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[360px] lg:h-[360px] object-cover ring-2 ring-hazard/30"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
