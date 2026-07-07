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
              {/* Redesigned Premium Sneaker Logo Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 24"
                width="38"
                height="28"
                aria-hidden="true"
                className="shrink-0 text-stone-50"
              >
                {/* Upper body */}
                <path
                  d="M 2 17 C 2 14.5, 3.5 13.5, 5 13.5 L 13 10.5 L 16.5 5.5 C 17.5 4, 19.5 4, 20.5 5.5 L 21.5 8 C 22.5 7, 24 7, 25.5 8 L 27 9.5 C 28.5 10.5, 29 12, 29 14 L 29 17 Z"
                  fill="currentColor"
                />
                {/* Chunky Sole */}
                <path
                  d="M 1.5 17.5 L 29.5 17.5 C 30.5 17.5, 30.5 19, 29.5 19.5 L 28.5 21.5 C 27.5 22.5, 26 22.5, 25 22.5 L 6 22.5 C 4.5 22.5, 3 21.5, 2 19.5 Z"
                  fill="#15151A"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                {/* Swoosh/Stripe Accent */}
                <path
                  d="M 11 14 Q 18.5 11.5, 25.5 13"
                  stroke="#FF5A1F"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sole stripe */}
                <line
                  x1="5.5"
                  y1="19.5"
                  x2="25.5"
                  y2="19.5"
                  stroke="#FF5A1F"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Lacing dots */}
                <circle cx="14.5" cy="9.5" r="0.8" fill="#D4FF3D" />
                <circle cx="17" cy="11" r="0.8" fill="#D4FF3D" />
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
