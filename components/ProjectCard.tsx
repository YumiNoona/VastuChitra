"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { MapPin, Calendar, ArrowUpRight, Sparkles } from "lucide-react";
import { Project } from "@/lib/supabase";
import { useSiteConfig } from "./SiteConfigProvider";

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  Residential: { bg: "hsl(142 40% 35% / 0.12)", text: "hsl(142 55% 55%)", border: "hsl(142 40% 40% / 0.25)" },
  Commercial:  { bg: "hsl(210 60% 45% / 0.12)", text: "hsl(210 70% 62%)", border: "hsl(210 60% 50% / 0.25)" },
  "Mixed-Use": { bg: "hsl(38 65% 50% / 0.12)",  text: "hsl(38 75% 62%)",  border: "hsl(38 65% 55% / 0.3)"  },
  Hospitality: { bg: "hsl(290 45% 45% / 0.12)", text: "hsl(290 55% 68%)", border: "hsl(290 45% 50% / 0.25)" },
  Cultural:    { bg: "hsl(0 55% 50% / 0.12)",   text: "hsl(0 65% 65%)",   border: "hsl(0 55% 52% / 0.25)"  },
};

interface Props { project: Project; index: number; onLaunch: (p: Project) => void; }

// ── Tilt hook ─────────────────────────────────────────────────────────────────
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };
  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

export default function ProjectCard({ project, index, onLaunch }: Props) {
  const [hovered, setHovered] = useState(false);
  const { config } = useSiteConfig();
  const effect = config.cardHoverEffect ?? "glow";
  const tc = typeColors[project.type] ?? typeColors.Residential;
  const tilt = useTilt();

  // ── Per-effect styles ────────────────────────────────────────────────────────
  const getCardStyle = () => {
    const base = {
      background: "hsl(222 22% 7%)",
      borderColor: "hsl(222 18% 13%)",
      boxShadow: "0 4px 20px hsl(222 24% 3% / 0.4)",
      transition: "border-color 0.35s, box-shadow 0.35s, filter 0.35s",
    };
    if (!hovered) return base;
    if (effect === "glow")   return { ...base, borderColor: "hsl(38 35% 28%)",      boxShadow: "0 20px 56px hsl(38 65% 20% / 0.22), 0 4px 20px hsl(222 24% 3% / 0.5)" };
    if (effect === "tint")   return { ...base, borderColor: "hsl(38 50% 30%)",      boxShadow: "0 8px 32px hsl(222 24% 3% / 0.5)", filter: "brightness(1.08) saturate(1.1)" };
    if (effect === "lift")   return { ...base, borderColor: "hsl(222 18% 22%)",     boxShadow: "0 32px 64px hsl(222 24% 2% / 0.6), 0 8px 24px hsl(38 65% 10% / 0.15)" };
    if (effect === "border-trace") return { ...base, borderColor: "hsl(38 65% 58%)", boxShadow: "0 0 0 1px hsl(38 65% 58% / 0.3), 0 8px 32px hsl(38 65% 20% / 0.12)" };
    return base; // tilt — style comes from motion values
  };

  const liftY = effect === "lift" && hovered ? -10 : 0;

  const card = (
    <motion.article
      ref={effect === "tilt" ? tilt.ref : undefined}
      className="group relative rounded-2xl overflow-hidden border flex flex-col"
      style={{
        ...getCardStyle(),
        ...(effect === "tilt" ? {
          rotateX: tilt.rotateX, rotateY: tilt.rotateY,
          transformStyle: "preserve-3d", perspective: 1000,
        } : {}),
      }}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      animate={{ y: liftY }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onMouseMove={effect === "tilt" ? tilt.onMouseMove : undefined}
      onMouseLeave={effect === "tilt" ? tilt.onMouseLeave : undefined}
    >
      {/* Tint overlay */}
      {effect === "tint" && (
        <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{ background: "linear-gradient(135deg, hsl(38 65% 58% / 0.07), hsl(210 70% 60% / 0.05))", opacity: hovered ? 1 : 0 }}/>
      )}

      {/* Border trace shimmer */}
      {effect === "border-trace" && hovered && (
        <motion.div className="absolute inset-0 z-10 pointer-events-none rounded-2xl overflow-hidden">
          <motion.div className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent, hsl(38 65% 58% / 0.15), transparent)", width: "60%" }}
            animate={{ x: ["-60%", "200%"] }}
            transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}/>
        </motion.div>
      )}

      {/* Image area */}
      <div className="relative h-52 overflow-hidden flex-shrink-0" style={{ background: "hsl(222 18% 11%)" }}>
        {project.image_url ? (
          <img src={project.image_url} alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}/>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "radial-gradient(ellipse at 40% 40%, hsl(222 35% 8%), hsl(222 25% 11%), hsl(222 20% 13%))" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="hsl(38 40% 35%)" strokeWidth="0.8">
              <rect x="15" y="15" width="50" height="50" opacity="0.4"/>
              <rect x="25" y="25" width="30" height="30" opacity="0.25"/>
              <line x1="15" y1="15" x2="25" y2="25" opacity="0.3"/>
              <line x1="65" y1="15" x2="55" y2="25" opacity="0.3"/>
              <line x1="15" y1="65" x2="25" y2="55" opacity="0.3"/>
              <line x1="65" y1="65" x2="55" y2="55" opacity="0.3"/>
            </svg>
          </div>
        )}

        <div className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "hsl(38 65% 5% / 0.3)", opacity: hovered ? 0.5 : 0 }}/>

        <div className="absolute top-3.5 left-3.5">
          <span className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full border"
            style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}>
            {project.type}
          </span>
        </div>

        <motion.div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "hsl(38 65% 58%)" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}>
          <ArrowUpRight size={14} color="hsl(222 24% 5%)"/>
        </motion.div>

        {project.featured && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "hsl(38 65% 58% / 0.15)", color: "hsl(38 65% 65%)", border: "1px solid hsl(38 65% 55% / 0.3)" }}>
              <Sparkles size={8}/> Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-light mb-1.5 transition-colors duration-300"
          style={{ fontFamily: "var(--font-display)", color: hovered ? "hsl(38 65% 65%)" : "hsl(38 15% 88%)" }}>
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed mb-4 flex-1 line-clamp-3" style={{ color: "hsl(38 8% 52%)" }}>
          {project.description}
        </p>
        <div className="flex items-center gap-4 text-[11px] mb-4" style={{ color: "hsl(38 8% 42%)" }}>
          <span className="flex items-center gap-1 truncate"><MapPin size={10}/>{project.location}</span>
          <span className="flex items-center gap-1 flex-shrink-0"><Calendar size={10}/>{project.year}</span>
        </div>
        <button onClick={() => onLaunch(project)}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border"
          style={{
            borderColor: hovered ? "hsl(38 50% 40%)" : "hsl(222 18% 16%)",
            color: hovered ? "hsl(38 65% 62%)" : "hsl(38 8% 50%)",
            background: hovered ? "hsl(38 65% 58% / 0.06)" : "transparent",
          }}>
          Launch Experience
        </button>
      </div>
    </motion.article>
  );

  return card;
}
