"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Copy, Check, Trophy, Star, Loader2, ChevronRight,
  Users, Zap, Crown, Flame, Medal, TrendingUp, Share2
} from "lucide-react";
import { isValidMpesaPhone } from "@/lib/utils";
import { TIERS } from "@/lib/affiliate";
import type { Rank } from "@/lib/affiliate";
import { ReferralNetworkViz } from "@/components/home/referral-network-viz";

// ── Constants ────────────────────────────────────────────────────────────────
const SITE_URL = "https://iqfits47.store";

const TIER_META: Record<string, { icon: React.ReactNode; gradient: string; bg: string; text: string }> = {
  none:     { icon: <Star size={14} />,   gradient: "from-stone-400 to-stone-500",   bg: "bg-stone-100",   text: "text-stone-500" },
  bronze:   { icon: <Medal size={14} />,  gradient: "from-amber-600 to-amber-800",   bg: "bg-amber-50",    text: "text-amber-700" },
  silver:   { icon: <Star size={14} />,   gradient: "from-slate-400 to-slate-600",   bg: "bg-slate-50",    text: "text-slate-600" },
  gold:     { icon: <Crown size={14} />,  gradient: "from-yellow-400 to-yellow-600", bg: "bg-yellow-50",   text: "text-yellow-700" },
  platinum: { icon: <Zap size={14} />,    gradient: "from-cyan-400 to-cyan-600",     bg: "bg-cyan-50",     text: "text-cyan-700" },
  legend:   { icon: <Flame size={14} />,  gradient: "from-[#d4ff3d] to-[#a0c800]",  bg: "bg-[#d4ff3d]/10",text: "text-[#6b8000]" },
};

