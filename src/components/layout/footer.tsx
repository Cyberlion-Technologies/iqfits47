"use client";

import Link from "next/link";
import { MapPin, Package, Gift, Mail, Syringe } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { DeveloperCTA } from "./developer-cta";
import { PWAInstall } from "./pwa-install";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex flex-col items-start gap-1 group">
              <div className="flex items-center gap-2">
                {/* Double hazard orange diagonal slashes prefix */}
                <div className="flex gap-1.5 -skew-x-12 shrink-0">
                  <div className="h-6 w-1.5 bg-hazard transition-all duration-300 group-hover:scale-y-110" />
                  <div className="h-6 w-1.5 bg-hazard transition-all duration-300 group-hover:scale-y-110" />
                </div>
                <div className="font-display text-[38px] uppercase tracking-tighter text-stone-50 leading-none">
                  IQFITS-<span className="text-hazard">47</span>
                </div>
              </div>
              <span className="font-body text-[10px] tracking-[0.18em] uppercase text-stone-50/85 mt-0.5 font-bold">
                KICKS • STREETWEAR • DESIGNER FITS
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-stone-50/60">
              Authentic kicks, designer apparel and accessories, sourced for
              Nairobi and shipped anywhere in Kenya. Every drop is numbered,
              every order is trackable.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <a
                href="https://www.instagram.com/47.iqfits._/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-50/20 px-4 text-sm font-medium transition-all hover:border-hazard hover:text-hazard h-10 w-full max-w-[220px] shrink-0"
              >
                <InstagramIcon size={16} />
                @47.iqfits._
              </a>
              <PWAInstall />
            </div>
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
              <li className="pt-2">
                <a
                  href="https://chat.whatsapp.com/HKekz4fQhR8AQudjaP4qeH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-white hover:bg-[#20ba5a] transition-all duration-300 w-full max-w-[220px] h-10 shrink-0 font-display text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.86.002-2.636-1.023-5.113-2.884-6.978C16.577 1.896 14.1 .874 11.457.874 6.023.874 1.6 5.294 1.596 10.73c-.001 1.673.443 3.305 1.288 4.715l.185.311-.99 3.616 3.7-.971.302.179zM17.07 14.39c-.274-.138-1.62-.8-1.87-.89-.254-.09-.44-.136-.62.14-.18.275-.7 1.1-.86 1.284-.16.183-.32.206-.59.07-.27-.138-1.15-.425-2.19-1.355-.81-.723-1.36-1.618-1.52-1.892-.16-.275-.016-.424.12-.56.12-.124.272-.32.408-.48.136-.16.18-.275.27-.457.09-.183.047-.344-.023-.482-.07-.138-.62-1.49-.85-2.04-.223-.538-.485-.465-.66-.465-.173 0-.374-.02-.576-.02-.2-.003-.527.076-.8.375-.274.298-1.047 1.025-1.047 2.5 0 1.474 1.073 2.897 1.22 3.103.15.206 2.11 3.22 5.11 4.516.714.308 1.272.493 1.707.63.717.228 1.368.196 1.883.118.574-.087 1.745-.713 1.992-1.402.247-.69.247-1.283.173-1.402-.073-.12-.272-.206-.547-.344z" />
                  </svg>
                  <span>Join WhatsApp Community</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-stone-50/50">
              47Studio
            </h3>
            <p className="mt-2 text-xs text-stone-50/40 max-w-[160px]">
              47cultures &amp; Ink — Tattoo bookings &amp; Kenya tour
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-50/80">
              <li>
                <Link href="/bookings" className="flex items-center gap-2 hover:text-hazard">
                  <Syringe size={14} /> Book a session
                </Link>
              </li>
              <li>
                <Link href="/bookings#tour" className="flex items-center gap-2 hover:text-hazard">
                  <MapPin size={14} /> Tour dates
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/47.studio._/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-hazard"
                >
                  <InstagramIcon size={14} /> @47.studio._
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-50/10 pt-6 text-xs text-stone-50/40 sm:flex-row">
          <span>© {new Date().getFullYear()} IQFITS-47. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/partner" className="hover:text-stone-50 transition-colors">Partner with us</Link>
            <Link href="/policies/returns" className="hover:text-stone-50 transition-colors">Returns</Link>
            <Link href="/policies/privacy" className="hover:text-stone-50 transition-colors">Privacy</Link>
            <Link href="/policies/terms" className="hover:text-stone-50 transition-colors">Terms</Link>
            <Link href="/policies/cookies" className="hover:text-stone-50 transition-colors">Cookies</Link>
          </div>
          <DeveloperCTA />
        </div>
      </div>
    </footer>
  );
}
