"use client";

import { useEffect, useRef } from "react";
import { useDebug } from "./DebugPanel";

export type CursorVariant = "dot-ring" | "crosshair" | "spotlight" | "magnetic";

export default function CustomCursor() {
  const { cursorVariant } = useDebug();
  return <CursorEngine variant={cursorVariant as CursorVariant} />;
}

function CursorEngine({ variant }: { variant: CursorVariant }) {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLCanvasElement>(null);

  // All mutable state in refs — zero re-renders
  const mouse = useRef({ x: -200, y: -200 });
  const trail = useRef({ x: -200, y: -200 });
  const hover = useRef(false);
  const raf   = useRef<number>();

  // Spotlight canvas size — set once, never resized per frame
  const spotSize = useRef({ w: 0, h: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      hover.current = !!(e.target as HTMLElement).closest(
        "button,a,[role=button],input,textarea,select"
      );
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // ── Init spotlight canvas size once ──
    if (variant === "spotlight" && cRef.current) {
      const c = cRef.current;
      spotSize.current.w = c.width  = window.innerWidth;
      spotSize.current.h = c.height = window.innerHeight;
      const onResize = () => {
        spotSize.current.w = c.width  = window.innerWidth;
        spotSize.current.h = c.height = window.innerHeight;
      };
      window.addEventListener("resize", onResize, { passive: true });
    }

    // ── Shared tick logic ──
    const tick = () => {
      const { x, y } = mouse.current;
      const h = hover.current;
      const a = aRef.current;
      const b = bRef.current;

      if (variant === "dot-ring") {
        if (a) {
          a.style.transform = `translate3d(${x - 4}px,${y - 4}px,0)`;
          if (h) { a.style.width = "10px"; a.style.height = "10px"; }
          else   { a.style.width =  "8px"; a.style.height =  "8px"; }
        }
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.28);
          trail.current.y = lerp(trail.current.y, y, 0.28);
          const s = h ? 50 : 34;
          b.style.transform = `translate3d(${trail.current.x - s/2}px,${trail.current.y - s/2}px,0)`;
          b.style.width  = `${s}px`;
          b.style.height = `${s}px`;
        }
      }

      else if (variant === "crosshair") {
        if (a) a.style.transform = `translate3d(${x - 2}px,${y - 2}px,0)`;
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.32);
          trail.current.y = lerp(trail.current.y, y, 0.32);
          const s = h ? 42 : 28;
          b.style.transform = `translate3d(${trail.current.x - s/2}px,${trail.current.y - s/2}px,0)`;
          b.style.width  = `${s}px`;
          b.style.height = `${s}px`;
        }
      }

      else if (variant === "spotlight") {
        // Dot snaps
        if (a) a.style.transform = `translate3d(${x - 3}px,${y - 3}px,0)`;
        // Canvas spotlight — lerp position only, NEVER resize canvas
        const c = cRef.current;
        if (c) {
          trail.current.x = lerp(trail.current.x, x, 0.18);
          trail.current.y = lerp(trail.current.y, y, 0.18);
          const ctx = c.getContext("2d")!;
          const W = spotSize.current.w, H = spotSize.current.h;
          ctx.clearRect(0, 0, W, H);
          const r = h ? 130 : 90;
          const tx = trail.current.x, ty = trail.current.y;
          const grd = ctx.createRadialGradient(tx, ty, 0, tx, ty, r);
          grd.addColorStop(0,   "rgba(167,139,250,0.09)");
          grd.addColorStop(0.5, "rgba(167,139,250,0.03)");
          grd.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = grd;
          ctx.fillRect(tx - r, ty - r, r * 2, r * 2); // bounding box only
        }
      }

      else if (variant === "magnetic") {
        if (a) {
          a.style.transform = `translate3d(${x - 4}px,${y - 4}px,0)`;
          a.style.width  = h ? "12px" : "8px";
          a.style.height = h ? "12px" : "8px";
        }
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.22);
          trail.current.y = lerp(trail.current.y, y, 0.22);
          const s = h ? 52 : 38;
          const drift = (trail.current.x - x) * 0.15;
          b.style.transform = `translate3d(${trail.current.x - s/2}px,${trail.current.y - s/2}px,0) rotate(${drift}deg)`;
          b.style.width        = h ? `${s+8}px`  : `${s}px`;
          b.style.height       = h ? `${s-8}px`  : `${s}px`;
          b.style.borderRadius = h ? "40% 60% 55% 45% / 55% 45% 55% 45%" : "50%";
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

  // ── Render ──
  const base: React.CSSProperties = {
    position: "fixed", top: 0, left: 0,
    pointerEvents: "none", willChange: "transform",
    borderRadius: "50%",
  };

  if (variant === "spotlight") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <canvas ref={cRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9995 }} />
      <div ref={aRef} style={{ ...base, width: 6, height: 6, background: "hsl(var(--primary))", zIndex: 9999 }} />
    </>
  );

  if (variant === "crosshair") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <div ref={aRef} style={{ ...base, width: 4, height: 4, background: "hsl(var(--primary))", zIndex: 9999 }} />
      <div ref={bRef} style={{
        ...base, width: 28, height: 28,
        border: "1px solid hsl(var(--primary)/0.55)",
        borderRadius: "2px",
        zIndex: 9998,
        transition: "width .15s ease, height .15s ease",
        boxShadow: "0 -8px 0 0 hsl(var(--primary)/0.45), 0 8px 0 0 hsl(var(--primary)/0.45), -8px 0 0 0 hsl(var(--primary)/0.45), 8px 0 0 0 hsl(var(--primary)/0.45)",
      }} />
    </>
  );

  if (variant === "magnetic") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <div ref={aRef} style={{ ...base, width: 8, height: 8, background: "#fff", mixBlendMode: "difference", zIndex: 9999, transition: "width .12s, height .12s" }} />
      <div ref={bRef} style={{ ...base, width: 38, height: 38, border: "1.5px solid hsl(var(--primary)/0.5)", background: "hsl(var(--primary)/0.06)", zIndex: 9998, transition: "width .18s ease, height .18s ease, border-radius .25s ease" }} />
    </>
  );

  // default: dot-ring
  return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <div ref={aRef} style={{ ...base, width: 8, height: 8, background: "hsl(var(--primary))", zIndex: 9999, transition: "width .12s ease, height .12s ease" }} />
      <div ref={bRef} style={{ ...base, width: 34, height: 34, border: "1px solid hsl(var(--primary)/0.38)", zIndex: 9998, transition: "width .16s ease, height .16s ease" }} />
    </>
  );
}
