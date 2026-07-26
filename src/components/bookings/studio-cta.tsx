"use client";

import { InstagramIcon } from "@/components/ui/instagram-icon";
import { motion } from "framer-motion";

export function StudioCta() {
  return (
    <section className="border-t border-stone-50/10 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-hazard/20 bg-hazard/5 px-6 py-16 text-center sm:px-12"
        >
          {/* Big 47 watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none font-display text-[25vw] leading-none text-stone-50/[0.025]">
            47
          </div>

          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-widest text-hazard">
              47cultures &amp; Ink
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
              Questions?
              <br />
              We're on Instagram.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-stone-50/50">
              Slide into our DMs to ask about your design, check artist availability, or
              anything else. For order support, use the main IQFITS-47 support channel.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://www.instagram.com/47.studio._/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-hazard px-7 py-3.5 font-display text-sm uppercase tracking-wide text-white transition-transform hover:scale-105"
              >
                <InstagramIcon size={16} />
                @47.studio._
              </a>
              <a
                href="#booking-form"
                className="font-mono text-sm uppercase tracking-wide text-stone-50/60 underline-offset-4 hover:text-stone-50 hover:underline transition-colors"
              >
                Back to booking form ↑
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
