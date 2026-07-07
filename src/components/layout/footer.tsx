"use client";

import Link from "next/link";
import { MapPin, Package, Gift, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-display text-3xl tracking-tight">
              {/* Jay Fletcher Style Geometric Sneaker Logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 24"
                width="38"
                height="28"
                aria-hidden="true"
                className="shrink-0 text-stone-50"
              >
                {/* Sawtooth Outsole */}
                <path
                  d="M 2 21 L 4 23 L 6 21 L 8 23 L 10 21 L 12 23 L 14 21 L 16 23 L 18 21 L 20 23 L 22 21 L 24 23 L 26 21 L 28 23 L 30 21"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Midsole */}
                <path
                  d="M 2 18.5 L 30 18.5 C 30.5 18.5, 30.5 21, 29.5 21 L 2.5 21 C 1.5 21, 1.5 18.5, 2 18.5 Z"
                  fill="#15151A"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                {/* Midsole Accent Stripe (Orange) */}
                <path
                  d="M 12 20 L 28 20"
                  stroke="#FF5A1F"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Upper Body (Base layer) */}
                <path
                  d="M 2.5 18.5 C 2.5 15.5, 4 14.5, 5.5 14.5 L 13 11 L 16.5 6 C 17.5 4.5, 19 4.5, 20 6 L 21.5 8.5 C 22.5 7.5, 24 7.5, 25 8.5 L 26.5 10 C 28 11, 28.5 12.5, 28.5 14.5 L 28.5 18.5 Z"
                  fill="currentColor"
                />
                {/* Classic Swoosh */}
                <path
                  d="M 8.5 16 C 13 13, 21 13, 27 10 C 27 10, 27.5 11, 26.5 12.5 C 21.5 15, 14 17.5, 9.5 17.5 Z"
                  fill="#FF5A1F"
                />
                {/* Heel Tab (Orange) */}
                <path
                  d="M 25 8.5 C 26 7.5, 27 8.5, 27 9.5 L 25.5 10.5 Z"
                  fill="#FF5A1F"
                />
                {/* Laces */}
                <line x1="12" y1="12" x2="15" y2="10" stroke="#D4FF3D" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="14" y1="10.2" x2="17" y2="8.2" stroke="#D4FF3D" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>IQFITS-<span className="text-hazard">47</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-stone-50/60">
              Authentic kicks, designer apparel and accessories, sourced for
              Nairobi and shipped anywhere in Kenya. Every drop is numbered,
              every order is trackable.
            </p>
            <a
              href="https://www.instagram.com/iqfits.47._/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-50/20 px-4 py-2 text-sm font-medium transition-colors hover:border-hazard hover:text-hazard"
            >
              <InstagramIcon size={16} />
              @iqfits.47._
            </a>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-stone-50/50">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-50/80">
              <li><Link href="/shop?category=sneakers" className="hover:text-hazard">Kicks</Link></li>
              <li><Link href="/shop?category=apparel" className="hover:text-hazard">Apparel</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-hazard">Accessories</Link></li>
              <li><Link href="/shop" className="hover:text-hazard">New Drops</Link></li>
              <li>
                <Link href="/referral" className="flex items-center gap-2 hover:text-hazard">
                  <Gift size={14} />
                  Refer &amp; Earn
                  <span className="ml-0.5 inline-block rounded-full bg-hazard px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest text-white leading-none">
                    NEW
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-stone-50/50">
              Support
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-50/80">
              <li>
                <Link href="/track-order" className="flex items-center gap-2 hover:text-hazard">
                  <Package size={14} /> Track your order
                </Link>
              </li>
              <li className="flex items-center gap-2 text-stone-50/60">
                <MapPin size={14} /> Nairobi, Kenya
              </li>
              <li>
                <a
                  href="mailto:support@iqfits47.store"
                  className="flex items-center gap-2 hover:text-hazard"
                >
                  <Mail size={14} /> support@iqfits47.store
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/254716672878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-hazard"
                >
                  <span className="font-mono text-xs text-stone-50/50">Phone/WA:</span> +254 716 672 878
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/HKekz4fQhR8AQudjaP4qeH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-hazard text-stone-50/90"
                >
                  Join WhatsApp Community
                </a>
              </li>
              <li className="pt-1 font-mono text-xs text-stone-50/50">
                Payments secured via M-Pesa STK Push
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-50/10 pt-6 text-xs text-stone-50/40 sm:flex-row">
          <span>© {new Date().getFullYear()} IQFITS-47. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/policies/returns" className="hover:text-stone-50 transition-colors">Returns</Link>
            <Link href="/policies/privacy" className="hover:text-stone-50 transition-colors">Privacy</Link>
            <Link href="/policies/terms" className="hover:text-stone-50 transition-colors">Terms</Link>
            <Link href="/policies/cookies" className="hover:text-stone-50 transition-colors">Cookies</Link>
          </div>
          <span className="font-mono">DROP 015 — RESTOCK FRIDAY</span>
        </div>
      </div>
    </footer>
  );
}
