"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatKES, isValidMpesaPhone } from "@/lib/utils";
import { Order } from "@/lib/types";
import { OrderTimeline } from "@/components/order/order-timeline";
import { supabase } from "@/lib/supabase/client";

const KENYAN_COUNTIES = [
  "Nairobi", "Kiambu", "Machakos", "Kajiado", "Nakuru", "Mombasa", "Kisumu",
  "Uasin Gishu", "Kiambu (Thika)", "Nyeri", "Meru", "Embu", "Kakamega",
  "Kilifi", "Kirinyaga", "Murang'a", "Laikipia", "Bungoma", "Other",
].sort();

type Phase = "form" | "submitting" | "awaiting-payment" | "success" | "failed";

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clearCart = useCart((s) => s.clear);

  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    county: "Nairobi",
    town: "",
    addressLine: "",
    notes: "",
  });

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (error || !data) {
        setCouponError("Invalid or expired coupon code.");
        setAppliedDiscount(null);
      } else {
        setAppliedDiscount({
          code: data.code,
          percent: data.discount_percent || 0,
        });
        setCouponCode("");
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedDiscount(null);
    setCouponError("");
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (lines.length === 0 && phase === "form") {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl uppercase tracking-tight">Your bag is empty</h1>
        <p className="mt-2 text-sm text-ink/50">Add something before checking out.</p>
      </div>
    );
  }

  const deliveryFeeEstimate =
    subtotal >= 15000 ? 0 : /nairobi|kiambu/i.test(form.county) ? 300 : 500;
  const discountAmount = appliedDiscount ? Math.round((subtotal * appliedDiscount.percent) / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount) + deliveryFeeEstimate;

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!isValidMpesaPhone(form.phone)) {
      setErrorMsg("Enter a valid Safaricom number, e.g. 0712345678.");
      return;
    }
    if (!form.fullName || !form.addressLine || !form.town) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setPhase("submitting");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            brand: l.brand,
            image: l.image,
            size: l.size,
            quantity: l.quantity,
            price: l.price,
          })),
          delivery: form,
          promoCode: appliedDiscount ? appliedDiscount.code : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setPhase("failed");
        return;
      }

      setOrder(data.order);
      setPhase("awaiting-payment");
      startPolling(data.order.orderNumber);
    } catch {
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
      setPhase("failed");
    }
  }

  function startPolling(orderNumber: string) {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/status?order=${orderNumber}`);
        const data = await res.json();

        if (data.status === "success") {
          if (pollRef.current) clearInterval(pollRef.current);
          setOrder(data.order);
          setPhase("success");
          clearCart();
        } else if (data.status === "failed" || data.status === "cancelled") {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMsg(
            data.status === "cancelled"
              ? "Payment was cancelled on your phone."
              : "Payment failed. Please try again."
          );
          setPhase("failed");
        }
      } catch {
        // transient network hiccup — keep polling
      }

      if (attempts > 40 && pollRef.current) {
        clearInterval(pollRef.current);
        setErrorMsg("We didn't get confirmation in time. Check your M-Pesa messages, or try again.");
        setPhase("failed");
      }
    }, 3000);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {phase === "form" || phase === "submitting" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-10 lg:grid-cols-3"
          >
            <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
              <div>
                <h1 className="font-display text-3xl uppercase tracking-tight">Checkout</h1>
                <p className="mt-1 text-sm text-ink/50">
                  Enter your delivery details — payment is a quick M-Pesa prompt on the next step.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required>
                  <input
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="input"
                    placeholder="Jane Wanjiru"
                    required
                  />
                </Field>
                <Field label="M-Pesa phone number" required>
                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="input"
                    placeholder="0712 345 678"
                    inputMode="tel"
                    required
                  />
                </Field>
              </div>

              <Field label="Email (optional)">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input"
                  placeholder="jane@email.com"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="County" required>
                  <select
                    value={form.county}
                    onChange={(e) => updateField("county", e.target.value)}
                    className="input"
                  >
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Town / Area" required>
                  <input
                    value={form.town}
                    onChange={(e) => updateField("town", e.target.value)}
                    className="input"
                    placeholder="Section 9, Thika"
                    required
                  />
                </Field>
              </div>

              <Field label="Delivery address" required>
                <input
                  value={form.addressLine}
                  onChange={(e) => updateField("addressLine", e.target.value)}
                  className="input"
                  placeholder="House / building, street"
                  required
                />
              </Field>

              <Field label="Delivery notes (optional)">
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="input min-h-20"
                  placeholder="Landmark, gate code, preferred delivery time..."
                />
              </Field>

              {errorMsg && (
                <p className="rounded-xl bg-hazard-100 px-4 py-3 text-sm font-medium text-hazard">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={phase === "submitting"}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-hazard py-4 font-display text-sm uppercase tracking-wide text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {phase === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Placing order...
                  </>
                ) : (
                  <>
                    <Smartphone size={16} /> Pay {formatKES(total)} with M-Pesa
                  </>
                )}
              </button>
            </form>

            <div className="ticket-notch relative h-fit rounded-3xl border-2 border-dashed border-ink/15 bg-stone-100 p-6">
              <h2 className="font-display text-lg uppercase tracking-tight">Order summary</h2>
              <div className="mt-4 space-y-3">
                {lines.map((l) => (
                  <div key={`${l.productId}-${l.size}`} className="flex justify-between text-sm">
                    <span className="text-ink/70">
                      {l.name} · {l.size} × {l.quantity}
                    </span>
                    <span className="font-mono">{formatKES(l.price * l.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="mt-6 border-t border-ink/15 pt-4">
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1.5">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="E.G. WELCOME10"
                    className="input h-10 py-1 text-sm font-mono uppercase bg-transparent border border-ink/20 rounded-xl px-3 flex-1"
                    disabled={!!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="rounded-xl bg-ink/10 px-4 text-xs font-mono uppercase hover:bg-hazard hover:text-white transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                      className="rounded-xl bg-ink px-4 text-xs font-mono uppercase text-stone-50 hover:bg-hazard disabled:opacity-50 transition-colors"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="mt-1.5 text-xs text-hazard font-medium">{couponError}</p>
                )}
                {appliedDiscount && (
                  <p className="mt-1.5 text-xs text-emerald-600 font-medium">
                    Code {appliedDiscount.code} applied! ({appliedDiscount.percent}% off)
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-1.5 border-t border-ink/15 pt-4 font-mono text-sm">
                <div className="flex justify-between text-ink/60">
                  <span>Subtotal</span>
                  <span>{formatKES(subtotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount (-{appliedDiscount.percent}%)</span>
                    <span>-{formatKES(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink/60">
                  <span>Delivery</span>
                  <span>{deliveryFeeEstimate === 0 ? "Free" : formatKES(deliveryFeeEstimate)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatKES(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : phase === "awaiting-payment" ? (
          <motion.div
            key="awaiting"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md py-16 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-hazard/10"
            >
              <Smartphone size={28} className="text-hazard" />
            </motion.div>
            <h1 className="font-display text-2xl uppercase tracking-tight">Check your phone</h1>
            <p className="mt-2 text-sm text-ink/60">
              We sent an M-Pesa prompt to <strong>{form.phone}</strong>. Enter
              your PIN to complete the payment of {formatKES(total)}.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink/40">
              <Loader2 size={16} className="animate-spin" /> Waiting for confirmation...
            </div>
            {order && (
              <p className="mt-4 font-mono text-xs text-ink/40">
                Order {order.orderNumber}
              </p>
            )}
          </motion.div>
        ) : phase === "success" && order ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg py-10"
          >
            <div className="mb-6 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-hazard" />
              <h1 className="font-display text-3xl uppercase tracking-tight">Payment received</h1>
              <p className="mt-1 text-sm text-ink/50">
                Save your order number to track delivery anytime.
              </p>
            </div>
            <OrderTimeline order={order} />
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => router.push("/shop")}
                className="rounded-full border border-ink/15 px-6 py-3 font-display text-sm uppercase tracking-wide"
              >
                Continue shopping
              </button>
              <button
                onClick={() => router.push("/track-order")}
                className="rounded-full bg-ink px-6 py-3 font-display text-sm uppercase tracking-wide text-stone-50"
              >
                Track this order
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="failed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md py-16 text-center"
          >
            <XCircle size={40} className="mx-auto mb-3 text-hazard" />
            <h1 className="font-display text-2xl uppercase tracking-tight">Payment not completed</h1>
            <p className="mt-2 text-sm text-ink/60">{errorMsg}</p>
            <button
              onClick={() => {
                setPhase("form");
                setErrorMsg("");
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-sm uppercase tracking-wide text-stone-50"
            >
              <ArrowLeft size={16} /> Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/50">
        {label} {required && <span className="text-hazard">*</span>}
      </span>
      {children}
    </label>
  );
}
