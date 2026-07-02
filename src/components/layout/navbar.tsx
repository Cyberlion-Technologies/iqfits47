"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Package } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

const links = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=sneakers", label: "Kicks" },
  { href: "/shop?category=apparel", label: "Apparel" },
  { href: "/shop?category=accessories", label: "Accessories" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openCart = useCart((s) => s.open);
  const count = useCart((s) => s.count());

  const [announcements, setAnnouncements] = useState<string[]>([
    "FREE DELIVERY IN NAIROBI & KIAMBU ON ORDERS OVER KES 15,000",
    "PAY SECURELY WITH M-PESA",
    "NEW DROPS EVERY FRIDAY",
  ]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("message")
          .eq("active", true)
          .order("priority", { ascending: false });

        if (data && data.length > 0) {
          setAnnouncements(data.map((a: any) => a.message));
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadAnnouncements();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-stone-50/90 backdrop-blur">
      {/* running ticker */}
      <div className="overflow-hidden border-b border-ink/10 bg-ink text-stone-50">
        <div className="flex animate-marquee whitespace-nowrap py-1.5 text-[11px] font-medium tracking-wide">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-8 px-4">
              {announcements.map((ann, idx) => (
                <span key={`${idx}-${ann}`} className="flex items-center gap-8">
                  <span>{ann}</span>
                  <span className="text-hazard">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          className="rounded-full p-2 hover:bg-ink/5 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-baseline gap-1 font-display text-2xl tracking-tight">
          IQFIT<span className="text-hazard">47</span>
        </Link>

        <nav className="hidden items-center gap-8 font-display text-sm uppercase tracking-wide lg:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-hazard">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/shop"
            className="hidden rounded-full p-2 hover:bg-ink/5 sm:block"
            aria-label="Search products"
          >
            <Search size={20} />
          </Link>
          <Link
            href="/track-order"
            className="hidden rounded-full p-2 hover:bg-ink/5 sm:block"
            aria-label="Track order"
          >
            <Package size={20} />
          </Link>
          <button
            onClick={openCart}
            className="relative rounded-full p-2 hover:bg-ink/5"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-hazard text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-[82%] max-w-xs bg-stone-50 p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl">MENU</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>
              <nav className="mt-10 flex flex-col gap-1">
                {links.map((l, i) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "border-b border-ink/10 py-4 font-display text-2xl uppercase tracking-tight"
                    )}
                  >
                    <span className="mr-3 font-mono text-xs text-ink/40">0{i + 1}</span>
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/track-order"
                  onClick={() => setMenuOpen(false)}
                  className="mt-6 flex items-center gap-2 font-mono text-sm uppercase tracking-wide text-ink/60"
                >
                  <Package size={16} /> Track an order
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
