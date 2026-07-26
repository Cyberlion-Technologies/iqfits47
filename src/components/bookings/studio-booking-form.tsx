"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  full_name: string;
  phone: string;
  email: string;
  tattoo_style: string;
  tattoo_size: string;
  body_placement: string;
  design_description: string;
  has_reference_art: boolean;
  preferred_date: string;
  preferred_time: string;
  notes: string;
}

const TATTOO_STYLES = [
  { value: "traditional",     label: "Traditional" },
  { value: "neo_traditional", label: "Neo-Traditional" },
  { value: "geometric",       label: "Geometric" },
  { value: "fine_line",       label: "Fine Line" },
  { value: "blackwork",       label: "Blackwork" },
  { value: "realism",         label: "Realism" },
  { value: "watercolour",     label: "Watercolour" },
  { value: "custom",          label: "Custom / Other" },
];

const TATTOO_SIZES = [
  { value: "small",      label: "Small (coin-sized)" },
  { value: "medium",     label: "Medium (palm-sized)" },
  { value: "large",      label: "Large (forearm / calf)" },
  { value: "sleeve",     label: "Sleeve" },
  { value: "full_back",  label: "Full Back Piece" },
];

const TIME_SLOTS = [
  { value: "morning",   label: "Morning (9 am – 12 pm)" },
  { value: "afternoon", label: "Afternoon (12 pm – 5 pm)" },
  { value: "evening",   label: "Evening (5 pm – 8 pm)" },
];

const MIN_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 3); // At least 3 days notice
  return d.toISOString().split("T")[0];
})();

// ── Shared input classes ─────────────────────────────────────────────────────
const fieldBase =
  "w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-4 py-3 text-sm text-stone-50 placeholder-stone-50/30 outline-none transition-all duration-150 focus:border-hazard focus:bg-stone-50/8";

