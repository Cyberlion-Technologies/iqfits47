"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard, Calendar, MapPin, Users, CheckCircle2,
  Clock, XCircle, Syringe, Filter, Search, RefreshCw,
  LogOut, ChevronDown, ExternalLink, X, Check, Loader2,
  TrendingUp, AlertCircle, Phone, Mail, FileText, Plus,
  DollarSign, Tag, Settings, Edit3, Trash2, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = "pending" | "confirmed" | "deposit_paid" | "completed" | "cancelled" | "no_show";
type BookingType = "studio" | "tour";
type AdminTab = "overview" | "studio" | "tour" | "tour_dates" | "services" | "settings";

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
  deposit_price_kes: number;
  status: string;
  is_featured: boolean;
}

interface ServiceItem {
  id: string;
  category: "tattoo" | "piercing" | "body_art" | "consultation";
  title: string;
  starting_price_kes: number;
  deposit_required_kes: number;
  estimated_duration: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

interface StudioSettings {
  studio_name: string;
  min_deposit_kes: number;
  hourly_rate_kes: number;
  operating_hours: string;
  cancellation_policy: string;
  contact_phone: string;
  contact_email: string;
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

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest", cfg.color)}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

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

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudioAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  // Tour Form State
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<TourDate | null>(null);
  const [tourForm, setTourForm] = useState({
    city: "", venue: "", venue_address: "", start_date: "", end_date: "",
    total_slots: 20, deposit_price_kes: 1500, status: "open", is_featured: false,
  });

