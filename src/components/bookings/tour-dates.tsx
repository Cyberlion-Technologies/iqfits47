"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface TourDate {
  id: string;
  city: string;
  venue: string;
  venue_address: string | null;
  start_date: string;
  end_date: string;
  total_slots: number;
  booked_slots: number;
  status: "upcoming" | "open" | "sold_out" | "completed" | "cancelled";
  is_featured: boolean;
}

interface TourBookingForm {
  full_name: string;
  phone: string;
  email: string;
  tattoo_style: string;
  tattoo_size: string;
  body_placement: string;
  design_description: string;
  has_reference_art: boolean;
  notes: string;
}

// Static fallback for when API isn't configured yet
const FALLBACK_TOUR_DATES: TourDate[] = [
  {
    id: "nairobi-aug",
    city: "Nairobi",
    venue: "Westlands Studio Hub",
    venue_address: "Westlands Ave, off Waiyaki Way, Nairobi",
    start_date: "2026-08-08",
    end_date: "2026-08-10",
    total_slots: 24,
    booked_slots: 11,
    status: "open",
    is_featured: true,
  },
  {
    id: "mombasa-aug",
    city: "Mombasa",
    venue: "Old Town Ink Collective",
    venue_address: "Nkrumah Road, Old Town, Mombasa",
    start_date: "2026-08-22",
    end_date: "2026-08-23",
    total_slots: 16,
    booked_slots: 4,
    status: "upcoming",
    is_featured: false,
  },
  {
    id: "kisumu-sep",
    city: "Kisumu",
    venue: "Milimani Arts Quarter",
    venue_address: "Oginga Odinga St, Milimani, Kisumu",
    start_date: "2026-09-05",
    end_date: "2026-09-06",
    total_slots: 16,
    booked_slots: 2,
    status: "upcoming",
    is_featured: false,
  },
  {
    id: "eldoret-sep",
    city: "Eldoret",
    venue: "Pioneers Mall Pop-up",
    venue_address: "Uganda Road, Pioneers Mall, Eldoret",
    start_date: "2026-09-19",
    end_date: "2026-09-20",
    total_slots: 12,
    booked_slots: 0,
    status: "upcoming",
    is_featured: false,
  },
];

const TATTOO_STYLES = [
  { value: "traditional",     label: "Traditional" },
  { value: "neo_traditional", label: "Neo-Traditional" },
  { value: "geometric",       label: "Geometric" },
  { value: "fine_line",       label: "Fine Line" },
  { value: "blackwork",       label: "Blackwork" },
  { value: "realism",         label: "Realism" },
  { value: "watercolour",     label: "Watercolour" },
  { value: "custom",          label: "Custom" },
];

const TATTOO_SIZES = [
  { value: "small",     label: "Small" },
  { value: "medium",    label: "Medium" },
  { value: "large",     label: "Large" },
  { value: "sleeve",    label: "Sleeve" },
  { value: "full_back", label: "Full Back" },
];

const fieldBase =
  "w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-4 py-3 text-sm text-stone-50 placeholder-stone-50/30 outline-none transition-all duration-150 focus:border-hazard";

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const sStr = s.toLocaleDateString("en-KE", opts);
  const eStr = e.toLocaleDateString("en-KE", opts);
  const year = e.getFullYear();
  if (sStr === eStr) return `${sStr} ${year}`;
  return `${sStr} – ${eStr} ${year}`;
}

function slotsLeft(t: TourDate): number {
  return Math.max(0, t.total_slots - t.booked_slots);
}

function statusLabel(t: TourDate): { text: string; className: string } {
  const left = slotsLeft(t);
  if (t.status === "sold_out" || left === 0)
    return { text: "Sold Out", className: "bg-stone-50/10 text-stone-50/40" };
  if (t.status === "upcoming")
    return { text: "Coming Soon", className: "bg-cobalt/20 text-cobalt" };
  if (left <= 3)
    return { text: `${left} left!`, className: "bg-hazard/20 text-hazard" };
  return { text: `${left} slots`, className: "bg-lime/10 text-lime" };
}

