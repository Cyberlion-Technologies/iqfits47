"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import { Turnstile } from "@/components/admin/Turnstile";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, turnstileToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid passcode");
        if (siteKey) {
          setTurnstileToken("");
          setResetKey((prev) => prev + 1);
        }
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Couldn't reach the server.");
      if (siteKey) {
        setTurnstileToken("");
        setResetKey((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-ink/10 bg-white p-8 shadow-xl shadow-ink/5"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-hazard/10 text-hazard">
            <ShieldAlert size={24} />
          </div>
          <h1 className="font-display text-2xl uppercase tracking-tight text-ink">
            Admin Portal
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Enter your admin passcode to access dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-ink/50 mb-1.5">
              Admin Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••••••"
              className="input text-center text-lg tracking-widest"
              required
              autoFocus
            />
          </div>

          {siteKey && (
            <Turnstile
              key={resetKey}
              siteKey={siteKey}
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken("")}
              onExpire={() => setTurnstileToken("")}
            />
          )}

          {error && (
            <p className="rounded-xl bg-hazard-100 px-4 py-3 text-center text-sm font-medium text-hazard">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (!!siteKey && !turnstileToken)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 font-display text-sm uppercase tracking-wide text-stone-50 hover:bg-ink/90 transition-transform active:scale-[1.01] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Access Console <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