  // Service Form State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    category: "tattoo" as "tattoo" | "piercing" | "body_art" | "consultation",
    title: "", starting_price_kes: 3500, deposit_required_kes: 1000,
    estimated_duration: "1 - 2 Hours", description: "", is_active: true,
  });

  // Settings Form State
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<StudioSettings>({
    studio_name: "47Studio (47Cultures & Ink)",
    min_deposit_kes: 1000,
    hourly_rate_kes: 5000,
    operating_hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    cancellation_policy: "Deposits are non-refundable for cancellations made less than 24h before appointment.",
    contact_phone: "+254 716 672 878",
    contact_email: "bookings@iqfits47.store",
  });

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
      const [bRes, tRes, sRes, setRes] = await Promise.all([
        fetch("/api/admin/studio"),
        fetch("/api/admin/studio/tours"),
        fetch("/api/admin/studio/services"),
        fetch("/api/admin/studio/settings"),
      ]);

      const bData = await bRes.json();
      const tData = await tRes.json();
      const sData = await sRes.json();
      const setData = await setRes.json();

      if (bRes.ok) {
        setBookings(bData.bookings ?? []);
        setStats(bData.stats ?? null);
      }
      if (tRes.ok) setTourDates(tData.tourDates ?? []);
      if (sRes.ok) setServices(sData.services ?? []);
      if (setRes.ok && setData.settings) {
        setSettings(setData.settings);
        setSettingsForm(setData.settings);
      }
    } catch { /* silent */ } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, []);

  // ── Status Updates ───────────────────────────────────────────────────────
  async function handleBookingStatusChange(id: string, status: BookingStatus) {
    try {
      const res = await fetch("/api/admin/studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to update"); return; }
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      if (selectedBooking?.id === id) setSelectedBooking((s) => s ? { ...s, status } : s);
      toast.success(`Booking status updated to ${STATUS_CONFIG[status].label}`);
    } catch { toast.error("Network error"); }
  }

  // ── Tour Operations ──────────────────────────────────────────────────────
  async function handleSaveTour(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = "/api/admin/studio/tours";
      const method = editingTour ? "PUT" : "POST";
      const payload = editingTour ? { id: editingTour.id, ...tourForm } : tourForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to save tour date"); return; }

      toast.success(editingTour ? "Tour stop updated!" : "New Kenya tour stop created!");
      setTourModalOpen(false);
      setEditingTour(null);
      loadData();
    } catch { toast.error("Something went wrong saving tour"); }
  }

  async function handleDeleteTour(id: string) {
    if (!confirm("Are you sure you want to delete this tour stop?")) return;
    try {
      const res = await fetch(`/api/admin/studio/tours?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Tour stop deleted");
        setTourDates((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error("Could not delete tour stop");
      }
    } catch { toast.error("Error deleting tour"); }
  }

  // ── Service Operations ────────────────────────────────────────────────────
  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = "/api/admin/studio/services";
      const method = editingService ? "PUT" : "POST";
      const payload = editingService ? { id: editingService.id, ...serviceForm } : serviceForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to save service"); return; }

      toast.success(editingService ? "Service updated!" : "New studio service created!");
      setServiceModalOpen(false);
      setEditingService(null);
      loadData();
    } catch { toast.error("Error saving service"); }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/studio/services?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Service deleted");
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else toast.error("Could not delete service");
    } catch { toast.error("Error deleting service"); }
  }

  // ── Settings Operation ───────────────────────────────────────────────────
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/studio/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        toast.success("Studio settings & pricing policies updated!");
      } else toast.error("Failed to save settings");
    } catch { toast.error("Error updating settings"); } finally { setSavingSettings(false); }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
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

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "overview",   label: "Overview",       icon: LayoutDashboard },
    { id: "studio",     label: "Studio Sessions", icon: Syringe,    count: stats?.byType?.studio },
    { id: "tour",       label: "Tour Bookings",   icon: MapPin,     count: stats?.byType?.tour },
    { id: "tour_dates", label: "Kenya Tours",     icon: Calendar,   count: tourDates.length },
    { id: "services",   label: "Services & Pricing", icon: Tag,    count: services.length },
    { id: "settings",   label: "Studio Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 size={28} className="animate-spin text-hazard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-stone-50">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-50/10 bg-[#0a0a0c]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/studio-logo.jpg"
              alt="47Studio"
              width={38}
              height={38}
              className="rounded-full ring-1 ring-hazard/30"
            />
            <div>
              <p className="font-display text-base uppercase tracking-wide leading-none">47STUDIO</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-stone-50/40 mt-0.5">Operations &amp; Booking Console</p>
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

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
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

        {/* ── 1. OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-3xl uppercase tracking-tight">Studio Operations Overview</h1>
              <p className="mt-1 font-mono text-[11px] text-stone-50/40">
                Live metrics, upcoming Kenya tour stops &amp; appointment breakdown
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Bookings" value={stats?.total ?? 0} icon={TrendingUp} />
              <StatCard label="Studio Sessions" value={stats?.byType?.studio ?? 0} icon={Syringe}
                accent="bg-cobalt/15 text-cobalt" sub="Private studio slots" />
              <StatCard label="Tour Bookings" value={stats?.byType?.tour ?? 0} icon={MapPin}
                accent="bg-hazard/15 text-hazard" sub="Pop-up city stops" />
              <StatCard label="Pending Review" value={stats?.byStatus?.pending ?? 0} icon={Clock}
                accent="bg-amber-500/15 text-amber-400" sub="Needs confirmation" />
            </div>

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
          </div>
        )}

        {/* ── 2. BOOKINGS TABS (STUDIO / TOUR) ────────────────────────── */}
        {(activeTab === "studio" || activeTab === "tour") && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="font-display text-3xl uppercase tracking-tight">
                {activeTab === "studio" ? "Studio Appointments" : "Tour Pop-up Bookings"}
              </h1>
              <p className="font-mono text-sm text-stone-50/40">{filteredBookings.length} entries</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-50/30" />
                <input
                  type="text"
                  placeholder="Search name, phone, ref, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 py-2.5 pl-9 pr-4 text-sm text-stone-50 placeholder-stone-50/30 outline-none focus:border-hazard transition-colors"
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-50/30" />
                <select
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
                    <tr className="border-b border-stone-50/10 font-mono text-[9px] uppercase tracking-widest text-stone-50/30">
                      <th className="py-3 pl-4 pr-3">Client</th>
                      <th className="hidden px-3 py-3 sm:table-cell">Type</th>
                      <th className="hidden px-3 py-3 lg:table-cell">Style &amp; Size</th>
                      <th className="hidden px-3 py-3 md:table-cell">{activeTab === "tour" ? "City Stop" : "Date"}</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="cursor-pointer border-b border-stone-50/5 hover:bg-stone-50/[0.03] transition-colors"
                      >
                        <td className="py-3.5 pl-4 pr-3">
                          <p className="font-mono text-[10px] text-hazard">{b.booking_ref}</p>
                          <p className="text-sm font-medium text-stone-50/90">{b.full_name}</p>
                          <p className="font-mono text-[10px] text-stone-50/40">{b.phone}</p>
                        </td>
                        <td className="hidden px-3 py-3.5 sm:table-cell font-mono text-xs">
                          {b.booking_type}
                        </td>
                        <td className="hidden px-3 py-3.5 lg:table-cell">
                          <p className="font-mono text-xs text-stone-50/70">{STYLE_LABELS[b.tattoo_style] ?? b.tattoo_style}</p>
                          <p className="font-mono text-[10px] text-stone-50/30">{SIZE_LABELS[b.tattoo_size]}</p>
                        </td>
                        <td className="hidden px-3 py-3.5 md:table-cell font-mono text-xs text-stone-50/50">
                          {b.booking_type === "studio" ? formatDate(b.preferred_date || "") : b.tour_date?.city || "—"}
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="py-3.5 pl-3 pr-4 text-right">
                          <button className="rounded-lg p-1.5 hover:bg-stone-50/10 text-stone-50/40 hover:text-stone-50">
                            <ExternalLink size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. KENYA TOURS MANAGER ───────────────────────────────────── */}
        {activeTab === "tour_dates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl uppercase tracking-tight">Kenya Tour Manager</h1>
                <p className="mt-1 font-mono text-[11px] text-stone-50/40">
                  Create city pop-up tour stops, set dates, manage capacity &amp; slot pricing
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTour(null);
                  setTourForm({
                    city: "", venue: "", venue_address: "", start_date: "", end_date: "",
                    total_slots: 20, deposit_price_kes: 1500, status: "open", is_featured: false,
                  });
                  setTourModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-full bg-hazard px-5 py-2.5 font-display text-xs uppercase tracking-wide text-white shadow-lg shadow-hazard/20 hover:scale-105 transition-transform"
              >
                <Plus size={14} /> Add Tour City Stop
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tourDates.map((td) => {
                const left = Math.max(0, td.total_slots - td.booked_slots);
                const pct = Math.round((td.booked_slots / td.total_slots) * 100);
                return (
                  <div key={td.id} className="relative overflow-hidden rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-5">
                    {td.is_featured && (
                      <span className="absolute right-4 top-4 rounded-full border border-hazard/30 bg-hazard/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-hazard">
                        Featured Stop
                      </span>
                    )}
                    <h3 className="font-display text-3xl uppercase tracking-tight">{td.city}</h3>
                    <p className="mt-1 text-sm font-medium text-stone-50/80">{td.venue}</p>
                    {td.venue_address && <p className="text-xs text-stone-50/40 mt-0.5">{td.venue_address}</p>}

                    <div className="mt-3 flex items-center justify-between font-mono text-xs text-stone-50/60 border-t border-b border-stone-50/10 py-2">
                      <span>Dates: {formatDate(td.start_date)} – {formatDate(td.end_date)}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between font-mono text-xs">
                      <span className="text-stone-50/50">Deposit Price:</span>
                      <span className="text-hazard font-bold">KES {td.deposit_price_kes?.toLocaleString() || "1,500"}</span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between font-mono text-[10px] text-stone-50/40 mb-1">
                        <span>{td.booked_slots} Booked</span>
                        <span>{left} Left / {td.total_slots} Total</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-50/10">
                        <div className={cn("h-full rounded-full transition-all", pct >= 80 ? "bg-hazard" : "bg-lime/70")} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-stone-50/10">
                      <span className={cn(
                        "rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                        td.status === "open" ? "border-lime/30 bg-lime/10 text-lime"
                          : td.status === "sold_out" ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                          : "border-cobalt/30 bg-cobalt/10 text-cobalt"
                      )}>
                        {td.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTour(td);
                            setTourForm({
                              city: td.city, venue: td.venue, venue_address: td.venue_address || "",
                              start_date: td.start_date, end_date: td.end_date, total_slots: td.total_slots,
                              deposit_price_kes: td.deposit_price_kes || 1500, status: td.status, is_featured: td.is_featured,
                            });
                            setTourModalOpen(true);
                          }}
                          className="rounded-lg border border-stone-50/10 p-1.5 hover:bg-stone-50/10 text-stone-50/70"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteTour(td.id)}
                          className="rounded-lg border border-rose-500/20 p-1.5 text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. SERVICES & PRICING MANAGER ──────────────────────────── */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl uppercase tracking-tight">Services &amp; Pricing Catalog</h1>
                <p className="mt-1 font-mono text-[11px] text-stone-50/40">
                  Configure tattoo styles, starting rates (KES), minimum deposits &amp; session durations
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({
                    category: "tattoo", title: "", starting_price_kes: 3500,
                    deposit_required_kes: 1000, estimated_duration: "1 - 2 Hours",
                    description: "", is_active: true,
                  });
                  setServiceModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-full bg-hazard px-5 py-2.5 font-display text-xs uppercase tracking-wide text-white shadow-lg shadow-hazard/20 hover:scale-105 transition-transform"
              >
                <Plus size={14} /> Add Service / Pricing
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((srv) => (
                <div key={srv.id} className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full border border-stone-50/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-stone-50/50">
                      {srv.category}
                    </span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                      srv.is_active ? "bg-lime/10 text-lime" : "bg-stone-50/10 text-stone-50/30"
                    )}>
                      {srv.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-2xl uppercase tracking-tight">{srv.title}</h3>
                  <p className="mt-1 text-xs text-stone-50/50 min-h-[36px]">{srv.description || "Custom body art service."}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-50/10 pt-3 font-mono text-xs">
                    <div>
                      <p className="text-[9px] uppercase text-stone-50/30">Starting Price</p>
                      <p className="font-bold text-hazard">KES {srv.starting_price_kes?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-stone-50/30">Deposit Required</p>
                      <p className="text-stone-50/80">KES {srv.deposit_required_kes?.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2 mt-1">
                      <p className="text-[9px] uppercase text-stone-50/30">Est. Duration</p>
                      <p className="text-stone-50/70">{srv.estimated_duration}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-stone-50/10">
                    <button
                      onClick={() => {
                        setEditingService(srv);
                        setServiceForm({
                          category: srv.category, title: srv.title,
                          starting_price_kes: srv.starting_price_kes,
                          deposit_required_kes: srv.deposit_required_kes,
                          estimated_duration: srv.estimated_duration || "",
                          description: srv.description || "",
                          is_active: srv.is_active,
                        });
                        setServiceModalOpen(true);
                      }}
                      className="rounded-lg border border-stone-50/10 p-1.5 hover:bg-stone-50/10 text-stone-50/70"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="rounded-lg border border-rose-500/20 p-1.5 text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. STUDIO SETTINGS TAB ──────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="font-display text-3xl uppercase tracking-tight">Studio Operational Settings</h1>
              <p className="mt-1 font-mono text-[11px] text-stone-50/40">
                Manage studio deposit rules, hourly rate (KES), opening hours &amp; cancellation policies
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-6 space-y-5">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wide text-stone-50/50 mb-1">
                  Studio Name
                </label>
                <input
                  type="text"
                  value={settingsForm.studio_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, studio_name: e.target.value })}
                  className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-4 py-2.5 text-sm text-stone-50 outline-none focus:border-hazard"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wide text-stone-50/50 mb-1">
                    Minimum Deposit (KES)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.min_deposit_kes}
                    onChange={(e) => setSettingsForm({ ...settingsForm, min_deposit_kes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-4 py-2.5 text-sm text-stone-50 outline-none focus:border-hazard"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wide text-stone-50/50 mb-1">
                    Hourly Rate (KES)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.hourly_rate_kes}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hourly_rate_kes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-4 py-2.5 text-sm text-stone-50 outline-none focus:border-hazard"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wide text-stone-50/50 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={settingsForm.operating_hours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, operating_hours: e.target.value })}
                  className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-4 py-2.5 text-sm text-stone-50 outline-none focus:border-hazard"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wide text-stone-50/50 mb-1">
                  Cancellation &amp; Deposit Policy
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.cancellation_policy}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cancellation_policy: e.target.value })}
                  className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 p-4 text-sm text-stone-50 outline-none focus:border-hazard"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex items-center gap-2 rounded-full bg-hazard px-7 py-3 font-display text-xs uppercase tracking-wide text-white hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {savingSettings ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Save Studio Operations Settings
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ── TOUR MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {tourModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTourModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-lg rounded-3xl border border-stone-50/10 bg-[#0d0d12] p-6 sm:p-8">
              <h2 className="font-display text-2xl uppercase tracking-tight">{editingTour ? "Edit Tour Stop" : "New Kenya Tour Stop"}</h2>
              <form onSubmit={handleSaveTour} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">City</label>
                    <input type="text" value={tourForm.city} onChange={(e) => setTourForm({ ...tourForm, city: e.target.value })} placeholder="e.g. Mombasa" className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Venue Name</label>
                    <input type="text" value={tourForm.venue} onChange={(e) => setTourForm({ ...tourForm, venue: e.target.value })} placeholder="e.g. Old Town Studio" className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Venue Address</label>
                  <input type="text" value={tourForm.venue_address} onChange={(e) => setTourForm({ ...tourForm, venue_address: e.target.value })} placeholder="Full address" className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Start Date</label>
                    <input type="date" value={tourForm.start_date} onChange={(e) => setTourForm({ ...tourForm, start_date: e.target.value })} className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">End Date</label>
                    <input type="date" value={tourForm.end_date} onChange={(e) => setTourForm({ ...tourForm, end_date: e.target.value })} className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Total Slot Capacity</label>
                    <input type="number" value={tourForm.total_slots} onChange={(e) => setTourForm({ ...tourForm, total_slots: Number(e.target.value) })} className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Deposit Price (KES)</label>
                    <input type="number" value={tourForm.deposit_price_kes} onChange={(e) => setTourForm({ ...tourForm, deposit_price_kes: Number(e.target.value) })} className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
                    <input type="checkbox" checked={tourForm.is_featured} onChange={(e) => setTourForm({ ...tourForm, is_featured: e.target.checked })} className="accent-hazard" />
                    Featured Stop
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-stone-50/10">
                  <button type="button" onClick={() => setTourModalOpen(false)} className="rounded-full border border-stone-50/10 px-5 py-2 text-xs font-mono">Cancel</button>
                  <button type="submit" className="rounded-full bg-hazard px-6 py-2 text-xs font-display uppercase tracking-wide text-white">Save Tour Stop</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SERVICE MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {serviceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setServiceModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-lg rounded-3xl border border-stone-50/10 bg-[#0d0d12] p-6 sm:p-8">
              <h2 className="font-display text-2xl uppercase tracking-tight">{editingService ? "Edit Service" : "New Studio Service & Pricing"}</h2>
              <form onSubmit={handleSaveService} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Category</label>
                    <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as any })} className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm text-stone-50">
                      <option value="tattoo">Tattoo</option>
                      <option value="piercing">Piercing</option>
                      <option value="body_art">Body Art</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Title</label>
                    <input type="text" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} placeholder="e.g. Fine Line Tattoo" className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Starting Price (KES)</label>
                    <input type="number" value={serviceForm.starting_price_kes} onChange={(e) => setServiceForm({ ...serviceForm, starting_price_kes: Number(e.target.value) })} className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Deposit Required (KES)</label>
                    <input type="number" value={serviceForm.deposit_required_kes} onChange={(e) => setServiceForm({ ...serviceForm, deposit_required_kes: Number(e.target.value) })} className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Est. Duration</label>
                  <input type="text" value={serviceForm.estimated_duration} onChange={(e) => setServiceForm({ ...serviceForm, estimated_duration: e.target.value })} placeholder="e.g. 1 - 2 Hours" className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-stone-50/40 mb-1">Description</label>
                  <textarea rows={2} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Service summary..." className="w-full rounded-xl border border-stone-50/10 bg-stone-50/5 p-3 text-sm" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-stone-50/10">
                  <button type="button" onClick={() => setServiceModalOpen(false)} className="rounded-full border border-stone-50/10 px-5 py-2 text-xs font-mono">Cancel</button>
                  <button type="submit" className="rounded-full bg-hazard px-6 py-2 text-xs font-display uppercase tracking-wide text-white">Save Service</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
