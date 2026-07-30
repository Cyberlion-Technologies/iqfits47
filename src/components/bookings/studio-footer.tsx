"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone, Syringe } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";

export function StudioFooter() {
  return (
    <footer className="border-t border-stone-50/10 bg-[#070709] text-stone-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/studio-logo.jpg"
                alt="47Cultures & Ink"
                width={48}
                height={48}
                className="rounded-full ring-2 ring-hazard/40"
              />
              <div>
                <h3 className="font-display text-2xl uppercase tracking-tight text-stone-50">
                  47<span className="text-hazard">STUDIO</span>
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-stone-50/50">
                  47Cultures &amp; Ink
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm text-stone-50/60 leading-relaxed font-body">
              Every tattoo tells a story. 47Studio is a premium tattoo studio specializing in Fine Line, Geometric, Blackwork, Neo-Traditional and custom body art in Nairobi, Kenya.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs text-stone-50/50">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-hazard" /> Nairobi, Kenya
              </span>
              <a
                href="https://www.instagram.com/47.studio._/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-hazard transition-colors"
              >
                <InstagramIcon size={14} /> @47.studio._
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-stone-50/50 mb-4">
              Bookings
            </h4>
            <ul className="space-y-2.5 font-mono text-xs uppercase text-stone-50/70">
              <li>
                <a href="#booking-form" className="hover:text-hazard transition-colors flex items-center gap-2">
                  <Syringe size={12} /> Studio Sessions
                </a>
              </li>
              <li>
                <a href="#tour" className="hover:text-hazard transition-colors flex items-center gap-2">
                  <MapPin size={12} /> Kenya Tour Dates
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-hazard transition-colors flex items-center gap-2">
                  <span>✦</span> Portfolio &amp; Styles
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/47.studio._/" target="_blank" rel="noopener noreferrer" className="hover:text-hazard transition-colors flex items-center gap-2">
                  <InstagramIcon size={12} /> DM on Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Studio Policy */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-stone-50/50 mb-4">
              Studio Policy
            </h4>
            <ul className="space-y-2 font-mono text-xs text-stone-50/60">
              <li>• Must be 18+ with valid ID</li>
              <li>• Consultations required for large pieces</li>
              <li>• Strict hygiene &amp; single-use needles</li>
              <li>• Deposit required to confirm date</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-50/10 pt-8 text-center text-xs font-mono text-stone-50/40 sm:flex-row sm:text-left">
          <p>© 2026 47Studio (47Cultures &amp; Ink). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/47.studio._/" target="_blank" rel="noopener noreferrer" className="hover:text-stone-50 transition-colors">
              Instagram
            </a>
            <Link href="/" className="hover:text-stone-50 transition-colors">
              IQFITS-47 Store
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
