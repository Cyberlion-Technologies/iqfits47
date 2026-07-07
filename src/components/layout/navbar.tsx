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

        <Link href="/" className="flex items-center gap-3 group">
          {/* Double hazard orange diagonal slashes prefix */}
          <div className="flex gap-1 -skew-x-12 shrink-0">
            <div className="h-6 w-1 bg-hazard transition-all duration-300 group-hover:scale-y-110" />
            <div className="h-6 w-1 bg-hazard transition-all duration-300 group-hover:scale-y-110" />
          </div>
          
          <div className="flex flex-col justify-center leading-none">
            <div className="font-display text-3xl uppercase tracking-tighter text-ink">
              IQFITS-<span className="text-hazard">47</span>
            </div>
            <span className="font-body text-[8px] tracking-[0.18em] uppercase text-ink/50 mt-1 font-semibold">
              KICKS • STREETWEAR • DESIGNER FITS
            </span>
          </div>
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
