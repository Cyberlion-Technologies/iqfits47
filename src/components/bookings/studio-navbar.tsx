"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Syringe, Menu, X, Instagram } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";

export function StudioNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-stone-50/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/bookings" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-hazard/20 blur-sm group-hover:bg-hazard/40 transition-all" />
            <Image
              src="/studio-logo.jpg"
              alt="47Cultures & Ink"
              width={42}
              height={42}
              className="relative z-10 rounded-full object-cover ring-1 ring-hazard/40 group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="font-display text-lg uppercase tracking-tight text-stone-50 flex items-center gap-1.5">
              47<span className="text-hazard">STUDIO</span>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/40">
              47Cultures &amp; Ink • Nairobi
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest md:flex">
          <a
            href="#booking-form"
            className="text-stone-50/70 hover:text-hazard transition-colors"
          >
            Studio Sessions
          </a>
          <a
            href="#tour"
            className="text-stone-50/70 hover:text-hazard transition-colors"
          >
            Kenya Tour
          </a>
          <a
            href="#portfolio"
            className="text-stone-50/70 hover:text-hazard transition-colors"
          >
            The Work
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="https://www.instagram.com/47.studio._/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-stone-50/15 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-stone-50/70 hover:border-hazard hover:text-hazard transition-all"
          >
            <InstagramIcon size={14} />
            <span className="text-[11px]">@47.studio._</span>
          </a>

          <a
            href="#booking-form"
            className="flex items-center gap-2 rounded-full bg-hazard px-5 py-2 font-display text-xs uppercase tracking-wide text-white shadow-lg shadow-hazard/20 hover:bg-hazard/90 hover:scale-105 transition-all"
          >
            <Syringe size={14} />
            Book Tattoo
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-stone-50/70 hover:bg-stone-50/10 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-stone-50/10 bg-[#0a0a0c] px-6 py-6 md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-4 font-mono text-sm uppercase tracking-widest">
              <a
                href="#booking-form"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-50/80 hover:text-hazard py-1"
              >
                Studio Sessions
              </a>
              <a
                href="#tour"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-50/80 hover:text-hazard py-1"
              >
                Kenya Tour
              </a>
              <a
                href="#portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-50/80 hover:text-hazard py-1"
              >
                The Work
              </a>
              <div className="pt-4 border-t border-stone-50/10 flex flex-col gap-3">
                <a
                  href="https://www.instagram.com/47.studio._/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-stone-50/20 py-2.5 font-mono text-xs uppercase tracking-wider text-stone-50/80"
                >
                  <InstagramIcon size={16} />
                  @47.studio._
                </a>
                <a
                  href="#booking-form"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-hazard py-3 font-display text-sm uppercase tracking-wide text-white"
                >
                  <Syringe size={16} />
                  Book Tattoo Session
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
