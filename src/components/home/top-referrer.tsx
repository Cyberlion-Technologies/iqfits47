"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Crown, Flame, Medal, Star, Zap, ArrowRight, Users } from "lucide-react";

interface LeaderboardEntry {
  position: number;
  referral_code: string;
  display_name: string;
  referral_count: number;
  rank: string;
  total_credit_kes: number;
}

const RANK_STYLES: Record<string, { icon: React.ReactNode; gradient: string; glow: string; label: string }> = {
  none:     { icon: <Star size={18} />,   gradient: "from-stone-400 to-stone-500",   glow: "shadow-stone-400/30",  label: "Starter" },
  bronze:   { icon: <Medal size={18} />,  gradient: "from-amber-600 to-amber-800",   glow: "shadow-amber-600/40",  label: "Bronze" },
  silver:   { icon: <Star size={18} />,   gradient: "from-slate-400 to-slate-600",   glow: "shadow-slate-400/40",  label: "Silver" },
  gold:     { icon: <Crown size={18} />,  gradient: "from-yellow-400 to-yellow-600", glow: "shadow-yellow-400/40", label: "Gold" },
  platinum: { icon: <Zap size={18} />,    gradient: "from-cyan-400 to-cyan-600",     glow: "shadow-cyan-400/40",   label: "Platinum" },
  legend:   { icon: <Flame size={18} />,  gradient: "from-[#d4ff3d] to-[#a0c800]",  glow: "shadow-[#d4ff3d]/40",  label: "Legend" },
};

export function TopReferrer() {
  const [top, setTop] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/affiliate/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        const list: LeaderboardEntry[] = d.leaderboard ?? [];
        if (list.length > 0) setTop(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !top) return null;

  const meta = RANK_STYLES[top.rank] ?? RANK_STYLES.none;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Section header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-hazard/10">
              <Trophy size={18} className="text-hazard" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Community</p>
              <h2 className="font-display text-2xl uppercase tracking-tight">Our Top Referrer</h2>
            </div>
          </div>
          <Link
            href="/referral"
            className="group hidden items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink/50 hover:text-hazard sm:flex"
          >
            Join the programme
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl bg-ink text-stone-50">
          {/* Animated background grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #d4ff3d 0, #d4ff3d 1px, transparent 0, transparent 50%)",
              backgroundSize: "14px 14px",
            }}
          />
          {/* Glow blob */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-hazard/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#d4ff3d]/10 blur-[60px]" />

          <div className="relative grid items-center gap-8 p-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Avatar + Name */}
            <div className="flex items-center gap-5">
              {/* Avatar circle */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative flex-shrink-0"
              >
                <div
                  className={`h-20 w-20 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-xl ${meta.glow}`}
                >
                  <span className="text-3xl">🏆</span>
                </div>
                {/* Orbiting dot */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-hazard/30" />
              </motion.div>

              <div>
                <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400/20 to-hazard/20 px-3 py-1">
                  <span className="text-xs">🥇</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-hazard">
                    #1 Referrer
                  </span>
                </div>
                <h3 className="font-display text-2xl uppercase tracking-tight">{top.display_name}</h3>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br ${meta.gradient} text-white`}>
                    {meta.icon}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-stone-50/70">
                    {meta.label} Rank
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:col-span-1">
              <div className="rounded-2xl border border-stone-50/10 bg-stone-50/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-hazard" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40">Referrals</span>
                </div>
                <div className="mt-2 font-display text-3xl tracking-tight text-hazard">
                  {top.referral_count}
                </div>
              </div>
              <div className="rounded-2xl border border-stone-50/10 bg-stone-50/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40">Earned</span>
                </div>
                <div className="mt-2 font-display text-xl tracking-tight">
                  <span className="font-mono text-sm text-stone-50/40">KES </span>
                  {top.total_credit_kes.toLocaleString()}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 lg:items-end">
              <p className="text-sm text-stone-50/60 lg:text-right">
                Want to top the leaderboard? Share your link, earn KES per order, climb the ranks.
              </p>
              <Link
                href="/referral"
                className="group inline-flex items-center gap-2 rounded-full bg-hazard px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition-transform hover:scale-[1.03]"
              >
                Start referring
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile join link */}
        <div className="mt-4 text-center sm:hidden">
          <Link href="/referral" className="font-mono text-xs uppercase tracking-wide text-hazard underline-offset-4 hover:underline">
            Join the programme →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
