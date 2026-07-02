"use client";

import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-display text-3xl tracking-tight">
              IQFIT<span className="text-hazard">47</span>
            </span>
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
          <span>© {new Date().getFullYear()} IQFIT47. All rights reserved.</span>
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
