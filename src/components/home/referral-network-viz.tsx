"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Animated network / sharing visual for the referral hero
// Shows a central node (you) connected to orbiting friend-nodes, with
// glowing connection lines and floating KES coin particles.
export function ReferralNetworkViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    // ── Config ────────────────────────────────────────────────────
    const HAZARD = "#FF5A1F";
    const LIME   = "#d4ff3d";
    const WHITE  = "rgba(244,242,237,";

    // Satellite nodes (friends + their sub-friends)
    const satellites = [
      { orbitR: 0.30, orbitSpeed: 0.42, size: 18, phase: 0,        label: "👟", earned: "KES 200" },
      { orbitR: 0.30, orbitSpeed: 0.35, size: 14, phase: 2.1,      label: "👗", earned: "KES 200" },
      { orbitR: 0.30, orbitSpeed: 0.50, size: 16, phase: 4.2,      label: "🧢", earned: "KES 200" },
      { orbitR: 0.48, orbitSpeed: 0.22, size: 11, phase: 0.8,      label: "✨", earned: ""        },
      { orbitR: 0.48, orbitSpeed: 0.18, size: 10, phase: 3.0,      label: "🔥", earned: ""        },
      { orbitR: 0.48, orbitSpeed: 0.25, size: 12, phase: 5.2,      label: "🎯", earned: ""        },
    ];

    // Floating coin particles
    type Coin = { x: number; y: number; vy: number; opacity: number; life: number; maxLife: number; scale: number };
    const coins: Coin[] = [];
    function spawnCoin(cx: number, cy: number) {
      coins.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy,
        vy: -(0.5 + Math.random() * 1.2),
        opacity: 1,
        life: 0,
        maxLife: 90 + Math.random() * 60,
        scale: 0.6 + Math.random() * 0.6,
      });
    }
    let coinTimer = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      // ── Background subtle radial glow ───────────────────────────
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bg.addColorStop(0, "rgba(255,90,31,0.06)");
      bg.addColorStop(1, "rgba(21,21,26,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Orbit rings ─────────────────────────────────────────────
      [0.30, 0.48].forEach((r) => {
        const rad = Math.min(W, H) * r;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,90,31,0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ── Compute satellite positions ──────────────────────────────
      const positions = satellites.map((s) => {
        const rad = Math.min(W, H) * s.orbitR;
        const angle = s.phase + t * s.orbitSpeed;
        return {
          x: cx + Math.cos(angle) * rad,
          y: cy + Math.sin(angle) * rad,
          ...s,
        };
      });

      // ── Connection lines (center → each satellite) ───────────────
      positions.forEach((p, i) => {
        const grad = ctx.createLinearGradient(cx, cy, p.x, p.y);
        const alpha = 0.25 + 0.2 * Math.sin(t * 1.5 + i);
        grad.addColorStop(0, `rgba(255,90,31,${alpha})`);
        grad.addColorStop(1, `rgba(212,255,61,${alpha * 0.5})`);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = i < 3 ? 1.5 : 0.8;
        ctx.stroke();

        // Moving dot along the line
        const progress = (t * 0.6 + i * 0.5) % 1;
        const dx = cx + (p.x - cx) * progress;
        const dy = cy + (p.y - cy) * progress;
        ctx.beginPath();
        ctx.arc(dx, dy, i < 3 ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = i < 3 ? HAZARD : LIME;
        ctx.fill();

        // Cross-link first-ring nodes to each other
        if (i === 1) {
          const p0 = positions[0];
          const grad2 = ctx.createLinearGradient(p0.x, p0.y, p.x, p.y);
          grad2.addColorStop(0, "rgba(212,255,61,0.1)");
          grad2.addColorStop(1, "rgba(212,255,61,0.1)");
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = grad2;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        if (i === 2) {
          const p0 = positions[0];
          const p1 = positions[1];
          [[p0, p], [p1, p]].forEach(([a, b]) => {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(212,255,61,0.08)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          });
        }
      });

      // ── Satellite nodes ──────────────────────────────────────────
      positions.forEach((p, i) => {
        const pulse = 1 + 0.08 * Math.sin(t * 2.5 + i * 1.2);
        const r = p.size * pulse;

        // Glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
        glow.addColorStop(0, i < 3 ? "rgba(255,90,31,0.35)" : "rgba(212,255,61,0.25)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = i < 3 ? "rgba(255,90,31,0.15)" : "rgba(21,21,26,0.6)";
        ctx.fill();
        ctx.strokeStyle = i < 3 ? HAZARD : `${LIME}99`;
        ctx.lineWidth = i < 3 ? 1.5 : 1;
        ctx.stroke();

        // Emoji
        ctx.font = `${r * 1.1}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.label, p.x, p.y);

        // Earned label on inner ring
        if (i < 3 && p.earned) {
          ctx.font = "bold 8px monospace";
          ctx.fillStyle = LIME;
          ctx.textAlign = "center";
          ctx.fillText(p.earned, p.x, p.y + r + 10);
        }
      });

      // ── Centre node (YOU) ────────────────────────────────────────
      const pulse = 1 + 0.06 * Math.sin(t * 2);
      const CR = 32 * pulse;

      // Glow rings
      [CR * 2.5, CR * 1.7].forEach((gr, gi) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
        g.addColorStop(0, gi === 0 ? "rgba(255,90,31,0.12)" : "rgba(255,90,31,0.25)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, gr, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Rotating border
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, CR + 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,90,31,0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Fill
      ctx.beginPath();
      ctx.arc(cx, cy, CR, 0, Math.PI * 2);
      ctx.fillStyle = "#15151A";
      ctx.fill();
      ctx.strokeStyle = HAZARD;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = `bold 11px monospace`;
      ctx.fillStyle = WHITE + "0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOU", cx, cy - 7);
      ctx.font = `bold 9px monospace`;
      ctx.fillStyle = LIME;
      ctx.fillText("EARN", cx, cy + 7);

      // ── Floating coin particles ───────────────────────────────────
      coinTimer++;
      if (coinTimer > 45) {
        // Spawn from each inner-ring satellite
        positions.slice(0, 3).forEach((p) => spawnCoin(p.x, p.y));
        coinTimer = 0;
      }

      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.y += c.vy;
        c.life++;
        c.opacity = 1 - c.life / c.maxLife;
        if (c.life >= c.maxLife) { coins.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = c.opacity * 0.85;
        ctx.translate(c.x, c.y);
        ctx.scale(c.scale, c.scale);
        ctx.font = "14px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💰", 0, 0);
        ctx.restore();
      }

      t += 0.008;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Subtle noise/grain overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-grain rounded-2xl" />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
      {/* Bottom legend */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-stone-50/10 bg-stone-50/5 px-5 py-2.5 backdrop-blur-sm"
      >
        <span className="font-mono text-[9px] uppercase tracking-widest text-stone-50/40">
          Every link you share
        </span>
        <span className="text-hazard">→</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-hazard">
          KES in your pocket
        </span>
      </motion.div>
    </div>
  );
}
