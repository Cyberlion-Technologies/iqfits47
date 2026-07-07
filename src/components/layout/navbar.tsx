"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Package, Heart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useFeatures } from "@/lib/store/features";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const router = useRouter();

  const openCart = useCart((s) => s.open);
  const count = useCart((s) => s.count());
  const wishlistCount = useFeatures((s) => s.wishlist.length);

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

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-x-0 inset-y-0 z-30 flex items-center bg-stone-50 px-4 sm:px-6 lg:px-8"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchVal.trim()) {
                    router.push(`/shop?q=${encodeURIComponent(searchVal.trim())}`);
                    setSearchOpen(false);
                    setSearchVal("");
                  }
                }}
                className="flex w-full items-center gap-3"
              >
                <Search size={20} className="text-ink/50" />
                <input
                  type="text"
                  placeholder="Search kicks, apparel, accessories..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="flex-1 bg-transparent py-2 font-mono text-sm tracking-wide focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full p-2 hover:bg-ink/5"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="rounded-full p-2 hover:bg-ink/5 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2.5 font-display text-2xl tracking-tight">
          {/* Jay Fletcher Style Geometric Sneaker Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 24"
            width="32"
            height="24"
            aria-hidden="true"
            className="shrink-0 text-ink"
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
              fill="#ffffff"
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
          IQFITS-<span className="text-hazard">47</span>
        </Link>

        <nav className="hidden items-center gap-8 font-display text-sm uppercase tracking-wide lg:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-hazard">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2 hover:bg-ink/5"
            aria-label="Search products"
          >
            <Search size={20} />
          </button>
          <Link
            href="/track-order"
            className="hidden rounded-full p-2 hover:bg-ink/5 sm:block"
            aria-label="Track order"
          >
            <Package size={20} />
          </Link>
          <Link
            href="/wishlist"
            className="relative rounded-full p-2 hover:bg-ink/5"
            aria-label="Wishlist"
          >
            <Heart size={20} className={cn(wishlistCount > 0 && "fill-hazard text-hazard")} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-hazard text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
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
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="mt-6 flex items-center gap-2 font-mono text-sm uppercase tracking-wide text-ink/60"
                >
                  <Heart size={16} /> Wishlist
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setMenuOpen(false)}
                  className="mt-3 flex items-center gap-2 font-mono text-sm uppercase tracking-wide text-ink/60"
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
