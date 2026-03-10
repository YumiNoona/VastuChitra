"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";
import { Project } from "@/lib/supabase";

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  Residential: { bg: "hsl(142 40% 35% / 0.12)", text: "hsl(142 55% 55%)", border: "hsl(142 40% 40% / 0.25)" },
  Commercial:  { bg: "hsl(210 60% 45% / 0.12)", text: "hsl(210 70% 62%)", border: "hsl(210 60% 50% / 0.25)" },
  "Mixed-Use": { bg: "hsl(38 65% 50% / 0.12)",  text: "hsl(38 75% 62%)",  border: "hsl(38 65% 55% / 0.3)" },
  Hospitality: { bg: "hsl(290 45% 45% / 0.12)", text: "hsl(290 55% 68%)", border: "hsl(290 45% 50% / 0.25)" },
  Cultural:    { bg: "hsl(0 55% 50% / 0.12)",   text: "hsl(0 65% 65%)",   border: "hsl(0 55% 52% / 0.25)" },
};

const cardGradients: Record<string, string> = {
  "luminara-tower":  "hsl(222 35% 8%), hsl(230 30% 12%), hsl(38 40% 12%)",
  "helix-pavilion":  "hsl(222 35% 8%), hsl(210 40% 11%), hsl(195 35% 12%)",
  "villa-solara":    "hsl(222 35% 8%), hsl(38 35% 11%),  hsl(30 40% 12%)",
  "nexus-district":  "hsl(222 35% 8%), hsl(260 30% 12%), hsl(222 35% 10%)",
  "aurora-resort":   "hsl(222 35% 8%), hsl(170 30% 10%), hsl(142 25% 11%)",
  "meridian-museum": "hsl(222 35% 8%), hsl(0 25% 11%),   hsl(15 30% 12%)",
};

interface Props { project: Project; index: number; onLaunch: (p: Project) => void; }

