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

  const mouse    = useRef({ x: -300, y: -300 });
  const trail    = useRef({ x: -300, y: -300 });
  const hover    = useRef(false);
  const rafRef   = useRef<number>();
  const spotSize = useRef({ w: 0, h: 0 });

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
        "button,a,[role=button],input,textarea,select"
      );
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    // Init spotlight canvas once — never resize per frame
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

    const tick = () => {
      const { x, y } = mouse.current;
      const h = hover.current;
      const a = aRef.current;
      const b = bRef.current;

      if (variant === "dot-ring") {
        if (a) {
          // dot snaps — bigger size
          const ds = h ? 18 : 13;
          a.style.transform = `translate3d(${x - ds / 2}px,${y - ds / 2}px,0)`;
          a.style.width  = `${ds}px`;
          a.style.height = `${ds}px`;
        }
        if (b) {
          // ring trails — larger
          trail.current.x = lerp(trail.current.x, x, 0.28);
          trail.current.y = lerp(trail.current.y, y, 0.28);
          const rs = h ? 58 : 42;
          b.style.transform = `translate3d(${trail.current.x - rs / 2}px,${trail.current.y - rs / 2}px,0)`;
          b.style.width  = `${rs}px`;
          b.style.height = `${rs}px`;
        }
      }

      else if (variant === "crosshair") {
        if (a) {
          const ds = 8;
          a.style.transform = `translate3d(${x - ds / 2}px,${y - ds / 2}px,0)`;
        }
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.32);
          trail.current.y = lerp(trail.current.y, y, 0.32);
          const rs = h ? 54 : 40;
          b.style.transform = `translate3d(${trail.current.x - rs / 2}px,${trail.current.y - rs / 2}px,0)`;
          b.style.width  = `${rs}px`;
          b.style.height = `${rs}px`;
        }
      }

      else if (variant === "spotlight") {
        if (a) {
          const ds = 12;
          a.style.transform = `translate3d(${x - ds / 2}px,${y - ds / 2}px,0)`;
        }
        const c = cRef.current;
        if (c) {
          trail.current.x = lerp(trail.current.x, x, 0.18);
          trail.current.y = lerp(trail.current.y, y, 0.18);
          const ctx = c.getContext("2d")!;
          const W   = spotSize.current.w;
          const H   = spotSize.current.h;
          const tx  = trail.current.x;
          const ty  = trail.current.y;
          ctx.clearRect(0, 0, W, H);
          const r   = h ? 140 : 100;
          const grd = ctx.createRadialGradient(tx, ty, 0, tx, ty, r);
          grd.addColorStop(0,   "rgba(167,139,250,0.09)");
          grd.addColorStop(0.5, "rgba(167,139,250,0.03)");
          grd.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = grd;
          ctx.fillRect(tx - r, ty - r, r * 2, r * 2);
        }
      }

      else if (variant === "magnetic") {
        if (a) {
          const ds = h ? 14 : 10;
          a.style.transform = `translate3d(${x - ds / 2}px,${y - ds / 2}px,0)`;
          a.style.width  = `${ds}px`;
          a.style.height = `${ds}px`;
        }
        if (b) {
          trail.current.x = lerp(trail.current.x, x, 0.22);
          trail.current.y = lerp(trail.current.y, y, 0.22);
          const bs     = h ? 60 : 46;
          const drift  = (trail.current.x - x) * 0.15;
          b.style.transform    = `translate3d(${trail.current.x - bs / 2}px,${trail.current.y - bs / 2}px,0) rotate(${drift}deg)`;
          b.style.width        = h ? `${bs + 8}px` : `${bs}px`;
          b.style.height       = h ? `${bs - 8}px` : `${bs}px`;
          b.style.borderRadius = h ? "40% 60% 55% 45% / 55% 45% 55% 45%" : "50%";
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [variant]);

  const base: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    willChange: "transform",
    borderRadius: "50%",
    zIndex: 9999,
  };

  if (variant === "spotlight") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <canvas ref={cRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9995 }} />
      <div ref={aRef} style={{ ...base, width: 12, height: 12, background: "hsl(var(--primary))" }} />
    </>
  );

  if (variant === "crosshair") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <div ref={aRef} style={{ ...base, width: 8, height: 8, background: "hsl(var(--primary))" }} />
      <div ref={bRef} style={{
        ...base, width: 40, height: 40,
        border: "1px solid hsl(var(--primary)/0.55)",
        borderRadius: "2px",
        zIndex: 9998,
        transition: "width .15s ease, height .15s ease",
        boxShadow: "0 -9px 0 0 hsl(var(--primary)/0.45), 0 9px 0 0 hsl(var(--primary)/0.45), -9px 0 0 0 hsl(var(--primary)/0.45), 9px 0 0 0 hsl(var(--primary)/0.45)",
      }} />
    </>
  );

  if (variant === "magnetic") return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <div ref={aRef} style={{ ...base, width: 10, height: 10, background: "#fff", mixBlendMode: "difference", transition: "width .12s, height .12s" }} />
      <div ref={bRef} style={{ ...base, zIndex: 9998, width: 46, height: 46, border: "1.5px solid hsl(var(--primary)/0.5)", background: "hsl(var(--primary)/0.06)", transition: "width .18s ease, height .18s ease, border-radius .25s ease" }} />
    </>
  );

  // default: dot-ring
  return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
      <div ref={aRef} style={{ ...base, width: 13, height: 13, background: "hsl(var(--primary))", transition: "width .12s ease, height .12s ease" }} />
      <div ref={bRef} style={{ ...base, zIndex: 9998, width: 42, height: 42, border: "1.5px solid hsl(var(--primary)/0.45)", transition: "width .16s ease, height .16s ease" }} />
    </>
  );
}