function RankBadge({ rank, size = "sm" }: { rank: Rank; size?: "sm" | "md" | "lg" }) {
  const meta = TIER_META[rank] ?? TIER_META.none;
  const sizes = { sm: "text-[10px] px-2 py-0.5", md: "text-xs px-3 py-1", lg: "text-sm px-4 py-1.5" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold uppercase tracking-wider ${sizes[size]} bg-gradient-to-r ${meta.gradient} text-white`}>
      {meta.icon}
      {rank === "none" ? "No rank yet" : rank}
    </span>
  );
}

interface AffiliateData {
  id: string;
  phone: string;
  display_name: string;
  referral_code: string;
  referral_count: number;
  total_credit_kes: number;
  pending_credit_kes: number;
  rank: Rank;
  created_at: string;
}

interface LeaderboardEntry {
  position: number;
  referral_code: string;
  display_name: string;
  referral_count: number;
  rank: Rank;
  total_credit_kes: number;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ReferralPage() {
  const [phase, setPhase] = useState<"idle" | "loading" | "dashboard">("idle");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  // Load leaderboard on mount
  useEffect(() => {
    fetch("/api/affiliate/leaderboard")
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.leaderboard ?? []))
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidMpesaPhone(phone)) {
      setError("Enter a valid Safaricom number, e.g. 0712345678.");
      return;
    }
    setPhase("loading");
    try {
      const res = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setPhase("idle");
        return;
      }
      // Store in localStorage to auto-complete onboarding checklist
      localStorage.setItem("onboarding_referral_registered", "true");
      // Pre-fill / link the M-Pesa phone number for payouts as well
      let cleaned = phone.replace(/\D/g, "");
      if (cleaned.startsWith("0")) {
        cleaned = "254" + cleaned.slice(1);
      }
      localStorage.setItem("onboarding_mpesa_phone", cleaned);

      setAffiliate(data.affiliate);
      setPhase("dashboard");
    } catch {
      setError("Network error. Please try again.");
      setPhase("idle");
    }
  }

  const referralLink = affiliate ? `${SITE_URL}/?ref=${affiliate.referral_code}` : "";

  async function handleCopy() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!referralLink) return;
    if (navigator.share) {
      await navigator.share({
        title: "IQFITS-47 — Kicks & Designer Fits",
        text: "Shop authentic kicks and streetwear at IQFITS-47 — get 5% off your first order with my link!",
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  }

  // Progress to next tier
  const currentCount = affiliate?.referral_count ?? 0;
  const nextTier = TIERS.find((t) => currentCount < t.minReferrals) ?? null;
  const prevTierMin = (() => {
    const idx = TIERS.findIndex((t) => currentCount < t.minReferrals);
    return idx > 0 ? TIERS[idx - 1].minReferrals : 0;
  })();
  const progressPct = nextTier
    ? Math.round(((currentCount - prevTierMin) / (nextTier.minReferrals - prevTierMin)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-stone-50">
        {/* Background texture */}
        <div className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #d4ff3d 0, #d4ff3d 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />
        {/* Background noise */}
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.03]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-4 lg:px-8 lg:pb-0 lg:pt-0">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 lg:col-span-7 lg:py-24"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hazard/30 bg-hazard/10 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-hazard">
              <Gift size={12} /> Refer &amp; Earn
            </div>
            <h1 className="font-display text-[14vw] leading-[0.85] tracking-tight sm:text-6xl lg:text-7xl">
              Share the<br />
              <span className="text-hazard">Fit.</span> Earn<br />
              the Bag.
            </h1>
            <p className="mt-6 max-w-md text-base text-stone-50/60">
              Refer friends to IQFITS-47. They get <strong className="text-stone-50">5% off</strong> their first order — you earn <strong className="text-stone-50">KES 200+</strong> per successful referral. Climb the ranks, unlock better rewards.
            </p>

            {/* Stat pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "Your friend saves", value: "5% off first order" },
                { label: "You earn per referral", value: "KES 200 – 500" },
                { label: "Top rank earns", value: "KES 500/referral" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-stone-50/10 bg-stone-50/5 px-4 py-3 backdrop-blur-sm">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40">{s.label}</div>
                  <div className="mt-0.5 font-display text-sm text-hazard">{s.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Animated network visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 lg:col-span-5 w-full flex items-center justify-center py-6 lg:py-0"
          >
            <div className="w-full max-w-[420px] aspect-[4/4.5] lg:aspect-[1/1.2]">
              <ReferralNetworkViz />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">

          {/* ── LEFT COLUMN: Registration / Dashboard ────────────────────── */}
          <div className="lg:col-span-3 space-y-8">

            <AnimatePresence mode="wait">
              {phase !== "dashboard" ? (
                /* Registration Card */
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="rounded-3xl border border-ink/10 bg-white p-8 shadow-sm"
                >
                  <h2 className="font-display text-2xl uppercase tracking-tight">
                    Get your referral link
                  </h2>
                  <p className="mt-1 text-sm text-ink/50">
                    Enter your Safaricom number — we'll generate a unique link for you instantly.
                  </p>

                  <form onSubmit={handleRegister} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-ink/50">
                        M-Pesa / Safaricom Number <span className="text-hazard">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0712 345 678"
                        className="input"
                        required
                        inputMode="tel"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-ink/50">
                        Display name (optional)
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. KickKing254"
                        className="input"
                        maxLength={30}
                      />
                      <p className="mt-1 text-xs text-ink/40">Shown on the leaderboard (first 3 chars + dots for privacy).</p>
                    </div>

                    {error && (
                      <p className="rounded-xl bg-hazard/10 px-4 py-3 text-sm font-medium text-hazard">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={phase === "loading"}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-hazard py-4 font-display text-sm uppercase tracking-wide text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
                    >
                      {phase === "loading" ? (
                        <><Loader2 size={16} className="animate-spin" /> Generating...</>
                      ) : (
                        <><Gift size={16} /> Get my referral link</>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : affiliate ? (
                /* Dashboard */
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="space-y-6"
                >
                  {/* Rank + Stats Header */}
                  <div className="rounded-3xl border border-ink/10 bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-2"><RankBadge rank={affiliate.rank} size="md" /></div>
                        <h2 className="font-display text-2xl uppercase tracking-tight">
                          {affiliate.display_name || "Your Dashboard"}
                        </h2>
                        <p className="mt-0.5 font-mono text-xs text-ink/40">{affiliate.phone}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:text-right">
                        {[
                          { label: "Referrals", value: affiliate.referral_count },
                          { label: "Total Earned", value: `KES ${affiliate.total_credit_kes.toLocaleString()}` },
                          { label: "Pending", value: `KES ${affiliate.pending_credit_kes.toLocaleString()}` },
                        ].map((s) => (
                          <div key={s.label} className="min-w-0">
                            <div className="font-display text-base sm:text-2xl tracking-tight truncate sm:whitespace-normal" title={String(s.value)}>
                              {s.value}
                            </div>
                            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-ink/45 truncate">
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress bar to next tier */}
                    {nextTier && (
                      <div className="mt-6 border-t border-ink/10 pt-5">
                        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink/50">
                          <span>{currentCount} referrals</span>
                          <span>{nextTier.minReferrals} for {nextTier.rank}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-hazard"
                          />
                        </div>
                        <p className="mt-2 text-xs text-ink/50">
                          {nextTier.minReferrals - currentCount} more referral{nextTier.minReferrals - currentCount !== 1 ? "s" : ""} to reach <strong>{nextTier.label}</strong> (KES {nextTier.creditPerReferral}/referral)
                        </p>
                      </div>
                    )}
                    {!nextTier && (
                      <div className="mt-4 rounded-2xl bg-[#d4ff3d]/10 px-4 py-3 text-sm font-medium text-[#6b8000]">
                        🏆 You've reached the <strong>LEGEND</strong> tier — maximum rewards unlocked!
                      </div>
                    )}
                  </div>

                  {/* Referral Link */}
                  <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
                    <h3 className="mb-3 font-display text-lg uppercase tracking-tight">Your referral link</h3>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="flex-1 overflow-hidden rounded-xl border border-ink/15 bg-stone-50 px-4 py-3">
                        <p className="truncate font-mono text-xs text-ink/60">{referralLink}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={handleCopy}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-ink/15 px-4 py-3 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-ink hover:text-stone-50"
                        >
                          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                        </button>
                        <button
                          onClick={handleShare}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-hazard px-4 py-3 font-mono text-xs uppercase tracking-wide text-white transition-colors hover:bg-hazard/90"
                        >
                          <Share2 size={14} /> Share
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-ink/40">
                      Share this link on WhatsApp, Instagram, or anywhere — when your friend orders using this link, you both benefit.
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* ── Tier Ladder ──────────────────────────────────────────────── */}
            <div className="rounded-3xl border border-ink/10 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-hazard" />
                <h2 className="font-display text-xl uppercase tracking-tight">Tier Rewards</h2>
              </div>
              <div className="space-y-3">
                {TIERS.map((tier, i) => {
                  const meta = TIER_META[tier.rank];
                  const isActive = affiliate && affiliate.rank === tier.rank;
                  const isAchieved = affiliate && affiliate.referral_count >= tier.minReferrals;
                  return (
                    <motion.div
                      key={tier.rank}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition-all ${
                        isActive
                          ? "border-hazard/30 bg-hazard/5 ring-1 ring-hazard/20"
                          : isAchieved
                          ? "border-green-200 bg-green-50/50"
                          : "border-ink/8 bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}>
                          {meta.icon}
                        </div>
                        <div>
                          <div className="font-display text-sm uppercase tracking-wide">
                            {tier.label}
                            {isActive && <span className="ml-2 text-[10px] text-hazard font-mono">(YOUR RANK)</span>}
                          </div>
                          <div className="font-mono text-[10px] text-ink/50">
                            {tier.minReferrals}+ successful referrals
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-base">KES {tier.creditPerReferral}</div>
                        <div className="font-mono text-[10px] text-ink/50">per referral</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-ink/40">
                Tier credit is automatically earned for every confirmed paid order placed through your link. Pending credits appear in your dashboard.
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Leaderboard + How It Works ─────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* How It Works */}
            <div className="rounded-3xl border border-ink/10 bg-white p-7 shadow-sm">
              <h2 className="mb-5 font-display text-xl uppercase tracking-tight">How it works</h2>
              <ol className="space-y-5">
                {[
                  {
                    icon: <Gift size={16} />,
                    title: "Get your link",
                    body: "Enter your Safaricom number to generate a unique referral link.",
                  },
                  {
                    icon: <Share2 size={16} />,
                    title: "Share it",
                    body: "Send your link via WhatsApp, Instagram DM, or anywhere you hang.",
                  },
                  {
                    icon: <Users size={16} />,
                    title: "Friend orders",
                    body: "Your friend gets 5% off their first IQFITS-47 order automatically.",
                  },
                  {
                    icon: <Trophy size={16} />,
                    title: "You earn credit",
                    body: "Once payment clears, KES credit lands in your account. Climb the ranks for bigger rewards.",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-hazard text-white">
                      {step.icon}
                    </div>
                    <div>
                      <p className="font-display text-sm uppercase tracking-wide">{step.title}</p>
                      <p className="text-xs text-ink/50">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Leaderboard */}
            <div className="rounded-3xl border border-ink/10 bg-white p-7 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-hazard" />
                  <h2 className="font-display text-xl uppercase tracking-tight">Leaderboard</h2>
                </div>
                <span className="rounded-full bg-hazard/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-hazard">
                  Top Referrers
                </span>
              </div>

              {lbLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-ink/30" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-10 text-center">
                  <Trophy size={32} className="mx-auto mb-3 text-ink/20" />
                  <p className="text-sm text-ink/40">No referrals yet — be the first!</p>
                </div>
              ) : (
                <ol className="space-y-2">
                  {leaderboard.map((entry, i) => {
                    const meta = TIER_META[entry.rank] ?? TIER_META.none;
                    const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-700"];
                    return (
                      <motion.li
                        key={entry.referral_code}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-stone-50 px-4 py-3"
                      >
                        <span className={`w-6 text-center font-display text-sm ${medalColors[i] ?? "text-ink/30"}`}>
                          {i < 3 ? ["🥇","🥈","🥉"][i] : `${i+1}`}
                        </span>
                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${meta.gradient} text-white text-[10px]`}>
                          {meta.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-xs uppercase tracking-wide">{entry.display_name}</p>
                          <p className="font-mono text-[10px] text-ink/40">{entry.referral_count} referral{entry.referral_count !== 1 ? "s" : ""}</p>
                        </div>
                        <RankBadge rank={entry.rank} size="sm" />
                      </motion.li>
                    );
                  })}
                </ol>
              )}
            </div>

            {/* T&Cs note */}
            <div className="rounded-2xl border border-ink/8 bg-stone-100 px-5 py-4 text-xs text-ink/50">
              <strong className="font-mono uppercase tracking-wide">Terms:</strong> Credits are earned per confirmed paid order placed by a new customer using your unique link. Self-referrals are not valid. Referral and promo discounts cannot be combined. IQFITS-47 reserves the right to update the programme at any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
