"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const GALLERY_ITEMS = [
  {
    id: "g1",
    label: "Geometric Mandala",
    style: "Geometric",
    accent: "Fine Line",
  },
  {
    id: "g2",
    label: "Neo-Traditional Koi",
    style: "Neo-Traditional",
    accent: "Blackwork",
  },
  {
    id: "g3",
    label: "Fine Line Botanicals",
    style: "Fine Line",
    accent: "Minimalist",
  },
  {
    id: "g4",
    label: "Tribal Arm Piece",
    style: "Blackwork",
    accent: "Sleeve",
  },
  {
    id: "g5",
    label: "Rose & Dagger",
    style: "Neo-Traditional",
    accent: "Traditional",
  },
  {
    id: "g6",
    label: "Portrait Study",
    style: "Realism",
    accent: "Linework",
  },
];

export function InkGallery() {
  return (
    <section className="border-t border-stone-50/10 bg-[#0a0a0c] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-hazard">
              47Studio Portfolio
            </p>
            <h2 className="mt-1 font-display text-4xl uppercase tracking-tight sm:text-5xl">
              The Work
            </h2>
          </div>
          <a
            href="https://www.instagram.com/47.studio._/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-stone-50/40 underline-offset-4 hover:text-stone-50/80 hover:underline transition-colors"
          >
            See more on Instagram →
          </a>
        </div>

        {/* Gallery: real gallery image + style chips */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-50/10">
          <Image
            src="/studio-gallery.jpg"
            alt="47Studio tattoo gallery — geometric, fine line, blackwork, neo-traditional work"
            width={1400}
            height={800}
            className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[480px]"
            priority={false}
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a0c] to-transparent" />

          {/* Style chips floating at bottom */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
            {GALLERY_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="rounded-lg border border-stone-50/10 bg-ink/80 px-3 py-1.5 backdrop-blur-sm"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-stone-50/60">
                  {item.style}
                </p>
                <p className="mt-0.5 font-display text-xs uppercase text-stone-50/90">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Style overview chips */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            "Traditional",
            "Neo-Traditional",
            "Geometric",
            "Fine Line",
            "Blackwork",
            "Realism",
            "Watercolour",
            "Custom",
          ].map((style) => (
            <span
              key={style}
              className="rounded-full border border-stone-50/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-stone-50/50"
            >
              {style}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
