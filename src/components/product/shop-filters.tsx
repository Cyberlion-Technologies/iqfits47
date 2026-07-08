"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data/products";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "New Drops First" },
];

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const activeCategory = searchParams.get("category") ?? "all";
  const activeSort = searchParams.get("sort") ?? "featured";
  const qParam = searchParams.get("q") ?? "";

  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "featured" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", searchInput);
  }

  const pills = (
    <>
      <button
        onClick={() => updateParam("category", "all")}
        className={cn(
          "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors",
          activeCategory === "all"
            ? "border-ink bg-ink text-stone-50"
            : "border-ink/15 text-ink/60 hover:border-ink/40"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => updateParam("category", cat.id)}
          className={cn(
            "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors",
            activeCategory === cat.id
              ? "border-ink bg-ink text-stone-50"
              : "border-ink/15 text-ink/60 hover:border-ink/40"
          )}
        >
          {cat.label}
        </button>
      ))}
    </>
  );

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="hidden flex-wrap gap-2 sm:flex">{pills}</div>

      <button
        className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-2 font-mono text-xs uppercase tracking-wide sm:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <SlidersHorizontal size={14} /> Filter
      </button>

      <select
        value={activeSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-full border border-ink/15 bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-wide w-full sm:hidden"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="col-span-2 sm:col-span-1 flex w-full items-center gap-2 sm:w-auto">
        <form onSubmit={handleSearchSubmit} className="relative flex flex-1 items-center max-w-none sm:max-w-xs">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-full border border-ink/15 bg-transparent pl-4 pr-10 py-1.5 font-mono text-xs tracking-wide focus:border-ink/40 focus:outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParam("q", "");
              }}
              className="absolute right-7 text-ink/40 hover:text-ink"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
          <button type="submit" className="absolute right-3 text-ink/40 hover:text-ink" aria-label="Submit search">
            <Search size={12} />
          </button>
        </form>

        <select
          value={activeSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="hidden sm:block rounded-full border border-ink/15 bg-transparent px-4 py-1.5 font-mono text-xs uppercase tracking-wide shrink-0"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/40 sm:hidden">
          <div className="w-full rounded-t-3xl bg-stone-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg uppercase">Filter</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">{pills}</div>
          </div>
        </div>
      )}
    </div>
  );
}
