"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

// Particle pool — plain typed arrays, no object allocation per frame
const MAX_P = 35;
const px  = new Float32Array(MAX_P);
const py  = new Float32Array(MAX_P);
const pvx = new Float32Array(MAX_P);
const pvy = new Float32Array(MAX_P);
const psz = new Float32Array(MAX_P);
const pop = new Float32Array(MAX_P);
const phue= new Float32Array(MAX_P);

function initParticles(W: number, H: number) {
  for (let i = 0; i < MAX_P; i++) {
    px[i]  = Math.random() * W;
    py[i]  = Math.random() * H;
    pvx[i] = (Math.random() - 0.5) * 0.3;
    pvy[i] = (Math.random() - 0.5) * 0.3;
    psz[i] = Math.random() * 1.4 + 0.5;
    pop[i] = Math.random() * 0.4 + 0.12;
    phue[i]= Math.random() * 60 + 240;
  }
}

// Pre-built grid canvas — only redrawn on resize, not every frame
function buildGrid(W: number, H: number, isDark: boolean): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const ctx = off.getContext("2d")!;
  const size = 80;
  const alpha = isDark ? 0.025 : 0.05;
  ctx.strokeStyle = isDark
    ? `rgba(200,190,255,${alpha})`
    : `rgba(40,30,20,${alpha})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath(); // single path for ALL lines
  for (let x = 0; x <= W; x += size) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 0; y <= H; y += size) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  return off;
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const raf   = useRef<number>();
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    let W = 0, H = 0;
    let gridCache: HTMLCanvasElement | null = null;
    let isDark = resolvedTheme !== "light";

    // Pre-compute particle fill colours as actual rgba strings (done once)
    const darkFills:  string[] = [];
    const lightFills: string[] = [];
    for (let i = 0; i < MAX_P; i++) {
      const a = pop[i] * 0.45;
      darkFills[i]  = `rgba(160,140,240,${a.toFixed(3)})`;
      lightFills[i] = `rgba(100,70,20,${(pop[i]*0.3).toFixed(3)})`;
    }

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      gridCache = buildGrid(W, H, isDark);
      initParticles(W, H);
    };

    // Rebuild grid when theme changes
    const rebuildGrid = () => {
      isDark = resolvedTheme !== "light";
      if (W > 0) gridCache = buildGrid(W, H, isDark);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }, { passive: true });

    // ── THROTTLE: target 30fps (16ms → 33ms per frame) ──
    let last = 0;
    let t    = 0;

    const draw = (now: number) => {
      raf.current = requestAnimationFrame(draw);
      if (now - last < 32) return; // ~30fps cap
      last = now;
      t += 0.003;

      ctx.clearRect(0, 0, W, H);

      // ── Orbs — pre-computed positions, single gradient each ──
      const orbData = [
        { bx: 0.15 + Math.sin(t * 0.7) * 0.08, by: 0.25 + Math.cos(t * 0.5) * 0.1, r: 0.36, a: isDark ? 0.13 : 0.14, h: isDark ? 258 : 22, s: isDark ? 68 : 82, l: isDark ? 40 : 54 },
        { bx: 0.82 + Math.cos(t * 0.6) * 0.07, by: 0.15 + Math.sin(t * 0.8) * 0.08, r: 0.26, a: isDark ? 0.09 : 0.10, h: isDark ? 300 : 350, s: isDark ? 58 : 72, l: isDark ? 37 : 50 },
        { bx: 0.55 + Math.sin(t * 0.4) * 0.11, by: 0.65 + Math.cos(t * 0.55) * 0.09, r: 0.30, a: isDark ? 0.07 : 0.09, h: isDark ? 200 : 195, s: isDark ? 52 : 68, l: isDark ? 34 : 48 },
      ];

      for (const o of orbData) {
        const cx = o.bx * W, cy = o.by * H, r = o.r * W;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `hsla(${o.h},${o.s}%,${o.l}%,${o.a})`);
        g.addColorStop(1, `hsla(${o.h},${o.s}%,${o.l}%,0)`);
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2); // draw ONLY the bounding box, not full screen
      }

      // ── Cached grid (blit, no re-draw) ──
      if (gridCache) ctx.drawImage(gridCache, 0, 0);

      // ── Particles ──
      const mx = mouse.current.x, my = mouse.current.y;
      const fills = isDark ? darkFills : lightFills;

      for (let i = 0; i < MAX_P; i++) {
        const dx = px[i] - mx, dy = py[i] - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) { // 120px radius (120²=14400)
          const dist = Math.sqrt(d2);
          const f = (120 - dist) / 120 * 0.25;
          pvx[i] += (dx / dist) * f;
          pvy[i] += (dy / dist) * f;
        }
        px[i] += pvx[i]; py[i] += pvy[i];
        pvx[i] *= 0.985; pvy[i] *= 0.985;
        if (px[i] < 0) px[i] = W; else if (px[i] > W) px[i] = 0;
        if (py[i] < 0) py[i] = H; else if (py[i] > H) py[i] = 0;

        ctx.beginPath();
        ctx.arc(px[i], py[i], psz[i], 0, 6.2832);
        ctx.fillStyle = fills[i];
        ctx.fill();
      }

      // ── Vignette — CSS handles this now, skip canvas vignette ──
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [resolvedTheme]);

  return (
    <>
      {/* Canvas for particles + grid + orbs */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* Vignette via CSS — zero GPU cost */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.38) 100%)",
        }}
      />
    </>
  );
}