// ── City Card ────────────────────────────────────────────────────────────────
function TourCityCard({
  tourDate,
  onBook,
}: {
  tourDate: TourDate;
  onBook: (td: TourDate) => void;
}) {
  const left = slotsLeft(tourDate);
  const isSoldOut = tourDate.status === "sold_out" || left === 0;
  const sl = statusLabel(tourDate);
  const pct = Math.round((tourDate.booked_slots / tourDate.total_slots) * 100);

  return (
    <motion.div
      whileHover={!isSoldOut ? { y: -4 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-stone-50/[0.03] p-6 transition-all",
        tourDate.is_featured
          ? "border-hazard/30 lg:col-span-2"
          : "border-stone-50/10",
        isSoldOut && "opacity-60"
      )}
    >
      {tourDate.is_featured && (
        <span className="absolute right-4 top-4 rounded-full bg-hazard px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">
          Featured
        </span>
      )}

      {/* City name */}
      <p className="font-mono text-xs uppercase tracking-widest text-stone-50/40">
        Kenya Tour 2026
      </p>
      <h3
        className={cn(
          "mt-1 font-display uppercase tracking-tight leading-none",
          tourDate.is_featured ? "text-6xl sm:text-7xl" : "text-5xl"
        )}
      >
        {tourDate.city}
      </h3>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-50/60">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {formatDateRange(tourDate.start_date, tourDate.end_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={13} />
          {tourDate.venue}
        </span>
      </div>

      {tourDate.venue_address && (
        <p className="mt-1 text-xs text-stone-50/30">{tourDate.venue_address}</p>
      )}

      {/* Capacity bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-stone-50/40">
            <Users size={11} />
            {tourDate.booked_slots} / {tourDate.total_slots} booked
          </span>
          <span className={cn("rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest", sl.className)}>
            {sl.text}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-stone-50/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className={cn(
              "h-full rounded-full",
              pct >= 80 ? "bg-hazard" : "bg-lime/70"
            )}
          />
        </div>
      </div>

      <button
        id={`book-${tourDate.city.toLowerCase()}`}
        onClick={() => !isSoldOut && onBook(tourDate)}
        disabled={isSoldOut}
        className={cn(
          "mt-6 w-full rounded-xl py-3.5 font-display text-sm uppercase tracking-wide transition-all",
          isSoldOut
            ? "cursor-not-allowed border border-stone-50/10 text-stone-50/30"
            : "bg-hazard text-white hover:scale-[1.02] hover:bg-hazard/90"
        )}
      >
        {isSoldOut ? "Fully Booked" : `Book ${tourDate.city} →`}
      </button>
    </motion.div>
  );
}

// ── Tour Booking Modal ───────────────────────────────────────────────────────
function TourBookingModal({
  tourDate,
  onClose,
}: {
  tourDate: TourDate;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TourBookingForm>({
    full_name: "",
    phone: "",
    email: "",
    tattoo_style: "",
    tattoo_size: "",
    body_placement: "",
    design_description: "",
    has_reference_art: false,
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TourBookingForm, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (field: keyof TourBookingForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!/^0[0-9]{9}$/.test(form.phone.trim().replace(/\s/g, "")))
      e.phone = "Enter a valid Kenyan number";
    if (!form.tattoo_style) e.tattoo_style = "Pick a style";
    if (!form.tattoo_size) e.tattoo_size = "Pick a size";
    if (!form.body_placement.trim()) e.body_placement = "Required";
    if (!form.design_description.trim()) e.design_description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    setApiError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          booking_type: "tour",
          tour_date_id: tourDate.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setBookingRef(data.booking?.booking_ref ?? null);
      setStatus("success");
    } catch {
      setApiError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative z-10 w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-ink border border-stone-50/10 p-6 sm:rounded-2xl sm:p-8 max-h-[90vh]"
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-hazard">
              Tour Booking
            </p>
            <h3 className="mt-1 font-display text-3xl uppercase tracking-tight">
              {tourDate.city}
            </h3>
            <p className="mt-1 text-sm text-stone-50/50">
              {tourDate.venue} · {formatDateRange(tourDate.start_date, tourDate.end_date)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-full p-2 hover:bg-stone-50/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-hazard/20">
              <CheckCircle2 size={28} className="text-hazard" />
            </div>
            <div>
              <h4 className="font-display text-2xl uppercase">You're in!</h4>
              {bookingRef && (
                <p className="mt-1 font-mono text-sm text-stone-50/50">
                  Ref: <span className="text-hazard">{bookingRef}</span>
                </p>
              )}
              <p className="mt-3 max-w-sm text-sm text-stone-50/60">
                We'll hit you on WhatsApp within 24 hours to confirm your{" "}
                {tourDate.city} slot and next steps.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 font-mono text-xs uppercase tracking-widest text-stone-50/50 hover:text-stone-50 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Personal details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
                  Full Name <span className="text-hazard">*</span>
                </label>
                <input
                  id="tour-full-name"
                  type="text"
                  placeholder="Amara Ngugi"
                  value={form.full_name}
                  onChange={set("full_name")}
                  className={cn(fieldBase, errors.full_name && "border-hazard/60")}
                />
                {errors.full_name && (
                  <p className="mt-1 font-mono text-[10px] text-hazard">{errors.full_name}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
                  Phone <span className="text-hazard">*</span>
                </label>
                <input
                  id="tour-phone"
                  type="tel"
                  placeholder="0712 345 678"
                  value={form.phone}
                  onChange={set("phone")}
                  className={cn(fieldBase, errors.phone && "border-hazard/60")}
                />
                {errors.phone && (
                  <p className="mt-1 font-mono text-[10px] text-hazard">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Style & size */}
            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
                Tattoo Style <span className="text-hazard">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TATTOO_STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, tattoo_style: s.value }));
                      setErrors((er) => ({ ...er, tattoo_style: undefined }));
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-all",
                      form.tattoo_style === s.value
                        ? "border-hazard bg-hazard/20 text-hazard"
                        : "border-stone-50/15 text-stone-50/50 hover:border-stone-50/30"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {errors.tattoo_style && (
                <p className="mt-1 font-mono text-[10px] text-hazard">{errors.tattoo_style}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
                Size <span className="text-hazard">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TATTOO_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, tattoo_size: s.value }));
                      setErrors((er) => ({ ...er, tattoo_size: undefined }));
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-all",
                      form.tattoo_size === s.value
                        ? "border-hazard bg-hazard/20 text-hazard"
                        : "border-stone-50/15 text-stone-50/50 hover:border-stone-50/30"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {errors.tattoo_size && (
                <p className="mt-1 font-mono text-[10px] text-hazard">{errors.tattoo_size}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
                Body Placement <span className="text-hazard">*</span>
              </label>
              <input
                id="tour-placement"
                type="text"
                placeholder="e.g. Left shoulder, ankle"
                value={form.body_placement}
                onChange={set("body_placement")}
                className={cn(fieldBase, errors.body_placement && "border-hazard/60")}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
                Describe your design idea <span className="text-hazard">*</span>
              </label>
              <textarea
                id="tour-description"
                rows={3}
                placeholder="Symbols, mood, references — be as detailed as you like"
                value={form.design_description}
                onChange={set("design_description")}
                className={cn(fieldBase, "resize-none", errors.design_description && "border-hazard/60")}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
                Additional notes
              </label>
              <textarea
                id="tour-notes"
                rows={2}
                placeholder="Anything else we should know?"
                value={form.notes}
                onChange={set("notes")}
                className={cn(fieldBase, "resize-none")}
              />
            </div>

            <AnimatePresence>
              {status === "error" && apiError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 rounded-xl border border-hazard/30 bg-hazard/10 p-3 text-sm text-stone-50/80"
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-hazard" />
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              id="tour-submit-btn"
              disabled={status === "submitting"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-hazard py-4 font-display text-sm uppercase tracking-wide text-white transition-all hover:bg-hazard/90 disabled:opacity-60"
            >
              {status === "submitting" && <Loader2 size={16} className="animate-spin" />}
              {status === "submitting" ? "Booking..." : `Secure my spot in ${tourDate.city}`}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function TourDates() {
  const [tourDates, setTourDates] = useState<TourDate[]>(FALLBACK_TOUR_DATES);
  const [selectedTour, setSelectedTour] = useState<TourDate | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (d.tourDates?.length > 0) setTourDates(d.tourDates);
      })
      .catch(() => {/* keep fallback */});
  }, []);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tourDates.map((td, i) => (
          <motion.div
            key={td.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className={td.is_featured ? "sm:col-span-2 lg:col-span-2" : ""}
          >
            <TourCityCard tourDate={td} onBook={setSelectedTour} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTour && (
          <TourBookingModal
            tourDate={selectedTour}
            onClose={() => setSelectedTour(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
