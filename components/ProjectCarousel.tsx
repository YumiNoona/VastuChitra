"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";

import { Project } from "@/lib/supabase";
import { haptic, cn } from "@/lib/utils";

export type CarouselStyle = "fan-3d" | "glass-stack" | "coverflow" | "orbital";

interface Props {
  projects: Project[];
  onLaunch: (p: Project) => void;
  style?: CarouselStyle;
}

const CARD_W = 240;
const CARD_H = 360;

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  Residential: { bg: "rgba(16,185,129,0.14)", text: "#34d399", border: "rgba(16,185,129,0.28)" },
  Commercial: { bg: "rgba(14,165,233,0.14)", text: "#38bdf8", border: "rgba(14,165,233,0.28)" },
  "Mixed-Use": { bg: "rgba(167,139,250,0.14)", text: "#c4b5fd", border: "rgba(167,139,250,0.28)" },
  Hospitality: { bg: "rgba(251,191,36,0.14)", text: "#fcd34d", border: "rgba(251,191,36,0.28)" },
  Cultural: { bg: "rgba(251,113,133,0.14)", text: "#fb7185", border: "rgba(251,113,133,0.28)" },
};

const cardBgs = [
  { a: "#12082C", b: "#2D1060", c: "#060314" },
  { a: "#051828", b: "#0A3050", c: "#020C18" },
  { a: "#1E0A0A", b: "#3D1515", c: "#0F0404" },
  { a: "#0A1E0E", b: "#153520", c: "#040D07" },
  { a: "#1A1200", b: "#342005", c: "#0D0800" },
  { a: "#060618", b: "#101840", c: "#020210" },
];

// ─────────────────────────────────────────────────────────
// TRANSFORM MATH — all offsets relative to center (0)
// ─────────────────────────────────────────────────────────
interface CardStyle { transform: string; opacity: number; zIndex: number; filter: string }

function getStyle(offset: number, mode: CarouselStyle): CardStyle {
  const abs = Math.abs(offset);

  // ── FAN 3D ──────────────────────────────────────────────
  if (mode === "fan-3d") {
    const tx = offset * 148;
    const ty = abs * 18;
    const tz = -abs * 85;
    const ry = offset * 25;
    const rz = offset * -3.5;
    const sc = 1 - abs * 0.085;
    return {
      transform: `translateX(${tx}px) translateY(${ty}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
      opacity: abs > 2.5 ? 0 : 1 - abs * 0.18,
      zIndex: 20 - abs,
      filter: `brightness(${Math.max(0.4, 1 - abs * 0.18)}) blur(${Math.max(0, abs - 1) * 1.5}px)`,
    };
  }

  // ── GLASS STACK ─────────────────────────────────────────
  if (mode === "glass-stack") {
    const tx = offset * 18;
    const ty = -abs * 14;
    const sc = 1 - abs * 0.055;
    return {
      transform: `translateX(${tx}px) translateY(${ty}px) scale(${sc})`,
      opacity: abs > 3.5 ? 0 : 1 - abs * 0.2,
      zIndex: 20 - abs,
      filter: `brightness(${Math.max(0.4, 1 - abs * 0.15)}) blur(${Math.max(0, abs - 1) * 2.5}px)`,
    };
  }

  // ── COVERFLOW ───────────────────────────────────────────
  // Pure sphere arc: each card sits on a circle of radius R
  // X = R·sin(θ), Z = R·cos(θ) - R  (so center card is at Z=0)
  if (mode === "coverflow") {
    const R = 520;                        // sphere radius (px)
    const θ = (offset * 38 * Math.PI) / 180; // angle per step
    const tx = R * Math.sin(θ);
    const tz = R * Math.cos(θ) - R;      // always ≤ 0 for side cards
    // flip angle so cards face inward toward center
    const ry = -offset * 38;
    const sc = Math.max(0.65, Math.cos(θ) * 0.38 + 0.65);
    const bright = Math.max(0.35, Math.cos(θ) * 0.65 + 0.35);
    return {
      transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`,
      opacity: abs > 3.5 ? 0 : bright,
      zIndex: Math.round(sc * 20),
      filter: `brightness(${bright}) blur(${Math.max(0, abs - 1.5) * 1.5}px)`,
    };
  }

  // ── ORBITAL ─────────────────────────────────────────────
  // Cards sit on an ellipse: X=Rx·sin(θ), Y=-Ry·cos(θ)+Ry
  if (mode === "orbital") {
    const Rx = 340, Ry = 110;
    const θ = (offset * 40 * Math.PI) / 180;
    const tx = Rx * Math.sin(θ);
    const ty = -Ry * Math.cos(θ) + Ry;
    const sc = Math.max(0.5, Math.cos(θ) * 0.5 + 0.5);
    const bright = Math.max(0.3, Math.cos(θ) * 0.7 + 0.3);
    return {
      transform: `translateX(${tx}px) translateY(${ty}px) scale(${sc})`,
      opacity: abs > 3.5 ? 0 : bright,
      zIndex: Math.round(sc * 20),
      filter: `brightness(${bright}) blur(${Math.max(0, abs - 1.5) * 1.2}px)`,
    };
  }

  return { transform: "", opacity: 1, zIndex: 1, filter: "" };
}

