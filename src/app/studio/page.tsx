"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard, Calendar, MapPin, Users, CheckCircle2,
  Clock, XCircle, Syringe, Filter, Search, RefreshCw,
  LogOut, ChevronDown, ExternalLink, X, Check, Loader2,
  TrendingUp, AlertCircle, Phone, Mail, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = "pending" | "confirmed" | "deposit_paid" | "completed" | "cancelled" | "no_show";
type BookingType = "studio" | "tour";
type AdminTab = "overview" | "studio" | "tour" | "tour_dates";

interface TourDateRef { city: string; venue: string; start_date: string; end_date: string; }

interface Booking {
  id: string;
  booking_ref: string;
  booking_type: BookingType;
  full_name: string;
  phone: string;
  email: string | null;
  tattoo_style: string;
  tattoo_size: string;
  body_placement: string;
  design_description: string;
  has_reference_art: boolean;
  notes: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: BookingStatus;
  deposit_amount: number | null;
  deposit_paid: boolean;
  mpesa_receipt: string | null;
  created_at: string;
  tour_date?: TourDateRef | null;
}

interface TourDate {
  id: string;
  city: string;
  venue: string;
  venue_address: string | null;
  start_date: string;
  end_date: string;
  total_slots: number;
  booked_slots: number;
  status: string;
  is_featured: boolean;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:      { label: "Pending",      color: "bg-amber-500/15 text-amber-400 border-amber-500/20",   icon: Clock },
  confirmed:    { label: "Confirmed",    color: "bg-blue-500/15 text-blue-400 border-blue-500/20",      icon: CheckCircle2 },
  deposit_paid: { label: "Deposit Paid", color: "bg-purple-500/15 text-purple-400 border-purple-500/20",icon: CheckCircle2 },
  completed:    { label: "Completed",    color: "bg-lime/15 text-lime border-lime/20",                  icon: Check },
  cancelled:    { label: "Cancelled",    color: "bg-rose-500/15 text-rose-400 border-rose-500/20",      icon: XCircle },
  no_show:      { label: "No-Show",      color: "bg-stone-500/15 text-stone-400 border-stone-500/20",   icon: AlertCircle },
};

const STYLE_LABELS: Record<string, string> = {
  traditional: "Traditional", neo_traditional: "Neo-Trad", geometric: "Geometric",
  fine_line: "Fine Line", blackwork: "Blackwork", realism: "Realism",
  watercolour: "Watercolour", custom: "Custom",
};

const SIZE_LABELS: Record<string, string> = {
  small: "Small", medium: "Medium", large: "Large", sleeve: "Sleeve", full_back: "Full Back",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Morning", afternoon: "Afternoon", evening: "Evening",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest", cfg.color)}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.04] p-5"
    >
      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accent ?? "bg-hazard/15 text-hazard")}>
          <Icon size={15} />
        </div>
      </div>
      <p className="mt-3 font-display text-4xl uppercase tracking-tight">{value}</p>
      {sub && <p className="mt-1 font-mono text-[10px] text-stone-50/30">{sub}</p>}
    </motion.div>
  );
}

