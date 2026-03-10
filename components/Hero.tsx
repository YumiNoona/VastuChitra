"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Play, ChevronDown } from "lucide-react";
import { haptic } from "@/lib/utils";
import { useDebug } from "./DebugPanel";
import { useSiteConfig } from "./SiteConfigProvider";

// ─────────────────────────────────────────────────────────────────────────────
//  SITE CONFIG — edit these to change all visible text on the site
// ─────────────────────────────────────────────────────────────────────────────
export const SITE_CONFIG = {
  brand:          "VastuChitra ArchViz",
  eyebrow:        "Unreal Engine · Pixel Streaming",
  headline:       ["Immersive", "Architecture", "Experiences"],
  sub:            "Walk through every space before a single brick is laid. Photorealistic real-time environments streamed to any browser.",
  cta:            "Explore Projects",
  ctaSecondary:   "Watch Demo",
  stats: [
    { value: "UE5",   label: "Powered by"    },
    { value: "4K",    label: "Resolution"    },
    { value: "60fps", label: "Framerate"     },
    { value: "6+",    label: "Projects live" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants — properly typed as Variants (fixes the TS build error)
// ─────────────────────────────────────────────────────────────────────────────
type AnimStyle =
  | "fade-blur"
  | "slide-up"
  | "spring-pop"
  | "split-reveal"
  | "scramble"
  | "stagger-wave";

function getVariants(style: AnimStyle): { container: Variants; item: Variants } {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.11, delayChildren: 0.18 },
    },
  };

  const itemMap: Record<AnimStyle, Variants> = {
    "fade-blur": {
      hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
      show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
    },
    "slide-up": {
      hidden: { opacity: 0, y: 55 },
      show:   { opacity: 1, y: 0,  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    },
    "spring-pop": {
      hidden: { opacity: 0, scale: 0.78, y: 20 },
      show:   { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring", stiffness: 280, damping: 18 } },
    },
    "split-reveal": {
      hidden: { opacity: 0, y: 40,  skewY: 5, clipPath: "inset(100% 0 0 0)" },
      show:   { opacity: 1, y: 0,   skewY: 0, clipPath: "inset(0% 0 0 0)", transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
    },
    "scramble": {
      hidden: { opacity: 0, x: -8 },
      show:   { opacity: 1, x: 0,  transition: { duration: 0.6, ease: "easeOut" } },
    },
    "stagger-wave": {
      hidden: { opacity: 0, y: 30, rotateX: 45 },
      show:   { opacity: 1, y: 0,  rotateX: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
    },
  };

  return { container, item: itemMap[style] ?? itemMap["fade-blur"] };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Text scramble hook
// ─────────────────────────────────────────────────────────────────────────────
function useScramble(text: string, active: boolean) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const [display, setDisplay] = useState(text);
  const frame  = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    frame.current = 0;
    const iterations = text.length * 2;
    const animate = () => {
      setDisplay(
        text.split("").map((ch, i) => {
          if (ch === " ") return " ";
          if (i < frame.current / 2) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      frame.current++;
      if (frame.current < iterations) rafRef.current = requestAnimationFrame(animate);
      else setDisplay(text);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, text]);

  return display;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Root export — picks hero variant from debug panel
// ─────────────────────────────────────────────────────────────────────────────
export default function Hero() {
  const { heroVariant, pageAnimation } = useDebug();
  const key = `${heroVariant}-${pageAnimation}`;

  return (
    <AnimatePresence mode="wait">
      {heroVariant === "centered"
        ? <HeroCentered key={key} animStyle={pageAnimation as AnimStyle} />
        : heroVariant === "bold"
        ? <HeroBold     key={key} animStyle={pageAnimation as AnimStyle} />
        : <HeroSplit    key={key} animStyle={pageAnimation as AnimStyle} />}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shared: background orbs  (static blur wrapper = no GPU re-blur each frame)
// ─────────────────────────────────────────────────────────────────────────────
function HeroBg() {
  const { config } = useSiteConfig();
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Custom hero background image */}
      {config.heroImageUrl && (
        <div className="absolute inset-0 z-0"
          style={{ backgroundImage: `url(${config.heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.35 }}/>
      )}
      <div className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw]"
        style={{ filter: "blur(80px)" }}>
        <motion.div className="w-full h-full rounded-full"
          style={{ background: "radial-gradient(circle, hsl(258 70% 45%/0.22) 0%, transparent 65%)", willChange: "transform" }}
          animate={{ x: [0, 28, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="absolute -bottom-[15%] -right-[8%] w-[40vw] h-[40vw]"
        style={{ filter: "blur(90px)" }}>
        <motion.div className="w-full h-full rounded-full"
          style={{ background: "radial-gradient(circle, hsl(300 60% 35%/0.14) 0%, transparent 65%)", willChange: "transform" }}
          animate={{ x: [0, -22, 0], y: [0, 18, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shared: scroll chevron
// ─────────────────────────────────────────────────────────────────────────────
function ScrollHint() {
  return (
    <motion.div
      className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      style={{ color: "hsl(var(--muted-foreground)/0.35)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
    >
      <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
        <ChevronDown size={16} />
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Variant A: Split (default) — headline left, visual panel right
// ─────────────────────────────────────────────────────────────────────────────
function HeroSplit({ animStyle }: { animStyle: AnimStyle }) {
  const { config: cfg } = useSiteConfig();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y  = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const op = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const { container, item } = getVariants(animStyle);
  const h0 = useScramble(cfg.headline[0], animStyle === "scramble");
  const h1 = useScramble(cfg.headline[1], animStyle === "scramble");
  const h2 = useScramble(cfg.headline[2], animStyle === "scramble");

  return (
    <motion.section ref={ref} key="split"
      className="relative min-h-screen flex items-center overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}>
      <HeroBg />
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 w-full"
        style={{ y, opacity: op, willChange: "transform, opacity" }}>
        <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_460px] gap-14 items-center">

          {/* Left: text */}
          <motion.div
            variants={container} initial="hidden" animate="show"
            style={{ perspective: animStyle === "split-reveal" ? 800 : undefined }}>

            <motion.div variants={item} className="mb-6">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary/80">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {cfg.eyebrow}
              </span>
            </motion.div>

            <motion.h1 variants={item}
              className="font-light leading-[0.88] tracking-tight mb-7"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.2rem,6.5vw,6rem)" }}>
              {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[0]} /> : h0}<br />
              <span className="text-gradient italic">
                {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[1]} /> : h1}
              </span><br />
              {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[2]} /> : h2}
            </motion.h1>

            <motion.p variants={item}
              className="text-muted-foreground leading-relaxed mb-9 max-w-[420px]"
              style={{ fontSize: "clamp(0.9rem,1.3vw,1.05rem)" }}>
              {cfg.sub}
            </motion.p>

            <motion.div variants={item} className="flex items-center gap-3 flex-wrap mb-14">
              <motion.a href="#projects" onClick={() => haptic(10)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {cfg.cta} <ArrowRight size={14} />
              </motion.a>
              <motion.a href="#about" onClick={() => haptic(5)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/25 transition-all"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Play size={11} /> {cfg.ctaSecondary}
              </motion.a>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap items-center gap-6 pt-8 border-t border-border/40">
              {cfg.stats.map(s => (
                <div key={s.label} className="min-w-0">
                  <div className="font-light leading-none mb-1 truncate"
                    style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem,2.5vw,1.7rem)" }}>{s.value}</div>
                  <div className="text-[10px] tracking-widest uppercase text-muted-foreground truncate">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: visual */}
          <motion.div className="hidden lg:block"
            initial={{ opacity: 0, x: 40, filter: "blur(14px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <HeroVisual />
          </motion.div>
        </div>
      </motion.div>
      <ScrollHint />
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Variant B: Centered
// ─────────────────────────────────────────────────────────────────────────────
function HeroCentered({ animStyle }: { animStyle: AnimStyle }) {
  const { config: cfg } = useSiteConfig();
  const { container, item } = getVariants(animStyle);
  const h0 = useScramble(cfg.headline[0], animStyle === "scramble");
  const h1 = useScramble(cfg.headline[1], animStyle === "scramble");
  const h2 = useScramble(cfg.headline[2], animStyle === "scramble");

  return (
    <motion.section key="centered"
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <HeroBg />
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-16"
        variants={container} initial="hidden" animate="show"
        style={{ perspective: animStyle === "split-reveal" ? 800 : undefined }}>

        <motion.div variants={item} className="mb-7">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary/80">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{cfg.eyebrow}
          </span>
        </motion.div>

        <motion.h1 variants={item}
          className="font-light leading-[0.9] tracking-tight mb-8"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem,8vw,7.5rem)" }}>
          {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[0]} /> : h0}{" "}
          <span className="text-gradient italic">
            {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[1]} /> : h1}
          </span><br />
          {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[2]} /> : h2}
        </motion.h1>

        <motion.p variants={item} className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          {cfg.sub}
        </motion.p>

        <motion.div variants={item} className="flex items-center justify-center gap-4">
          <motion.a href="#projects" onClick={() => haptic(10)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-xl shadow-primary/25"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            {cfg.cta} <ArrowRight size={14} />
          </motion.a>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-border/30">
          {cfg.stats.map(s => (
            <div key={s.label} className="text-center min-w-[60px]">
              <div className="font-light mb-0.5"
                style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>{s.value}</div>
              <div className="text-[9px] tracking-widest uppercase text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
      <ScrollHint />
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Variant C: Bold — oversized type bottom-aligned
// ─────────────────────────────────────────────────────────────────────────────
function HeroBold({ animStyle }: { animStyle: AnimStyle }) {
  const { config: cfg } = useSiteConfig();
  const { container, item } = getVariants(animStyle);
  const h0 = useScramble(cfg.headline[0], animStyle === "scramble");
  const h1 = useScramble(cfg.headline[1], animStyle === "scramble");
  const h2 = useScramble(cfg.headline[2], animStyle === "scramble");

  const headlineStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(5rem,13vw,13rem)",
    ...(animStyle === "split-reveal" ? { perspective: 1000 } : {}),
  };

  return (
    <motion.section key="bold"
      className="relative min-h-screen flex items-end overflow-hidden pb-20"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <HeroBg />
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 w-full">
        <motion.h1
          className="font-light leading-[0.82] tracking-[-0.02em] mb-10"
          style={headlineStyle}
          variants={container} initial="hidden" animate="show">
          <motion.span variants={item} className="block">
            {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[0]} /> : h0}
          </motion.span>
          <motion.span variants={item} className="block text-gradient italic">
            {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[1]} /> : h1}
          </motion.span>
          <motion.span variants={item} className="block">
            {animStyle === "stagger-wave" ? <StaggerWords text={cfg.headline[2]} /> : h2}
          </motion.span>
        </motion.h1>
        <div className="flex items-end justify-between flex-wrap gap-6">
          <motion.p className="text-muted-foreground max-w-sm leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}>
            {cfg.sub}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <motion.a href="#projects" onClick={() => haptic(10)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {cfg.cta} <ArrowRight size={14} />
            </motion.a>
          </motion.div>
        </div>
      </div>
      <ScrollHint />
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Stagger wave — per-word rotateX animation
// ─────────────────────────────────────────────────────────────────────────────
function StaggerWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span key={i} className="inline-block mr-[0.22em]"
          initial={{ opacity: 0, y: 28, rotateX: 42 }}
          animate={{ opacity: 1, y: 0,  rotateX: 0  }}
          transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}>
          {word}
        </motion.span>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Hero visual panel — right column of Split variant
// ─────────────────────────────────────────────────────────────────────────────
function HeroVisual() {
  return (
    <div className="relative">
      {/* Floating badge — top left */}
      <motion.div
        className="absolute -top-7 -left-8 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
        style={{ background: "hsl(var(--card)/0.82)", border: "1px solid hsl(var(--border)/0.5)", backdropFilter: "blur(16px)" }}
        animate={{ y: [0, -9, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.2)" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div>
          <p className="text-[11px] font-medium">Stream Active</p>
          <p className="text-[9px] text-muted-foreground">4K · 60fps · Lumen</p>
        </div>
      </motion.div>

      {/* Viewport card */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/30 aspect-[4/3]"
        style={{ background: "radial-gradient(ellipse at 35% 45%, hsl(var(--primary)/0.22) 0%, transparent 55%), hsl(var(--card))" }}>
        <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 300" fill="none">
          <g stroke="hsl(var(--primary))" strokeWidth="0.6" opacity="0.5">
            <rect x="130" y="55" width="140" height="210" />
            <rect x="155" y="38" width="90"  height="227" opacity="0.4" />
            {[...Array(16)].map((_, i) => (
              <line key={i} x1="130" y1={55 + i * 13} x2="270" y2={55 + i * 13} opacity="0.18" />
            ))}
            <line x1="200" y1="8" x2="130" y2="55" opacity="0.3" />
            <line x1="200" y1="8" x2="270" y2="55" opacity="0.3" />
          </g>
          <circle cx="200" cy="8" r="2.5" fill="hsl(var(--primary))" opacity="0.9" />
        </svg>
        <motion.div className="absolute left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,hsl(var(--primary)/0.5),transparent)" }}
          animate={{ top: ["6%", "94%", "6%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }} />
        <div className="absolute top-3 left-3  text-[8px] text-primary/50 font-mono">REC ●</div>
        <div className="absolute top-3 right-3 text-[8px] text-primary/50 font-mono">4096×2160</div>
        <div className="absolute bottom-3 left-3  text-[8px] text-muted-foreground/40 font-mono">UE5 · Nanite · Lumen</div>
        <div className="absolute bottom-3 right-3 text-[8px] text-muted-foreground/40 font-mono">60.0 FPS</div>
      </div>

      {/* Floating badge — bottom right */}
      <motion.div
        className="absolute -bottom-5 -right-7 z-20 px-4 py-3 rounded-2xl shadow-xl"
        style={{ background: "hsl(var(--card)/0.82)", border: "1px solid hsl(var(--border)/0.5)", backdropFilter: "blur(16px)" }}
        animate={{ y: [0, 7, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
        <p className="text-[10px] text-muted-foreground mb-1.5">This week</p>
        <div className="flex items-center gap-1">
          {["A", "M", "K", "J", "R"].map((l, i) => (
            <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-medium"
              style={{ background: "hsl(var(--primary)/0.15)", border: "1px solid hsl(var(--primary)/0.2)", color: "hsl(var(--primary))" }}>
              {l}
            </div>
          ))}
          <span className="text-[9px] text-muted-foreground ml-1.5">+218</span>
        </div>
      </motion.div>
    </div>
  );
}