// ─────────────────────────────────────────────────────────
export default function ProjectCarousel({ projects, onLaunch, style = "fan-3d" }: Props) {
  const [active, setActive] = useState(0);
  const dragStartX = useRef(0);
  const didDrag = useRef(false);

  const go = useCallback((dir: number) => {
    haptic(8);
    setActive(prev => Math.max(0, Math.min(projects.length - 1, prev + dir)));
  }, [projects.length]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    didDrag.current = false;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 40) { didDrag.current = true; go(dx < 0 ? 1 : -1); }
  };
  const touchX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  // Stage height varies by style
  const stageH = style === "orbital" ? CARD_H + 140 : CARD_H + 80;

  return (
    <div className="select-none w-full">
      {/* ── Stage — perspective set HERE so all cards share one vanishing point */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: stageH, perspective: "1100px", perspectiveOrigin: "50% 48%" }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {projects.map((project, i) => {
          const offset = i - active;
          const { transform, opacity, zIndex, filter } = getStyle(offset, style);
          const isActive = offset === 0;
          const bg = cardBgs[i % cardBgs.length];
          const tc = typeColors[project.type] ?? typeColors["Residential"];

          return (
            <div
              key={project.id}
              className="absolute rounded-2xl overflow-hidden cursor-pointer"
              style={{
                width: CARD_W,
                height: CARD_H,
                transform,
                opacity,
                zIndex,
                filter,
                transition: "transform 0.52s cubic-bezier(0.16,1,0.3,1), opacity 0.52s ease, filter 0.52s ease",
              }}
              onClick={() => {
                if (!didDrag.current) {
                  if (!isActive) { setActive(i); haptic(6); }
                  else onLaunch(project);
                }
                didDrag.current = false;
              }}
            >
              {/* Background: real image or gradient fallback */}
              {project.image_url ? (
                <img src={project.image_url} alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transition: "transform 0.6s ease", transform: isActive ? "scale(1.03)" : "scale(1)" }} />
              ) : (
                <div className="absolute inset-0"
                  style={{ background: `radial-gradient(ellipse at 40% 35%, ${bg.b} 0%, ${bg.a} 55%, ${bg.c} 100%)` }} />
              )}

              {/* Glass shine on top-left */}
              <div className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none"
                style={{ background: "linear-gradient(155deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.02) 55%, transparent 100%)" }} />

              {/* Frosted overlay for non-active in glass-stack */}
              {style === "glass-stack" && !isActive && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "rgba(8,6,18,0.38)", backdropFilter: "blur(5px)" }} />
              )}

              {/* Wireframe SVG */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] pointer-events-none">
                <CardSvg index={i} />
              </div>

              {/* Scan line (active only) */}
              {isActive && (
                <motion.div
                  className="absolute left-0 right-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)" }}
                  animate={{ top: ["5%", "95%", "5%"] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Glass border */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ border: `1px solid ${isActive ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)"}` }} />

              {/* Active glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: "0 0 0 1px rgba(167,139,250,0.3), 0 28px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.1)" }} />
              )}

              {/* Type badge */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, backdropFilter: "blur(6px)" }}>
                  {project.type}
                </span>
                {project.featured && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(167,139,250,0.18)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.32)", backdropFilter: "blur(6px)" }}>
                    Featured
                  </span>
                )}
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-5"
                style={{ background: "linear-gradient(0deg,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.5) 55%,transparent 100%)" }}>
                <h3 className="text-white font-light text-[1.1rem] leading-tight mb-1.5"
                  style={{ fontFamily: "var(--font-display)" }}>
                  {project.title}
                </h3>
                <p className="text-white/50 text-[11px] leading-relaxed mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-white/32">
                    <MapPin size={8} /> {project.location}
                  </span>
                  <span className="text-[9px] text-white/22 font-mono">{project.year}</span>
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.22 }}
                      className="mt-3 w-full py-2 rounded-xl text-[11px] text-white/85 flex items-center justify-center gap-1.5"
                      style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(10px)" }}
                      onClick={e => { e.stopPropagation(); onLaunch(project); }}
                    >
                      Launch Experience <ExternalLink size={10} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active project label */}
      <AnimatePresence mode="wait">
        <motion.p key={active} className="text-center text-xs mt-3 mb-5"
          style={{ color: "hsl(var(--muted-foreground)/0.55)" }}
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}>
          {projects[active]?.location} · {projects[active]?.year}
        </motion.p>
      </AnimatePresence>

      {/* Nav controls */}
      <div className="flex items-center justify-center gap-5">
        <motion.button onClick={() => go(-1)} disabled={active === 0}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-20"
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={14} />
        </motion.button>

        <div className="flex items-center gap-1.5">
          {projects.map((_, i) => (
            <motion.button key={i} onClick={() => { setActive(i); haptic(5); }}
              className="h-1.5 rounded-full"
              animate={{
                width: i === active ? 28 : 7,
                backgroundColor: i === active ? "hsl(var(--primary))" : "hsl(var(--border))",
                opacity: Math.abs(i - active) > 2 ? 0.3 : 1,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
          ))}
        </div>

        <motion.button onClick={() => go(1)} disabled={active === projects.length - 1}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-20"
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
          <ArrowRight size={14} />
        </motion.button>
      </div>

      <p className="text-center mt-3 tracking-widest uppercase"
        style={{ fontSize: "9px", color: "hsl(var(--muted-foreground)/0.3)" }}>
        Drag · Click side card to focus · Click active to launch
      </p>
    </div>
  );
}