// ── Sub-components ───────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-stone-50/50">
      {children}
      {required && <span className="ml-1 text-hazard">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 font-mono text-[11px] text-hazard">
      <AlertCircle size={10} />
      {msg}
    </p>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export function StudioBookingForm() {
  const [form, setForm] = useState<FormState>({
    full_name: "",
    phone: "",
    email: "",
    tattoo_style: "",
    tattoo_size: "",
    body_placement: "",
    design_description: "",
    has_reference_art: false,
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!/^0[0-9]{9}$/.test(form.phone.trim().replace(/\s/g, "")))
      e.phone = "Enter a valid Kenyan number (e.g. 0712345678)";
    if (!form.tattoo_style) e.tattoo_style = "Pick a style";
    if (!form.tattoo_size) e.tattoo_size = "Pick a size";
    if (!form.body_placement.trim()) e.body_placement = "Required";
    if (!form.design_description.trim()) e.design_description = "Required";
    if (!form.preferred_date) e.preferred_date = "Required";
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
        body: JSON.stringify({ ...form, booking_type: "studio" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setBookingRef(data.booking?.booking_ref ?? null);
      setStatus("success");
    } catch {
      setApiError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-hazard/30 bg-hazard/5 px-6 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hazard/20">
          <CheckCircle2 size={32} className="text-hazard" />
        </div>
        <div>
          <h3 className="font-display text-3xl uppercase tracking-tight">
            Booking Received!
          </h3>
          {bookingRef && (
            <p className="mt-2 font-mono text-sm text-stone-50/50">
              Ref: <span className="text-hazard">{bookingRef}</span>
            </p>
          )}
          <p className="mt-4 max-w-sm text-sm text-stone-50/60">
            We'll review your request and hit you on WhatsApp within 24 hours to
            confirm your slot and discuss deposit details.
          </p>
        </div>
        <a
          href="https://www.instagram.com/47.studio._/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs uppercase tracking-widest text-hazard underline-offset-4 hover:underline"
        >
          Follow @47.studio._ for updates →
        </a>
      </motion.div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left col — personal + tattoo details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-6 sm:p-8">
            <h3 className="mb-6 font-display text-xl uppercase tracking-wide">
              Your Details
            </h3>
            <div className="space-y-5">
              <div>
                <Label required>Full Name</Label>
                <input
                  id="studio-full-name"
                  type="text"
                  placeholder="e.g. Amara Ngugi"
                  value={form.full_name}
                  onChange={set("full_name")}
                  className={cn(fieldBase, errors.full_name && "border-hazard/60")}
                />
                <FieldError msg={errors.full_name} />
              </div>
              <div>
                <Label required>Phone Number</Label>
                <input
                  id="studio-phone"
                  type="tel"
                  placeholder="0712 345 678"
                  value={form.phone}
                  onChange={set("phone")}
                  className={cn(fieldBase, errors.phone && "border-hazard/60")}
                />
                <FieldError msg={errors.phone} />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <input
                  id="studio-email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={set("email")}
                  className={fieldBase}
                />
              </div>
            </div>
          </div>

          {/* Date & time */}
          <div className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-6 sm:p-8">
            <h3 className="mb-6 font-display text-xl uppercase tracking-wide">
              Preferred Date
            </h3>
            <div className="space-y-5">
              <div>
                <Label required>Date</Label>
                <input
                  id="studio-date"
                  type="date"
                  min={MIN_DATE}
                  value={form.preferred_date}
                  onChange={set("preferred_date")}
                  className={cn(
                    fieldBase,
                    "appearance-none [color-scheme:dark]",
                    errors.preferred_date && "border-hazard/60"
                  )}
                />
                <FieldError msg={errors.preferred_date} />
                <p className="mt-1.5 font-mono text-[10px] text-stone-50/30">
                  Minimum 3 days' notice required.
                </p>
              </div>
              <div>
                <Label>Preferred Time Slot</Label>
                <select
                  id="studio-time"
                  value={form.preferred_time}
                  onChange={set("preferred_time")}
                  className={cn(fieldBase, "cursor-pointer")}
                >
                  <option value="">No preference</option>
                  {TIME_SLOTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right col — tattoo info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-6 sm:p-8">
            <h3 className="mb-6 font-display text-xl uppercase tracking-wide">
              Tattoo Details
            </h3>
            <div className="space-y-5">
              {/* Style chips */}
              <div>
                <Label required>Style</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TATTOO_STYLES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      id={`style-${s.value}`}
                      onClick={() => {
                        setForm((f) => ({ ...f, tattoo_style: s.value }));
                        setErrors((er) => ({ ...er, tattoo_style: undefined }));
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-all",
                        form.tattoo_style === s.value
                          ? "border-hazard bg-hazard/20 text-hazard"
                          : "border-stone-50/15 text-stone-50/50 hover:border-stone-50/30 hover:text-stone-50/80"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <FieldError msg={errors.tattoo_style} />
              </div>

              {/* Size chips */}
              <div>
                <Label required>Size</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TATTOO_SIZES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      id={`size-${s.value}`}
                      onClick={() => {
                        setForm((f) => ({ ...f, tattoo_size: s.value }));
                        setErrors((er) => ({ ...er, tattoo_size: undefined }));
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-all",
                        form.tattoo_size === s.value
                          ? "border-hazard bg-hazard/20 text-hazard"
                          : "border-stone-50/15 text-stone-50/50 hover:border-stone-50/30 hover:text-stone-50/80"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <FieldError msg={errors.tattoo_size} />
              </div>

              <div>
                <Label required>Body Placement</Label>
                <input
                  id="studio-placement"
                  type="text"
                  placeholder="e.g. Inner forearm, right side"
                  value={form.body_placement}
                  onChange={set("body_placement")}
                  className={cn(fieldBase, errors.body_placement && "border-hazard/60")}
                />
                <FieldError msg={errors.body_placement} />
              </div>

              <div>
                <Label required>Design Idea / Description</Label>
                <textarea
                  id="studio-description"
                  rows={4}
                  placeholder="Describe your tattoo idea — motifs, symbols, mood, references..."
                  value={form.design_description}
                  onChange={set("design_description")}
                  className={cn(
                    fieldBase,
                    "resize-none",
                    errors.design_description && "border-hazard/60"
                  )}
                />
                <FieldError msg={errors.design_description} />
              </div>

              {/* Reference art toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="studio-reference-toggle"
                  role="checkbox"
                  aria-checked={form.has_reference_art}
                  onClick={() =>
                    setForm((f) => ({ ...f, has_reference_art: !f.has_reference_art }))
                  }
                  className={cn(
                    "relative h-5 w-9 rounded-full border transition-all",
                    form.has_reference_art
                      ? "border-hazard bg-hazard"
                      : "border-stone-50/20 bg-stone-50/10"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                      form.has_reference_art ? "left-4" : "left-0.5"
                    )}
                  />
                </button>
                <span className="font-mono text-xs text-stone-50/50 uppercase tracking-wide">
                  I have reference images to share
                </span>
              </div>
              {form.has_reference_art && (
                <p className="font-mono text-[11px] text-stone-50/40">
                  After booking confirmation, send your references to us via WhatsApp — we'll
                  share the number when we confirm.
                </p>
              )}

              <div>
                <Label>Additional Notes</Label>
                <textarea
                  id="studio-notes"
                  rows={3}
                  placeholder="Allergies, scheduling constraints, questions..."
                  value={form.notes}
                  onChange={set("notes")}
                  className={cn(fieldBase, "resize-none")}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <AnimatePresence>
            {status === "error" && apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 rounded-xl border border-hazard/30 bg-hazard/10 p-4"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-hazard" />
                <p className="text-sm text-stone-50/80">{apiError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            id="studio-submit-btn"
            disabled={status === "submitting"}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-hazard py-4 font-display text-sm uppercase tracking-wide text-white transition-all hover:scale-[1.01] hover:bg-hazard/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            {status === "submitting" ? "Sending booking..." : "Request Studio Session"}
          </button>

          <p className="text-center font-mono text-[10px] uppercase tracking-widest text-stone-50/30">
            We'll confirm within 24 hrs via WhatsApp
          </p>
        </div>
      </div>
    </form>
  );
}
