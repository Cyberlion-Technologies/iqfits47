"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, Smartphone, ShieldCheck } from "lucide-react";
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
  pay_deposit: boolean;
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

const fieldBase =
  "w-full rounded-xl border border-stone-50/10 bg-stone-50/5 px-4 py-3 text-sm text-stone-50 placeholder-stone-50/30 outline-none transition-all duration-150 focus:border-hazard focus:bg-stone-50/8";

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
    pay_deposit: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "stk_sent" | "success" | "error">("idle");
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [stkMessage, setStkMessage] = useState<string | null>(null);
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
    if (!/^(?:254|0|\+254)?[71]\d{8}$/.test(form.phone.trim().replace(/\s/g, "")))
      e.phone = "Enter a valid Safaricom number (e.g. 0712345678)";
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
        body: JSON.stringify({ ...form, booking_type: "studio", deposit_amount: 1000 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setBookingRef(data.booking?.booking_ref ?? null);
      if (data.payment?.success) {
        setStkMessage(data.payment.message || "STK Push prompt sent to your Safaricom phone!");
        setStatus("stk_sent");
      } else {
        setStatus("success");
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  // ── Success / STK state ──────────────────────────────────────────────────
  if (status === "stk_sent" || status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-hazard/30 bg-hazard/5 px-6 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hazard/20">
          {status === "stk_sent" ? (
            <Smartphone size={32} className="text-hazard animate-bounce" />
          ) : (
            <CheckCircle2 size={32} className="text-hazard" />
          )}
        </div>
        <div>
          <h3 className="font-display text-3xl uppercase tracking-tight">
            {status === "stk_sent" ? "M-Pesa STK Push Sent!" : "Booking Received!"}
          </h3>
          {bookingRef && (
            <p className="mt-2 font-mono text-sm text-stone-50/50">
              Ref: <span className="text-hazard font-bold">{bookingRef}</span>
            </p>
          )}
          {stkMessage && (
            <div className="mt-4 rounded-xl border border-hazard/30 bg-hazard/10 p-4 font-mono text-xs text-hazard">
              {stkMessage}
            </div>
          )}
          <p className="mt-4 max-w-sm text-sm text-stone-50/60">
            {status === "stk_sent"
              ? "Please check your phone and enter your M-Pesa PIN to complete your KES 1,000 booking deposit. Our studio lead will confirm your time slot on IG/WhatsApp."
              : "We'll review your request and hit you on WhatsApp within 24 hours to confirm your slot and details."}
          </p>
        </div>
        <a
          href="https://www.instagram.com/47.studio._/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs uppercase tracking-widest text-hazard underline-offset-4 hover:underline"
        >
          Follow @47.studio._ on Instagram →
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-8 lg:grid-cols-2">
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
                  type="text"
                  placeholder="e.g. Amara Ngugi"
                  value={form.full_name}
                  onChange={set("full_name")}
                  className={cn(fieldBase, errors.full_name && "border-hazard/60")}
                />
                <FieldError msg={errors.full_name} />
              </div>
              <div>
                <Label required>Safaricom Phone (M-Pesa)</Label>
                <input
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
              </div>
              <div>
                <Label>Preferred Time Slot</Label>
                <select
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

          {/* M-Pesa Booking Fee Deposit Option */}
          <div className="rounded-2xl border border-hazard/30 bg-hazard/5 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck size={18} className="text-hazard" />
                Booking Deposit (M-Pesa)
              </h3>
              <span className="font-mono text-sm font-bold text-hazard">KES 1,000</span>
            </div>
            <p className="mt-2 text-xs text-stone-50/60 leading-relaxed font-body">
              Lock in your date &amp; time slot immediately via Safaricom M-Pesa STK Push. The deposit is fully credited toward your tattoo session cost.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="pay_deposit_toggle"
                checked={form.pay_deposit}
                onChange={(e) => setForm((f) => ({ ...f, pay_deposit: e.target.checked }))}
                className="h-4 w-4 rounded accent-hazard cursor-pointer"
              />
              <label htmlFor="pay_deposit_toggle" className="font-mono text-xs text-stone-50/80 cursor-pointer">
                Send M-Pesa STK Push for KES 1,000 booking deposit now
              </label>
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
                      onClick={() => {
                        setForm((f) => ({ ...f, tattoo_style: s.value }));
                        setErrors((er) => ({ ...er, tattoo_style: undefined }));
                      }}
                      className={cn(
                        "rounded-lg border px-3.5 py-2 font-mono text-xs uppercase tracking-wide transition-all min-h-[44px]",
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
                      onClick={() => {
                        setForm((f) => ({ ...f, tattoo_size: s.value }));
                        setErrors((er) => ({ ...er, tattoo_size: undefined }));
                      }}
                      className={cn(
                        "rounded-lg border px-3.5 py-2 font-mono text-xs uppercase tracking-wide transition-all min-h-[44px]",
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
                  rows={4}
                  placeholder="Describe your tattoo idea — motifs, symbols, mood, references..."
                  value={form.design_description}
                  onChange={set("design_description")}
                  className={cn(fieldBase, "resize-none", errors.design_description && "border-hazard/60")}
                />
                <FieldError msg={errors.design_description} />
              </div>

              <div>
                <Label>Additional Notes</Label>
                <textarea
                  rows={2}
                  placeholder="Allergies, scheduling constraints..."
                  value={form.notes}
                  onChange={set("notes")}
                  className={cn(fieldBase, "resize-none")}
                />
              </div>
            </div>
          </div>

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
            disabled={status === "submitting"}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-hazard py-4 min-h-[50px] font-display text-sm uppercase tracking-wide text-white transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-hazard/20"
          >
            {status === "submitting" ? <Loader2 size={18} className="animate-spin" /> : null}
            {status === "submitting" ? "Processing..." : form.pay_deposit ? "Pay Deposit (KES 1,000) & Book Session" : "Request Studio Session"}
          </button>
        </div>
      </div>
    </form>
  );
}