function CardSvg({ index }: { index: number }) {
  const shapes = [
    <svg key="a" width="150" height="200" viewBox="0 0 150 200" fill="none" stroke="white" strokeWidth="0.7">
      <rect x="45" y="20" width="60" height="170" /><rect x="57" y="10" width="36" height="180" opacity="0.35" />
      {[...Array(16)].map((_,i) => <line key={i} x1="45" y1={20+i*10} x2="105" y2={20+i*10} opacity="0.22" />)}
    </svg>,
    <svg key="b" width="200" height="160" viewBox="0 0 200 160" fill="none" stroke="white" strokeWidth="0.7">
      <ellipse cx="100" cy="80" rx="80" ry="52" /><ellipse cx="100" cy="80" rx="52" ry="34" opacity="0.45" />
      <line x1="100" y1="28" x2="100" y2="132" opacity="0.2" /><line x1="20" y1="80" x2="180" y2="80" opacity="0.2" />
    </svg>,
    <svg key="c" width="180" height="150" viewBox="0 0 180 150" fill="none" stroke="white" strokeWidth="0.7">
      <polygon points="90,12 158,68 22,68" /><rect x="28" y="68" width="124" height="68" />
      <rect x="72" y="82" width="36" height="54" opacity="0.4" />
    </svg>,
    <svg key="d" width="170" height="170" viewBox="0 0 170 170" fill="none" stroke="white" strokeWidth="0.7">
      {[0,1,2].map(i => [0,1,2].map(j => <rect key={`${i}-${j}`} x={18+i*52} y={18+j*52} width="42" height="42" opacity={0.22 + (i+j)*0.08} />))}
    </svg>,
    <svg key="e" width="180" height="155" viewBox="0 0 180 155" fill="none" stroke="white" strokeWidth="0.7">
      <polygon points="90,8 172,148 8,148" /><polygon points="90,38 148,148 32,148" opacity="0.45" />
      <line x1="0" y1="148" x2="180" y2="148" />
    </svg>,
    <svg key="f" width="180" height="140" viewBox="0 0 180 140" fill="none" stroke="white" strokeWidth="0.7">
      <rect x="18" y="48" width="144" height="74" /><rect x="36" y="28" width="108" height="94" opacity="0.38" />
      {[0,1,2,3].map(i => <rect key={i} x={30+i*32} y="66" width="22" height="30" opacity="0.18" />)}
    </svg>,
  ];
  return <>{shapes[index % shapes.length]}</>;
}
