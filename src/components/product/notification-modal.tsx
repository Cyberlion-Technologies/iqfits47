"use client";

import { useState } from "react";
import { X, Bell, Mail, Phone, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  selectedSize?: string;
  type: "back-in-stock" | "price-drop";
  currentPrice: number;
}

export function NotificationModal({
  isOpen,
  onClose,
  productName,
  productId,
  selectedSize,
  type,
  currentPrice,
}: NotificationModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pref, setPref] = useState<"whatsapp" | "email">("whatsapp");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Supabase/API save:
    // In a real build, we'd do a supabase.from("product_alerts").insert(...)
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setPhone("");
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-md rounded-2xl bg-stone-50 p-6 shadow-2xl md:top-[20%] max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="text-hazard" size={20} />
                <h3 className="font-display text-lg uppercase tracking-tight">
                  {type === "back-in-stock" ? "Back in Stock" : "Price Drop Alert"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 hover:bg-ink/5"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-ink/50 leading-relaxed">
                    {type === "back-in-stock" ? (
                      <>
                        Get notified instantly when size **EU {selectedSize}** of **{productName}** is restocked.
                      </>
                    ) : (
                      <>
                        Set up an alert to know as soon as **{productName}** drops below its current price of **KES {currentPrice.toLocaleString()}**.
                      </>
                    )}
                  </p>

                  {/* Channel preference */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPref("whatsapp")}
                      className={`flex-1 border py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wide transition-all ${
                        pref === "whatsapp"
                          ? "border-ink bg-ink text-stone-50"
                          : "border-ink/10 bg-white hover:border-ink/30"
                      }`}
                    >
                      <Phone size={14} /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setPref("email")}
                      className={`flex-1 border py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wide transition-all ${
                        pref === "email"
                          ? "border-ink bg-ink text-stone-50"
                          : "border-ink/10 bg-white hover:border-ink/30"
                      }`}
                    >
                      <Mail size={14} /> Email
                    </button>
                  </div>

                  {/* Input field */}
                  {pref === "whatsapp" ? (
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-ink/55 block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0712345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none transition hover:border-ink/30 focus:border-ink"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-ink/55 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. custom@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none transition hover:border-ink/30 focus:border-ink"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-ink hover:bg-hazard text-stone-50 py-3 font-mono text-xs uppercase tracking-widest transition-colors rounded-lg mt-2"
                  >
                    Subscribe to Alert
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={24} />
                  </div>
                  <h4 className="mt-4 font-display text-lg uppercase tracking-wide">
                    Alert Set Successfully
                  </h4>
                  <p className="mt-2 text-xs text-ink/50 max-w-xs mx-auto leading-relaxed">
                    We have saved your preference. We'll message you via{" "}
                    {pref === "whatsapp" ? `WhatsApp at ${phone}` : `Email at ${email}`} as soon as we drop updates.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      onClose();
                    }}
                    className="mt-6 border border-ink/20 hover:border-ink/40 px-6 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors rounded-lg"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
