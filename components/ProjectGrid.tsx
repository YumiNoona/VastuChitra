"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowUpRight, MapPin, LayoutGrid, Rows3, Filter } from "lucide-react";
import { getActiveProjects, Project, ProjectType } from "@/lib/supabase";
import ProjectCarousel, { CarouselStyle } from "./ProjectCarousel";

const FILTERS: Array<ProjectType | "All"> = [
  "All", "Residential", "Commercial", "Mixed-Use", "Hospitality", "Cultural",
];

function ProjectCard({
  project,
  index,
  onExplore,
}: {
  project: Project;
  index: number;
  onExplore: (p: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-pointer"
      onClick={() => onExplore(project)}
    >
      <div className="relative overflow-hidden bg-secondary/30 h-full flex flex-col rounded-[2.5rem] border border-white/5 group-hover:border-vastu-green/20 group-hover:bg-secondary/50 transition-all duration-500 shadow-2xl group-hover:shadow-vastu-green/5">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img
            src={project.image_url}
            alt={project.title}
            loading="lazy"
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          
          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 rounded-full bg-vastu-green/20 border border-vastu-green/30 text-vastu-green text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-3">
            <h3 className={`text-2xl font-medium tracking-tight transition-colors ${hovered ? "text-vastu-green" : "text-foreground"}`}>
              {project.title}
            </h3>
            <div className={`p-2 rounded-full border transition-all duration-500 ${hovered ? "border-vastu-green/50 text-vastu-green translate-x-1 -translate-y-1" : "border-white/10 text-muted-foreground"}`}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mb-5">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="opacity-50" />
              {project.location}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="uppercase tracking-widest text-[10px] opacity-70">{project.type}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 font-light leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
            {project.description || "Experimental architectural visualization exploring new paradigms of space and light."}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${hovered ? "bg-vastu-green animate-pulse" : "bg-white/20"}`} />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">
                Project {project.year}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectGrid({ onSelectProject }: { onSelectProject: (p: Project) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProjectType | "All">("All");
  const [view, setView] = useState<"carousel" | "grid">("grid"); // Default to grid for Vercel feel
  const carouselStyle = "dynamic";

  useEffect(() => {
    getActiveProjects().then(d => { setProjects(d); setLoading(false); });
  }, []);

  const filtered = filter === "All" ? projects : projects.filter(p => p.type === filter);
  const handleExplore = (p: Project) => { onSelectProject(p); };

  return (
    <section id="projects" className="py-24 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4">
              Explore <span className="text-sweep">Featured</span> Projects
            </h2>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              A curated selection of our most groundbreaking architectural visualizations.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2 p-1 bg-secondary border border-border rounded-lg">
              <button 
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setView("carousel")}
                className={`p-1.5 rounded-md transition-all ${view === "carousel" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Rows3 size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <Filter size={14} className="text-muted-foreground shrink-0" />
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filter === f 
                    ? "bg-foreground text-background" 
                    : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-20">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/10] bg-secondary animate-pulse rounded-xl border border-border" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No projects found for the selected category.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "carousel" ? (
              <motion.div 
                key="carousel" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="py-10"
              >
                <ProjectCarousel
                  projects={filtered}
                  style={carouselStyle as CarouselStyle || "dynamic"}
                  onLaunch={() => {}}
                  onViewStory={handleExplore}
                  onViewUpdates={handleExplore}
                  onExplore={handleExplore}
                />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filtered.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} onExplore={handleExplore} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