export default function ProjectCard({ project, index, onLaunch }: Props) {
  const [hovered, setHovered] = useState(false);
  const tc = typeColors[project.type] ?? typeColors.Residential;
  const grad = cardGradients[project.id] ?? "hsl(222 35% 8%), hsl(222 25% 11%), hsl(222 20% 13%)";

  return (
    <motion.article
      className="group relative rounded-2xl overflow-hidden border flex flex-col"
      style={{
        background: "hsl(222 22% 7%)",
        borderColor: hovered ? "hsl(38 35% 28%)" : "hsl(222 18% 13%)",
        boxShadow: hovered ? "0 20px 56px hsl(38 65% 20% / 0.18), 0 4px 20px hsl(222 24% 3% / 0.5)" : "0 4px 20px hsl(222 24% 3% / 0.4)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        {project.image_url ? (
          // Real image from Supabase Storage
          <img
            src={project.image_url}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
          />
        ) : (
          // Fallback SVG illustration
          <>
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse at 40% 40%, ${grad})`,
            }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <CardIllustration id={project.id} hovered={hovered} />
            </div>
          </>
        )}

        {/* Hover darken */}
        <div className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "hsl(38 65% 5% / 0.3)", opacity: hovered ? 0.5 : 0 }} />

        {/* Type badge */}
        <div className="absolute top-3.5 left-3.5">
          <span className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full border"
            style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}>
            {project.type}
          </span>
        </div>

        {/* Arrow */}
        <motion.div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "hsl(38 65% 58%)" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}>
          <ArrowUpRight size={14} color="hsl(222 24% 5%)" />
        </motion.div>

        {project.featured && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{ background: "hsl(38 65% 58% / 0.15)", color: "hsl(38 65% 65%)", border: "1px solid hsl(38 65% 55% / 0.3)" }}>
              Featured
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
        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "hsl(38 8% 52%)" }}>
          {project.description}
        </p>

        <div className="flex items-center gap-4 text-[11px] mb-4" style={{ color: "hsl(38 8% 42%)" }}>
          <span className="flex items-center gap-1"><MapPin size={10} />{project.location}</span>
          <span className="flex items-center gap-1"><Calendar size={10} />{project.year}</span>
        </div>

        <button
          onClick={() => onLaunch(project)}
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
}

function CardIllustration({ id, hovered }: { id: string; hovered: boolean }) {
  const color = hovered ? "hsl(38,65%,62%)" : "hsl(38,40%,45%)";
  const dim = hovered ? 0.5 : 0.25;

  const shapes: Record<string, React.ReactNode> = {
    "luminara-tower": (
      <svg width="110" height="160" viewBox="0 0 110 160" fill="none" stroke={color} strokeWidth="0.8" style={{ transition: "stroke 0.3s" }}>
        <rect x="25" y="15" width="60" height="130" opacity={dim} />
        <rect x="35" y="5"  width="40" height="140" opacity={dim * 0.6} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="25" y1={15 + i * 10} x2="85" y2={15 + i * 10} opacity={dim * 0.7} />
        ))}
        <line x1="55" y1="0" x2="55" y2="15" />
        <circle cx="55" cy="145" r="3" fill={color} opacity="0.8" />
      </svg>
    ),
    "helix-pavilion": (
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" stroke={color} strokeWidth="0.8" style={{ transition: "stroke 0.3s" }}>
        <ellipse cx="80" cy="60" rx="65" ry="38" opacity={dim} />
        <ellipse cx="80" cy="60" rx="42" ry="24" opacity={dim * 0.7} />
        <ellipse cx="80" cy="60" rx="20" ry="11" opacity={dim * 0.5} />
        <line x1="15" y1="60" x2="145" y2="60" opacity={dim * 0.5} />
        <line x1="80" y1="22" x2="80" y2="98" opacity={dim * 0.5} />
      </svg>
    ),
    "villa-solara": (
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" stroke={color} strokeWidth="0.8" style={{ transition: "stroke 0.3s" }}>
        <polygon points="80,15 145,65 15,65" opacity={dim} />
        <rect x="25" y="65" width="110" height="45" opacity={dim} />
        <rect x="65" y="75" width="30" height="35" opacity={dim * 0.6} />
        {[35, 60, 90, 115].map(x => (
          <rect key={x} x={x} y="72" width="14" height="16" opacity={dim * 0.5} />
        ))}
        <line x1="0" y1="108" x2="160" y2="108" opacity={dim * 0.4} />
      </svg>
    ),
    "nexus-district": (
      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" stroke={color} strokeWidth="0.8" style={{ transition: "stroke 0.3s" }}>
        <rect x="20" y="30" width="50" height="110" opacity={dim} />
        <rect x="80" y="55" width="50" height="85" opacity={dim} />
        <rect x="40" y="15" width="30" height="125" opacity={dim * 0.5} />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1="20" y1={30 + i * 13} x2="70" y2={30 + i * 13} opacity={dim * 0.5} />
        ))}
        <line x1="0" y1="138" x2="150" y2="138" opacity={dim * 0.4} />
      </svg>
    ),
  };

  return (
    <div style={{ opacity: 0.65, transition: "opacity 0.3s" }}>
      {shapes[id] ?? (
        <svg width="130" height="130" viewBox="0 0 130 130" fill="none" stroke={color} strokeWidth="0.8">
          <rect x="20" y="20" width="90" height="90" opacity={dim} />
          <rect x="38" y="38" width="54" height="54" opacity={dim * 0.6} />
          <line x1="20" y1="20" x2="38" y2="38" opacity={dim * 0.5} />
          <line x1="110" y1="20" x2="92" y2="38" opacity={dim * 0.5} />
          <line x1="20" y1="110" x2="38" y2="92" opacity={dim * 0.5} />
          <line x1="110" y1="110" x2="92" y2="92" opacity={dim * 0.5} />
        </svg>
      )}
    </div>
  );
}
