"use client";

import { useEffect, useRef } from "react";
import { useDebug } from "./DebugPanel";

export type CursorVariant =
  | "dot-ring"
  | "magnetic"
  | "xray"
  | "ink-drop"
  | "torch"
  | "precision";

export default function CustomCursor() {
  const { cursorVariant } = useDebug();
  return <CursorEngine variant={cursorVariant as CursorVariant} />;
}

function CursorEngine({ variant }: { variant: CursorVariant }) {
  const aRef  = useRef<HTMLDivElement>(null);
  const bRef  = useRef<HTMLDivElement>(null);
  const cRef  = useRef<HTMLCanvasElement>(null);

  const mouse  = useRef({ x: -400, y: -400 });
  const trail  = useRef({ x: -400, y: -400 });
  const trail2 = useRef({ x: -400, y: -400 });
  const hover  = useRef(false);
  const raf    = useRef<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      hover.current = !!(e.target as HTMLElement).closest(
        "button,a,[role=button],input,textarea,select,h1,h2,h3,h4,p"
      );
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    // Canvas init for torch / xray
    if ((variant === "torch" || variant === "xray") && cRef.current) {
      const c = cRef.current;
      c.width  = window.innerWidth;
      c.height = window.innerHeight;
      const onResize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
      window.addEventListener("resize", onResize, { passive: true });
    }

    const tick = () => {
      const { x, y } = mouse.current;
      const h = hover.current;
      const a = aRef.current;
      const b = bRef.current;

      // ── DOT-RING ──────────────────────────────────────────────────────────
      if (variant === "dot-ring") {
        if (a) {
          const s = h ? 18 : 12;
          a.style.transform = `translate3d(${x - s/2}px,${y - s/2}px,0)`;
          a.style.width = a.style.height = `${s}px`;
          a.style.opacity = "1";
        }
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.26);
          trail.current.y = lerp(trail.current.y, y, 0.26);
          const s = h ? 52 : 38;
          b.style.transform = `translate3d(${trail.current.x - s/2}px,${trail.current.y - s/2}px,0)`;
          b.style.width = b.style.height = `${s}px`;
          b.style.opacity = "1";
        }
      }

      // ── MAGNETIC BLOB ─────────────────────────────────────────────────────
      else if (variant === "magnetic") {
        if (a) {
          const s = h ? 14 : 9;
          a.style.transform = `translate3d(${x - s/2}px,${y - s/2}px,0)`;
          a.style.width = a.style.height = `${s}px`;
        }
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.2);
          trail.current.y = lerp(trail.current.y, y, 0.2);
          const drift = (trail.current.x - x) * 0.18;
          const s = h ? 64 : 48;
          b.style.transform = `translate3d(${trail.current.x - s/2}px,${trail.current.y - s/2}px,0) rotate(${drift}deg)`;
          b.style.width  = h ? `${s + 10}px` : `${s}px`;
          b.style.height = h ? `${s - 10}px` : `${s}px`;
          b.style.borderRadius = h
            ? "42% 58% 52% 48% / 56% 44% 56% 44%"
            : "50%";
        }
      }

      // ── X-RAY ─────────────────────────────────────────────────────────────
      // A circle that shows a "depth layer" via mix-blend-mode: difference
      // + inner wireframe rings that pulse on hover
      else if (variant === "xray") {
        if (a) {
          trail.current.x  = lerp(trail.current.x,  x, 0.22);
          trail.current.y  = lerp(trail.current.y,  y, 0.22);
          trail2.current.x = lerp(trail2.current.x, x, 0.10);
          trail2.current.y = lerp(trail2.current.y, y, 0.10);
          const s = h ? 88 : 66;
          a.style.transform = `translate3d(${trail.current.x - s/2}px,${trail.current.y - s/2}px,0)`;
          a.style.width = a.style.height = `${s}px`;
          a.style.opacity = h ? "0.85" : "0.7";
        }
        if (b) {
          const s = h ? 120 : 90;
          b.style.transform = `translate3d(${trail2.current.x - s/2}px,${trail2.current.y - s/2}px,0)`;
          b.style.width = b.style.height = `${s}px`;
          b.style.opacity = h ? "0.45" : "0.25";
          b.style.borderWidth = h ? "2px" : "1px";
        }
        // Dot at exact cursor
        const c = cRef.current;
        if (c) {
          const ctx = c.getContext("2d")!;
          ctx.clearRect(0, 0, c.width, c.height);
          // Inner dot
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(167,139,250,0.95)";
          ctx.fill();
          // Cross-hair lines
          const len = 10;
          ctx.strokeStyle = "rgba(167,139,250,0.7)";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x + len, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke();
        }
      }

      // ── INK DROP ──────────────────────────────────────────────────────────
      // A filled circle. On hover over text it squishes into an underline shape.
      else if (variant === "ink-drop") {
        if (a) {
          trail.current.x = lerp(trail.current.x, x, 0.3);
          trail.current.y = lerp(trail.current.y, y, 0.3);
          const w = h ? 44 : 20;
          const ht = h ? 6  : 20;
          a.style.transform = `translate3d(${trail.current.x - w/2}px,${trail.current.y - ht/2}px,0)`;
          a.style.width  = `${w}px`;
          a.style.height = `${ht}px`;
          a.style.borderRadius = h ? "3px" : "50%";
          a.style.opacity = h ? "0.75" : "0.9";
        }
        if (b) {
          const s = 5;
          b.style.transform = `translate3d(${x - s/2}px,${y - s/2}px,0)`;
          b.style.width = b.style.height = `${s}px`;
        }
      }

      // ── TORCH ─────────────────────────────────────────────────────────────
      // Tight focused light beam — everything outside the torch is darkened.
      else if (variant === "torch") {
        trail.current.x = lerp(trail.current.x, x, 0.15);
        trail.current.y = lerp(trail.current.y, y, 0.15);
        const c = cRef.current;
        if (c) {
          const ctx = c.getContext("2d")!;
          const W = c.width, H = c.height;
          const tx = trail.current.x, ty = trail.current.y;
          ctx.clearRect(0, 0, W, H);
          // Dark overlay covering whole screen
          ctx.fillStyle = "rgba(0,0,0,0.72)";
          ctx.fillRect(0, 0, W, H);
          // Cut out a focused circle using destination-out
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          const r = h ? 130 : 100;
          const grd = ctx.createRadialGradient(tx, ty, r * 0.25, tx, ty, r);
          grd.addColorStop(0,   "rgba(0,0,0,1)");
          grd.addColorStop(0.7, "rgba(0,0,0,0.85)");
          grd.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(tx, ty, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        // Small bright dot at cursor center
        if (a) {
          const s = 4;
          a.style.transform = `translate3d(${x - s/2}px,${y - s/2}px,0)`;
          a.style.width = a.style.height = `${s}px`;
          a.style.opacity = "0.9";
        }
      }

      // ── PRECISION ─────────────────────────────────────────────────────────
      // Fine crosshair with a small dot. No lag — everything snaps.
      // Outer ring expands on hover.
      else if (variant === "precision") {
        if (a) {
          const s = 4;
          a.style.transform = `translate3d(${x - s/2}px,${y - s/2}px,0)`;
          a.style.width = a.style.height = `${s}px`;
        }
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.35);
          trail.current.y = lerp(trail.current.y, y, 0.35);
          const s = h ? 56 : 32;
          b.style.transform = `translate3d(${trail.current.x - s/2}px,${trail.current.y - s/2}px,0)`;
          b.style.width = b.style.height = `${s}px`;
          b.style.borderRadius = "2px";
          // crosshair tick marks via box-shadow
          const t = s / 2 + 5;
          b.style.boxShadow = `0 -${t}px 0 0 hsl(var(--primary)/0.5),
            0 ${t}px 0 0 hsl(var(--primary)/0.5),
            -${t}px 0 0 0 hsl(var(--primary)/0.5),
            ${t}px 0 0 0 hsl(var(--primary)/0.5)`;
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [variant]);

  const hide: React.CSSProperties = { position: "fixed", top: 0, left: 0, pointerEvents: "none", willChange: "transform", zIndex: 9999 };
  const circle: React.CSSProperties = { ...hide, borderRadius: "50%" };

  // ── RENDERS ───────────────────────────────────────────────────────────────

  if (variant === "dot-ring") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      {/* Dot */}
      <div ref={aRef} style={{ ...circle, width: 12, height: 12,
        background: "hsl(var(--primary))",
        transition: "width .12s ease, height .12s ease",
      }}/>
      {/* Ring */}
      <div ref={bRef} style={{ ...circle, width: 38, height: 38,
        border: "1.5px solid hsl(var(--primary)/0.5)",
        transition: "width .14s ease, height .14s ease",
        zIndex: 9998,
      }}/>
    </>
  );

  if (variant === "magnetic") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      {/* White inversion dot */}
      <div ref={aRef} style={{ ...circle, width: 9, height: 9,
        background: "#fff", mixBlendMode: "difference",
        transition: "width .1s, height .1s",
      }}/>
      {/* Morphing blob */}
      <div ref={bRef} style={{ ...circle, width: 48, height: 48,
        border: "1.5px solid hsl(var(--primary)/0.55)",
        background: "hsl(var(--primary)/0.07)",
        transition: "width .2s ease, height .2s ease, border-radius .3s ease",
        zIndex: 9998,
      }}/>
    </>
  );

  if (variant === "xray") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      {/* Canvas for the sharp dot + crosshair lines */}
      <canvas ref={cRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9996 }}/>
      {/* Main x-ray circle — mix-blend inverts content beneath it */}
      <div ref={aRef} style={{ ...circle, width: 66, height: 66,
        background: "hsl(var(--primary)/0.12)",
        border: "1px solid hsl(var(--primary)/0.6)",
        mixBlendMode: "difference",
        backdropFilter: "invert(0.12) hue-rotate(20deg)",
        transition: "width .18s ease, height .18s ease, opacity .18s ease",
        zIndex: 9998,
      }}/>
      {/* Slow outer ghost ring */}
      <div ref={bRef} style={{ ...circle, width: 90, height: 90,
        border: "1px dashed hsl(var(--primary)/0.35)",
        transition: "width .25s ease, height .25s ease, opacity .25s ease, border-width .2s",
        zIndex: 9997,
      }}/>
    </>
  );

  if (variant === "ink-drop") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      {/* Trailing ink shape */}
      <div ref={aRef} style={{ ...hide, width: 20, height: 20,
        borderRadius: "50%",
        background: "hsl(var(--primary))",
        transition: "width .2s cubic-bezier(.34,1.56,.64,1), height .2s cubic-bezier(.34,1.56,.64,1), border-radius .2s ease, opacity .15s ease",
        zIndex: 9998,
      }}/>
      {/* Exact cursor dot */}
      <div ref={bRef} style={{ ...circle, width: 5, height: 5,
        background: "#fff",
        mixBlendMode: "difference",
        zIndex: 9999,
      }}/>
    </>
  );

  if (variant === "torch") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      {/* Full-screen dark overlay with cutout */}
      <canvas ref={cRef} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: 9994 }}/>
      {/* Bright center dot */}
      <div ref={aRef} style={{ ...circle, width: 4, height: 4,
        background: "hsl(var(--primary))",
        boxShadow: "0 0 6px 2px hsl(var(--primary)/0.8)",
        zIndex: 9999,
      }}/>
    </>
  );

  if (variant === "precision") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      {/* Center dot */}
      <div ref={aRef} style={{ ...circle, width: 4, height: 4,
        background: "hsl(var(--primary))",
        zIndex: 9999,
      }}/>
      {/* Square reticle with tick marks */}
      <div ref={bRef} style={{ ...hide, width: 32, height: 32,
        border: "1px solid hsl(var(--primary)/0.6)",
        borderRadius: "2px",
        transition: "width .14s ease, height .14s ease",
        zIndex: 9998,
      }}/>
    </>
  );

  return null;
}