// ── Booking Detail Drawer ────────────────────────────────────────────────────
function BookingDrawer({
  booking, onClose, onStatusChange,
}: {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: BookingStatus) => Promise<void>;
}) {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [saving, setSaving] = useState(false);

  async function applyStatus(s: BookingStatus) {
    setSaving(true);
    await onStatusChange(booking.id, s);
    setStatus(s);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-y-auto bg-ink border-l border-stone-50/10 p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-hazard">{booking.booking_ref}</p>
            <h3 className="mt-1 font-display text-2xl uppercase tracking-tight">{booking.full_name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <span className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                booking.booking_type === "studio"
                  ? "border-cobalt/30 bg-cobalt/10 text-cobalt"
                  : "border-hazard/30 bg-hazard/10 text-hazard"
              )}>
                {booking.booking_type === "studio" ? "Studio" : "Tour"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-stone-50/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-stone-50/10 bg-stone-50/[0.03] p-4 space-y-2.5 mb-5">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40 mb-3">Contact</h4>
          <a href={`tel:${booking.phone}`} className="flex items-center gap-2.5 text-sm text-stone-50/80 hover:text-hazard transition-colors">
            <Phone size={13} className="text-stone-50/40" /> {booking.phone}
          </a>
          {booking.email && (
            <a href={`mailto:${booking.email}`} className="flex items-center gap-2.5 text-sm text-stone-50/80 hover:text-hazard transition-colors">
              <Mail size={13} className="text-stone-50/40" /> {booking.email}
            </a>
          )}
          <a
            href={`https://wa.me/${booking.phone.replace(/^0/, "254")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 px-3 py-1.5 font-mono text-xs text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.86.002-2.636-1.023-5.113-2.884-6.978C16.577 1.896 14.1 .874 11.457.874 6.023.874 1.6 5.294 1.596 10.73c-.001 1.673.443 3.305 1.288 4.715l.185.311-.99 3.616 3.7-.971.302.179zM17.07 14.39c-.274-.138-1.62-.8-1.87-.89-.254-.09-.44-.136-.62.14-.18.275-.7 1.1-.86 1.284-.16.183-.32.206-.59.07-.27-.138-1.15-.425-2.19-1.355-.81-.723-1.36-1.618-1.52-1.892-.16-.275-.016-.424.12-.56.12-.124.272-.32.408-.48.136-.16.18-.275.27-.457.09-.183.047-.344-.023-.482-.07-.138-.62-1.49-.85-2.04-.223-.538-.485-.465-.66-.465-.173 0-.374-.02-.576-.02-.2-.003-.527.076-.8.375-.274.298-1.047 1.025-1.047 2.5 0 1.474 1.073 2.897 1.22 3.103.15.206 2.11 3.22 5.11 4.516.714.308 1.272.493 1.707.63.717.228 1.368.196 1.883.118.574-.087 1.745-.713 1.992-1.402.247-.69.247-1.283.173-1.402-.073-.12-.272-.206-.547-.344z"/></svg>
            WhatsApp
          </a>
        </div>

        {/* Tattoo info */}
        <div className="rounded-xl border border-stone-50/10 bg-stone-50/[0.03] p-4 mb-5">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40 mb-3">Tattoo Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/30">Style</p>
              <p className="mt-0.5 text-stone-50/80">{STYLE_LABELS[booking.tattoo_style] ?? booking.tattoo_style}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/30">Size</p>
              <p className="mt-0.5 text-stone-50/80">{SIZE_LABELS[booking.tattoo_size] ?? booking.tattoo_size}</p>
            </div>
            <div className="col-span-2">
              <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/30">Placement</p>
              <p className="mt-0.5 text-stone-50/80">{booking.body_placement}</p>
            </div>
            <div className="col-span-2">
              <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/30">Design Idea</p>
              <p className="mt-0.5 text-stone-50/70 text-sm leading-relaxed">{booking.design_description}</p>
            </div>
            {booking.has_reference_art && (
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-cobalt/20 bg-cobalt/10 px-2 py-0.5 font-mono text-[9px] text-cobalt">
                  <FileText size={9} /> Has reference images
                </span>
              </div>
            )}
            {booking.notes && (
              <div className="col-span-2">
                <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/30">Notes</p>
                <p className="mt-0.5 text-stone-50/60 text-xs italic">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule/Tour */}
        <div className="rounded-xl border border-stone-50/10 bg-stone-50/[0.03] p-4 mb-5">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40 mb-3">
            {booking.booking_type === "studio" ? "Scheduled" : "Tour Stop"}
          </h4>
          {booking.booking_type === "studio" ? (
            <div className="flex gap-4 text-sm">
              {booking.preferred_date && (
                <div>
                  <p className="font-mono text-[9px] text-stone-50/30 uppercase">Date</p>
                  <p className="mt-0.5 text-stone-50/80">{formatDate(booking.preferred_date)}</p>
                </div>
              )}
              {booking.preferred_time && (
                <div>
                  <p className="font-mono text-[9px] text-stone-50/30 uppercase">Time slot</p>
                  <p className="mt-0.5 text-stone-50/80">{TIME_LABELS[booking.preferred_time]}</p>
                </div>
              )}
            </div>
          ) : booking.tour_date ? (
            <div className="text-sm">
              <p className="font-medium text-stone-50/90">{booking.tour_date.city}</p>
              <p className="text-stone-50/50">{booking.tour_date.venue}</p>
              <p className="mt-1 font-mono text-xs text-stone-50/30">
                {formatDate(booking.tour_date.start_date)} – {formatDate(booking.tour_date.end_date)}
              </p>
            </div>
          ) : null}
          <p className="mt-2 font-mono text-[9px] text-stone-50/25">Booked {formatDateTime(booking.created_at)}</p>
        </div>

        {/* Status updater */}
        <div className="rounded-xl border border-stone-50/10 bg-stone-50/[0.03] p-4">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-stone-50/40 mb-3">Update Status</h4>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <button
                  key={s}
                  onClick={() => applyStatus(s)}
                  disabled={saving || s === status}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-all",
                    s === status ? cfg.color : "border-stone-50/10 text-stone-50/40 hover:border-stone-50/20 hover:text-stone-50/70"
                  )}
                >
                  {saving && s === status ? <Loader2 size={9} className="animate-spin" /> : <Icon size={9} />}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

// ── Booking Row ──────────────────────────────────────────────────────────────
function BookingRow({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="cursor-pointer border-b border-stone-50/5 hover:bg-stone-50/[0.03] transition-colors"
    >
      <td className="py-3.5 pl-4 pr-3">
        <p className="font-mono text-[10px] text-hazard">{booking.booking_ref}</p>
        <p className="mt-0.5 text-sm font-medium text-stone-50/90">{booking.full_name}</p>
      </td>
      <td className="hidden px-3 py-3.5 sm:table-cell">
        <span className={cn(
          "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
          booking.booking_type === "studio"
            ? "border-cobalt/30 bg-cobalt/10 text-cobalt"
            : "border-hazard/30 bg-hazard/10 text-hazard"
        )}>
          {booking.booking_type}
        </span>
      </td>
      <td className="hidden px-3 py-3.5 lg:table-cell">
        <p className="font-mono text-xs text-stone-50/50">{STYLE_LABELS[booking.tattoo_style] ?? booking.tattoo_style}</p>
        <p className="font-mono text-[10px] text-stone-50/30">{SIZE_LABELS[booking.tattoo_size]}</p>
      </td>
      <td className="hidden px-3 py-3.5 md:table-cell">
        <p className="font-mono text-xs text-stone-50/50">
          {booking.booking_type === "studio"
            ? (booking.preferred_date ? formatDate(booking.preferred_date) : "—")
            : (booking.tour_date?.city ?? "—")}
        </p>
      </td>
      <td className="px-3 py-3.5">
        <StatusBadge status={booking.status} />
      </td>
      <td className="hidden px-3 py-3.5 text-right font-mono text-[10px] text-stone-50/30 lg:table-cell">
        {formatDateTime(booking.created_at)}
      </td>
      <td className="py-3.5 pl-3 pr-4 text-right">
        <ExternalLink size={14} className="text-stone-50/20 group-hover:text-stone-50/60 transition-colors" />
      </td>
    </motion.tr>
  );
}

// ── Tour Date Card ────────────────────────────────────────────────────────────
function TourDateCard({ td }: { td: TourDate }) {
  const left = Math.max(0, td.total_slots - td.booked_slots);
  const pct = Math.round((td.booked_slots / td.total_slots) * 100);
  return (
    <div className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-3xl uppercase tracking-tight">{td.city}</h3>
        <span className={cn(
          "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
          td.status === "open" ? "border-lime/30 bg-lime/10 text-lime"
            : td.status === "sold_out" ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
            : "border-cobalt/30 bg-cobalt/10 text-cobalt"
        )}>
          {td.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-50/50">{td.venue}</p>
      {td.venue_address && <p className="text-xs text-stone-50/30">{td.venue_address}</p>}
      <p className="mt-2 font-mono text-xs text-stone-50/40">
        {formatDate(td.start_date)} – {formatDate(td.end_date)}
      </p>
      <div className="mt-4">
        <div className="flex justify-between font-mono text-[10px] text-stone-50/40 mb-1">
          <span>{td.booked_slots} booked</span>
          <span>{left} remaining / {td.total_slots} total</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-50/10">
          <div
            className={cn("h-full rounded-full transition-all", pct >= 80 ? "bg-hazard" : "bg-lime/70")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudioAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (!data.isAuthenticated) router.push("/admin/login");
      else await loadData();
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/studio");
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings ?? []);
        setTourDates(data.tourDates ?? []);
        setStats(data.stats ?? null);
      }
    } catch { /* silent */ } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, []);

  async function handleStatusChange(id: string, status: BookingStatus) {
    try {
      const res = await fetch("/api/admin/studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to update"); return; }
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
      toast.success(`Booking marked as ${STATUS_CONFIG[status].label}`);
    } catch { toast.error("Network error"); }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  // ── Filtered bookings ────────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const typeMatch = activeTab === "studio" ? b.booking_type === "studio"
      : activeTab === "tour" ? b.booking_type === "tour" : true;
    const statusMatch = filterStatus === "all" || b.status === filterStatus;
    const q = search.toLowerCase();
    const searchMatch = !q ||
      b.full_name.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.booking_ref.toLowerCase().includes(q) ||
      (b.tour_date?.city ?? "").toLowerCase().includes(q);
    return typeMatch && statusMatch && searchMatch;
  });

  // ── Tab nav config ───────────────────────────────────────────────────────
  const tabs: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "overview",   label: "Overview",    icon: LayoutDashboard },
    { id: "studio",     label: "Studio",      icon: Syringe,    count: stats?.byType?.studio },
    { id: "tour",       label: "Tour",        icon: MapPin,     count: stats?.byType?.tour },
    { id: "tour_dates", label: "Tour Dates",  icon: Calendar,   count: tourDates.length },
  ];

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 size={28} className="animate-spin text-hazard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-stone-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-stone-50/10 bg-[#0a0a0c]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/studio-logo.jpg"
              alt="47Studio"
              width={36}
              height={36}
              className="rounded-full ring-1 ring-hazard/30"
            />
            <div>
              <p className="font-display text-sm uppercase tracking-wide leading-none">47Studio</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/40 mt-0.5">Admin Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-stone-50/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-stone-50/50 hover:border-stone-50/20 hover:text-stone-50/80 transition-colors"
            >
              <RefreshCw size={11} className={cn(refreshing && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-1.5 rounded-lg border border-stone-50/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-stone-50/50 hover:border-stone-50/20 hover:text-stone-50/80 transition-colors"
            >
              <ExternalLink size={11} />
              IQFITS Admin
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={11} />
              Sign out
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`studio-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors",
                    activeTab === tab.id
                      ? "border-hazard text-hazard"
                      : "border-transparent text-stone-50/40 hover:text-stone-50/70"
                  )}
                >
                  <Icon size={12} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 font-mono text-[9px]",
                      activeTab === tab.id ? "bg-hazard/20 text-hazard" : "bg-stone-50/10 text-stone-50/40"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-3xl uppercase tracking-tight">Dashboard</h1>
              <p className="mt-1 font-mono text-[11px] text-stone-50/40">
                47cultures &amp; Ink — Booking management
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Bookings" value={stats?.total ?? 0} icon={TrendingUp} />
              <StatCard label="Studio Sessions" value={stats?.byType?.studio ?? 0} icon={Syringe}
                accent="bg-cobalt/15 text-cobalt" sub="Private appointments" />
              <StatCard label="Tour Bookings" value={stats?.byType?.tour ?? 0} icon={MapPin}
                accent="bg-hazard/15 text-hazard" sub="Pop-up city stops" />
              <StatCard label="Pending Review" value={stats?.byStatus?.pending ?? 0} icon={Clock}
                accent="bg-amber-500/15 text-amber-400" sub="Awaiting confirmation" />
            </div>

            {/* Status breakdown */}
            <div className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-6">
              <h2 className="mb-5 font-display text-lg uppercase tracking-tight">Status Breakdown</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map((s) => {
                  const count = stats?.byStatus?.[s] ?? 0;
                  const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <div key={s} className="flex items-center gap-3 rounded-xl border border-stone-50/[0.06] bg-stone-50/[0.02] p-4">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", cfg.color)}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-50/50">{cfg.label}</p>
                          <p className="font-display text-lg">{count}</p>
                        </div>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-50/10">
                          <div className="h-full rounded-full bg-hazard/60 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent bookings */}
            <div className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg uppercase tracking-tight">Recent Bookings</h2>
                <button onClick={() => setActiveTab("studio")} className="font-mono text-[10px] uppercase tracking-widest text-hazard hover:underline">
                  View all →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody>
                    {bookings.slice(0, 6).map((b) => (
                      <BookingRow key={b.id} booking={b} onClick={() => setSelected(b)} />
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <p className="py-8 text-center font-mono text-xs text-stone-50/30">No bookings yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDIO / TOUR TABS ───────────────────────────────────────── */}
        {(activeTab === "studio" || activeTab === "tour") && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="font-display text-3xl uppercase tracking-tight">
                {activeTab === "studio" ? "Studio Sessions" : "Tour Bookings"}
              </h1>
              <p className="font-mono text-sm text-stone-50/40">{filtered.length} bookings</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-50/30" />
                <input
                  id="studio-search"
                  type="text"
                  placeholder="Search name, phone, ref..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 py-2.5 pl-9 pr-4 text-sm text-stone-50 placeholder-stone-50/30 outline-none focus:border-hazard transition-colors"
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-50/30" />
                <select
                  id="studio-status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as BookingStatus | "all")}
                  className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 py-2.5 pl-9 pr-8 text-sm text-stone-50 outline-none focus:border-hazard transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-50/30" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-50/10 bg-stone-50/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-50/10">
                      <th className="py-3 pl-4 pr-3 font-mono text-[9px] uppercase tracking-widest text-stone-50/30">Client</th>
                      <th className="hidden px-3 py-3 font-mono text-[9px] uppercase tracking-widest text-stone-50/30 sm:table-cell">Type</th>
                      <th className="hidden px-3 py-3 font-mono text-[9px] uppercase tracking-widest text-stone-50/30 lg:table-cell">Tattoo</th>
                      <th className="hidden px-3 py-3 font-mono text-[9px] uppercase tracking-widest text-stone-50/30 md:table-cell">
                        {activeTab === "tour" ? "City" : "Date"}
                      </th>
                      <th className="px-3 py-3 font-mono text-[9px] uppercase tracking-widest text-stone-50/30">Status</th>
                      <th className="hidden px-3 py-3 font-mono text-[9px] uppercase tracking-widest text-stone-50/30 lg:table-cell text-right">Created</th>
                      <th className="py-3 pl-3 pr-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <BookingRow key={b.id} booking={b} onClick={() => setSelected(b)} />
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="py-12 text-center font-mono text-xs text-stone-50/30">No bookings found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TOUR DATES TAB ───────────────────────────────────────────── */}
        {activeTab === "tour_dates" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl uppercase tracking-tight">Tour Dates</h1>
              <p className="mt-1 font-mono text-[11px] text-stone-50/40">
                Manage Kenya tour pop-up city stops and capacities
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tourDates.map((td) => <TourDateCard key={td.id} td={td} />)}
              {tourDates.length === 0 && (
                <p className="col-span-2 py-12 text-center font-mono text-xs text-stone-50/30">
                  No tour dates found — run the SQL schema in Supabase to seed them.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <BookingDrawer
            key={selected.id}
            booking={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
