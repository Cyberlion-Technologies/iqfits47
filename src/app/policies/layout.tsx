"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const policyLinks = [
  { href: "/policies/returns", label: "Returns & Exchanges" },
  { href: "/policies/privacy", label: "Privacy Policy" },
  { href: "/policies/terms", label: "Terms of Service" },
  { href: "/policies/cookies", label: "Cookie Policy" },
];

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-ink/15 pb-8 mb-10">
        <p className="font-mono text-xs uppercase tracking-wide text-hazard">Legal & Operations</p>
        <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl mt-2">
          Store Policies
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3">
          <nav className="flex flex-row overflow-x-auto gap-2 pb-4 lg:pb-0 lg:flex-col lg:overflow-x-visible border-b border-ink/10 lg:border-none">
            {policyLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all text-center lg:text-left",
                    isActive
                      ? "bg-ink text-stone-50"
                      : "bg-stone-100 hover:bg-stone-200 text-ink/75"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 bg-stone-100/50 rounded-3xl p-6 sm:p-10 border border-ink/5">
          <article className="prose max-w-none text-ink/80 text-sm sm:text-base leading-relaxed space-y-6">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
