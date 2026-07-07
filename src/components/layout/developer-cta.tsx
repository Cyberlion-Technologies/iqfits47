"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageSquare, X, ExternalLink } from "lucide-react";

const Github = ({ size = 20, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export function DeveloperCTA() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-hazard bg-ink px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-hazard transition-all duration-300 hover:bg-hazard hover:text-stone-50 hover:shadow-[0_0_20px_rgba(255,90,31,0.45)]"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hazard opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-hazard"></span>
        </span>
        <span>TALK TO THE DEVELOPER</span>
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          ↗
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-50/10 bg-ink-800 p-6 bg-grain shadow-2xl"
              >
                {/* Diagonal stripes top-right corner background */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rotate-45 bg-gradient-to-b from-hazard/10 to-transparent pointer-events-none" />

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 rounded-full p-2 text-stone-50/40 hover:bg-stone-50/5 hover:text-stone-50 transition-colors"
                  aria-label="Close contact card"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 -skew-x-12 shrink-0">
                    <div className="h-6 w-1.5 bg-hazard" />
                    <div className="h-6 w-1.5 bg-hazard" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-hazard font-bold">
                      DEVELOPER SPOTLIGHT
                    </span>
                    <h3 className="font-display text-2xl uppercase tracking-tight text-stone-50 mt-0.5">
                      Sir. Brian &amp; Co.
                    </h3>
                  </div>
                </div>

                {/* Tag & Tech details */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-md border border-stone-50/10 bg-stone-50/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stone-50/60">
                    Next.js + TypeScript
                  </span>
                  <span className="rounded-md border border-stone-50/10 bg-stone-50/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stone-50/60">
                    Tailwind + Framer Motion
                  </span>
                  <span className="rounded-md border border-stone-50/10 bg-stone-50/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stone-50/60">
                    Supabase + M-Pesa Integration
                  </span>
                </div>

                <div className="my-5 h-[1px] bg-gradient-to-r from-stone-50/10 via-stone-50/5 to-transparent" />

                {/* Body message */}
                <p className="font-body text-sm leading-relaxed text-stone-50/70">
                  Engineered the complete shopping experience, custom cart systems, and live M-Pesa STK push checkouts. 
                  Ready to craft your next high-converting digital storefront or bespoke SaaS product.
                </p>

                {/* Contact CTA List */}
                <div className="mt-6 space-y-2.5">
                  {/* WhatsApp */}
                  <motion.a
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://wa.me/254716672878?text=Hi%20Brian%2C%20I%20visited%20IQFITS-47%20and%20would%20love%20to%20discuss%20a%20project%21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-stone-50/5 bg-ink/45 p-4 transition-all hover:border-hazard/50 hover:bg-ink/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                        <MessageSquare size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-display text-xs uppercase tracking-wider text-stone-50">
                          Chat on WhatsApp
                        </h4>
                        <p className="font-mono text-[10px] text-stone-50/45 mt-0.5">
                          +254 716 672 878 (Fast response)
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-stone-50/30" />
                  </motion.a>

                  {/* Email */}
                  <motion.a
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href="mailto:cyberlion254@gmail.com?subject=Project%20Inquiry%20from%20IQFITS-47%20Visitor"
                    className="flex items-center justify-between rounded-2xl border border-stone-50/5 bg-ink/45 p-4 transition-all hover:border-hazard/50 hover:bg-ink/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-hazard/10 p-2 text-hazard">
                        <Mail size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-display text-xs uppercase tracking-wider text-stone-50">
                          Send Email Inquiry
                        </h4>
                        <p className="font-mono text-[10px] text-stone-50/45 mt-0.5">
                          cyberlion254@gmail.com
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-stone-50/30" />
                  </motion.a>

                  {/* GitHub */}
                  <motion.a
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://github.com/brianmurutu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-stone-50/5 bg-ink/45 p-4 transition-all hover:border-hazard/50 hover:bg-ink/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-stone-50/10 p-2 text-stone-50/80">
                        <Github size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-display text-xs uppercase tracking-wider text-stone-50">
                          Explore GitHub Profile
                        </h4>
                        <p className="font-mono text-[10px] text-stone-50/45 mt-0.5">
                          github.com/brianmurutu
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-stone-50/30" />
                  </motion.a>
                </div>

                {/* Barcode details (Streetwear Tag styling) */}
                <div className="mt-6 flex items-center justify-between gap-1 opacity-20 font-mono text-[8px] tracking-widest text-stone-50/50 select-none">
                  <div className="flex items-stretch h-5 gap-[1px]">
                    <div className="w-[1px] bg-stone-50" />
                    <div className="w-[3px] bg-stone-50" />
                    <div className="w-[1px] bg-stone-50" />
                    <div className="w-[1px] bg-stone-50" />
                    <div className="w-[2px] bg-stone-50" />
                    <div className="w-[4px] bg-stone-50" />
                    <div className="w-[1px] bg-stone-50" />
                  </div>
                  <span>SIR. BRIAN &amp; CO. // DEV</span>
                  <div className="flex items-stretch h-5 gap-[1px]">
                    <div className="w-[2px] bg-stone-50" />
                    <div className="w-[1px] bg-stone-50" />
                    <div className="w-[4px] bg-stone-50" />
                    <div className="w-[1px] bg-stone-50" />
                    <div className="w-[1px] bg-stone-50" />
                    <div className="w-[3px] bg-stone-50" />
                  </div>
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
