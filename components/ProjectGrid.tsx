"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Sliders } from "lucide-react";
import { getProjects, Project, ProjectType } from "@/lib/supabase";
import ProjectCard from "./ProjectCard";
import ProjectCarousel, { CarouselStyle } from "./ProjectCarousel";
import LaunchModal from "./LaunchModal";
import { haptic, cn } from "@/lib/utils";
import { useDebug } from "./DebugPanel";

const filters: Array<ProjectType | "All"> = ["All","Residential","Commercial","Mixed-Use","Hospitality","Cultural"];

export default function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<ProjectType | "All">("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [view, setView]         = useState<"grid" | "carousel">("carousel");
  const { carouselStyle }       = useDebug();

  useEffect(() => {
    getProjects().then(data => { setProjects(data); setLoading(false); });
  }, []);

  const filtered = filter === "All" ? projects : projects.filter(p => p.type === filter);

  return (
    <section id="projects" className="relative py-28 overflow-hidden" aria-labelledby="projects-title">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <motion.span className="text-xs font-medium tracking-[0.15em] uppercase text-primary/70 block mb-3"
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              — Portfolio
            </motion.span>
            <motion.h2 id="projects-title"
              className="font-light leading-[0.9] tracking-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4.5rem)" }}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.08 }}>
              Selected<br /><span className="text-gradient italic">Projects</span>
            </motion.h2>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-border/50"
              style={{ background: "hsl(var(--card)/0.5)" }}>
              {([["carousel", Sliders], ["grid", LayoutGrid]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => { setView(v); haptic(4); }}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                    view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  <Icon size={12} /> {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <motion.div className="flex items-center gap-2 mb-10 flex-wrap"
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {filters.map(f => (
            <button key={f} onClick={() => { setFilter(f); haptic(3); }}
              className={cn("px-4 py-1.5 rounded-full text-xs font-medium border transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30")}>
              {f}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground text-sm">No projects yet.</div>
        ) : view === "carousel" ? (
          <ProjectCarousel
            projects={filtered}
            style={carouselStyle as CarouselStyle}
            onSelect={p => setSelected(p)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onLaunch={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && <LaunchModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
