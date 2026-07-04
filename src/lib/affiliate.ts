import { supabaseServer } from "@/lib/supabase/server";

// ── Tier definitions ────────────────────────────────────────────────────────
export const TIERS = [
  { rank: "bronze",   minReferrals: 1,  creditPerReferral: 200, label: "Bronze",   color: "#cd7f32" },
  { rank: "silver",   minReferrals: 5,  creditPerReferral: 250, label: "Silver",   color: "#a8a9ad" },
  { rank: "gold",     minReferrals: 15, creditPerReferral: 300, label: "Gold",     color: "#ffd700" },
  { rank: "platinum", minReferrals: 30, creditPerReferral: 350, label: "Platinum", color: "#00d4ff" },
  { rank: "legend",   minReferrals: 60, creditPerReferral: 500, label: "Legend",   color: "#d4ff3d" },
] as const;

export type Rank = "none" | "bronze" | "silver" | "gold" | "platinum" | "legend";

export function getTierForCount(count: number): (typeof TIERS)[number] | null {
  // Return the highest tier the count qualifies for
  let tier: (typeof TIERS)[number] | null = null;
  for (const t of TIERS) {
    if (count >= t.minReferrals) tier = t;
  }
  return tier;
}

export function getRankForCount(count: number): Rank {
  const tier = getTierForCount(count);
  return tier ? (tier.rank as Rank) : "none";
}

export function getNextTier(count: number) {
  return TIERS.find((t) => count < t.minReferrals) ?? null;
}

// ── Code generation ─────────────────────────────────────────────────────────
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// ── Affiliate record ─────────────────────────────────────────────────────────
export interface AffiliateRecord {
  id: string;
  phone: string;
  display_name: string;
  referral_code: string;
  referral_count: number;
  total_credit_kes: number;
  pending_credit_kes: number;
  rank: Rank;
  created_at: string;
  updated_at: string;
}

/**
 * Returns the existing affiliate for this phone, or creates one.
 * Safe to call multiple times (upsert-style).
 */
export async function getOrCreateAffiliate(
  phone: string,
  displayName?: string
): Promise<AffiliateRecord> {
  // Try fetch first
  const { data: existing } = await supabaseServer
    .from("affiliates")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) return existing as AffiliateRecord;

  // Generate a unique code
  let code = generateReferralCode();
  // Retry on collision (extremely unlikely)
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await supabaseServer
      .from("affiliates")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (!clash) break;
    code = generateReferralCode();
  }

  const { data: created, error } = await supabaseServer
    .from("affiliates")
    .insert({
      phone,
      display_name: displayName ?? "",
      referral_code: code,
      referral_count: 0,
      total_credit_kes: 0,
      pending_credit_kes: 0,
      rank: "none",
    })
    .select("*")
    .single();

  if (error || !created) throw new Error("Failed to create affiliate: " + error?.message);
  return created as AffiliateRecord;
}

/**
 * Fetch affiliate by referral code (for code validation at checkout).
 */
export async function lookupAffiliateByCode(code: string): Promise<AffiliateRecord | null> {
  const { data } = await supabaseServer
    .from("affiliates")
    .select("*")
    .eq("referral_code", code.trim().toUpperCase())
    .maybeSingle();
  return (data as AffiliateRecord) ?? null;
}

/**
 * Called after a referred order is confirmed paid.
 * Logs the event, updates credit, and refreshes rank.
 */
export async function recordReferralEvent({
  affiliateId,
  orderNumber,
  orderTotalKes,
  discountGiven,
}: {
  affiliateId: string;
  orderNumber: string;
  orderTotalKes: number;
  discountGiven: number;
}): Promise<void> {
  // Look up current referral count to determine credit amount
  const { data: aff } = await supabaseServer
    .from("affiliates")
    .select("referral_count")
    .eq("id", affiliateId)
    .single();

  const currentCount = (aff?.referral_count ?? 0) as number;
  const newCount = currentCount + 1;
  const tier = getTierForCount(newCount);
  const credit = tier?.creditPerReferral ?? 200;
  const newRank = getRankForCount(newCount);

  // Insert event
  await supabaseServer.from("referral_events").insert({
    affiliate_id: affiliateId,
    order_number: orderNumber,
    order_total_kes: orderTotalKes,
    credit_awarded: credit,
    discount_given: discountGiven,
  });

  // Atomically update counters + rank via RPC (avoids race conditions)
  await supabaseServer.rpc("increment_affiliate_credit", {
    p_affiliate_id: affiliateId,
    p_credit: credit,
    p_rank: newRank,
    p_count: newCount,
  });
}

/**
 * Leaderboard — top 50 by referral count.
 * Names are truncated for privacy.
 */
export async function getLeaderboard() {
  const { data, error } = await supabaseServer
    .from("affiliates")
    .select("referral_code, display_name, referral_count, rank, total_credit_kes")
    .gt("referral_count", 0)
    .order("referral_count", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>, idx: number) => ({
    position: idx + 1,
    referral_code: row.referral_code as string,
    display_name: truncateName((row.display_name as string) || "Anonymous"),
    referral_count: row.referral_count as number,
    rank: row.rank as Rank,
    total_credit_kes: row.total_credit_kes as number,
  }));
}

function truncateName(name: string): string {
  if (!name || name.length <= 3) return name;
  return name.slice(0, 3) + "•".repeat(Math.min(name.length - 3, 4));
}
