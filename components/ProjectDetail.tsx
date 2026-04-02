"use client";

/**
 * ProjectDetail.tsx
 * Redesigned full-screen project story page.
 * Uses the premium Vastu Green aesthetic and consolidated JSONB schema.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useTheme } from "next-themes";
import {
  ArrowLeft, Play, ExternalLink, ChevronLeft, ChevronRight,
  MapPin, ZoomIn, Info, Activity, ExternalLink as ExtIcon
} from "lucide-react";
import { getProjectBlog, type Project, type BlogSection, type SiteUpdate } from "@/lib/supabase";

// ─── Theme Constants ──────────────────────────────────────────────────────────

const VASTU_GREEN = "#e2ffaf";
const VASTU_GREEN_DIM = "rgba(226, 255, 175, 0.6)";
const VASTU_GREEN_FAINT = "rgba(226, 255, 175, 0.1)";
const BG = "#000000";
const FG = "#ffffff";
const MUTED = "rgba(255, 255, 255, 0.5)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function HighlightedText({ text, phrases }: { text: string; phrases: string[] }) {
  if (!phrases.length) return <>{text}</>;
  const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean);
  if (!escaped.length) return <>{text}</>;
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = escaped.some(e => new RegExp(`^${e}$`, "i").test(part));
        return isHighlight ? (
          <motion.span
            key={i}
            initial={{ color: MUTED }}
            whileInView={{ color: VASTU_GREEN }}
            viewport={{ once: true, margin: "-10% 0%" }}
            className="italic font-medium"
          >
            {part}
          </motion.span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

function AnimatedParagraph({ text, phrases, delay = 0 }: { text: string; phrases: string[]; delay?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0%" });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="text-base leading-relaxed font-light text-muted-foreground"
    >
      <HighlightedText text={text} phrases={phrases} />
    </motion.p>
  );
}

function Label({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={12} className="text-vastu-green" />}
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-vastu-green/60">
        {children}
      </span>
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

function Gallery({ media }: { media: SiteUpdate[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!media || media.length === 0) return null;

  const renderMedia = (item: SiteUpdate, isSub = false) => {
    if (!item) return null;
    if (item.media_type === "youtube") {
      let embedUrl = item.media_url;
      // Convert standard youtube watch?v= links to embed links if needed
      if (embedUrl.includes("watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
      } else if (embedUrl.includes("youtu.be/")) {
        embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
      }
      // Remove any extra query params and add autoplay=0 to ensure it doesn't auto-start
      embedUrl = embedUrl.split("&")[0];
      
      return (
        <iframe
          src={embedUrl}
          title="YouTube video player" // Adding standard title for accessibility
          className={`w-full h-full object-cover ${!isSub ? "cursor-auto" : ""}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (item.media_type === "video") {
      return (
        <video 
          src={item.media_url}
          className={`w-full h-full object-cover ${!isSub ? "cursor-auto" : ""}`}
          controls={!isSub}
          autoPlay={false}
          muted={isSub} // mute in thumbnails
          loop={isSub}
        />
      );
    }

    // Default image
    return (
      <img
        src={item.media_url}
        className={`w-full h-full object-cover ${!isSub ? "cursor-zoom-in" : ""}`}
        onClick={() => !isSub && setLightbox(true)}
        alt=""
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-border bg-secondary/20 transition-colors duration-300 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-background/50 transition-colors duration-300"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {renderMedia(media[active])}
          </motion.div>
        </AnimatePresence>
        
        {media.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setActive(i => (i - 1 + media.length) % media.length)} className="p-3 rounded-full bg-background/60 backdrop-blur-md border border-border text-foreground hover:bg-vastu-green hover:text-black transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setActive(i => (i + 1) % media.length)} className="p-3 rounded-full bg-background/60 backdrop-blur-md border border-border text-foreground hover:bg-vastu-green hover:text-black transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {media[active]?.media_type === 'image' && (
          <div className="absolute bottom-6 right-6 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={16} className="text-vastu-green" />
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-24 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === active ? "border-vastu-green scale-105" : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <div className="absolute inset-0 pointer-events-none">
                {m.thumbnail_url ? (
                  <img src={m.thumbnail_url} className="w-full h-full object-cover" alt="Video Thumbnail" />
                ) : (
                  renderMedia(m, true)
                )}
              </div>
              {m.media_type !== "image" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white pointer-events-none">
                  <Play size={12} className="fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            {media[active]?.media_type === "image" ? (
              <motion.img
                src={media[active]?.media_url}
                className="max-w-full max-h-[90vh] rounded-3xl object-contain shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              />
            ) : (
              <motion.div 
               className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black"
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}>
                  {renderMedia(media[active])}
              </motion.div>
            )}
            <button className="absolute top-8 right-8 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-vastu-green transition-colors">Close (Esc)</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectDetail({
  project,
  onBack,
  onLaunch,
  hideBackButton = false,
  isPrivate = false,
}: {
  project: Project;
  onBack: () => void;
  onLaunch: (p: Project) => void;
  hideBackButton?: boolean;
  isPrivate?: boolean;
}) {
  const [data, setData] = useState<Project | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [heroTheme, setHeroTheme] = useState<"main" | "dark" | "light">("main");

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const { theme, setTheme } = useTheme();

  const switchTheme = (t: "light" | "dark") => {
    setHeroTheme(t);
    setTheme(t);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    getProjectBlog(project.id).then(setData);
  }, [project.id]);

  const p = data || project; // Fallback to provided project while loading detailed data

  const specs = [
    { label: "Type", value: p.type },
    { label: "Location", value: p.location },
    { label: "Year", value: p.year },
  ];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-background text-foreground min-h-screen selection:bg-vastu-green selection:text-black transition-colors duration-300 ease-in-out"
    >
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 py-4 px-6 md:px-12 bg-background/40 backdrop-blur-xl border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {hideBackButton ? (
            <div />
          ) : (
            <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-vastu-green transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Projects
            </button>
          )}
          
          <div className="flex items-center gap-6">
            {p.has_live_updates && p.gallery_updates?.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-vastu-green/10 border border-vastu-green/20">
                <div className="w-1.5 h-1.5 rounded-full bg-vastu-green animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-vastu-green">Gallery</span>
              </div>
            )}
            <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-300">
              {p.type} — {p.year}
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="relative h-screen flex items-end justify-start overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={heroTheme}
            src={heroTheme === "dark" && p.image_url_dark ? p.image_url_dark : heroTheme === "light" && p.image_url_light ? p.image_url_light : p.image_url} 
            style={{ y: heroY }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "anticipate" }}
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-colors duration-300" />
        <div className="absolute inset-0 bg-background/10 transition-colors duration-300" />

        <motion.div 
          style={{ opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-12 pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-vastu-green">
              <MapPin size={14} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">{p.location}</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-medium tracking-tighter leading-[0.85] text-foreground transition-colors duration-300">
              {p.title.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground font-light leading-relaxed transition-colors duration-300">
              {p.description}
            </p>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-foreground to-transparent animate-draw-line transition-colors duration-300" />
        </div>

        {/* Theme Toggle */}
        {(p.image_url_dark || p.image_url_light) && (
          <div className="absolute bottom-10 right-8 md:right-12 z-20 flex gap-2 p-1.5 rounded-full bg-background/40 backdrop-blur-md border border-border transition-colors duration-300">
            <button onClick={() => switchTheme("light")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${heroTheme === "light" || heroTheme === "main" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>Light Mode</button>
            <button onClick={() => switchTheme("dark")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${heroTheme === "dark" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>Dark Mode</button>
          </div>
        )}
      </header>

      {/* ── Main Layout ── */}
      <main className="max-w-7xl mx-auto px-8 md:px-12 py-32">
        <div className="grid lg:grid-cols-[1fr_380px] gap-24 lg:gap-32">
          
          {/* Content Left */}
          <div className="space-y-32">
            
            {/* Story Overview */}
            {p.long_description && (
              <section className="space-y-8">
                <Label icon={Info}>The Concept</Label>
                <div className="prose prose-invert max-w-none">
                  <AnimatedParagraph text={p.long_description} phrases={[]} />
                </div>
              </section>
            )}

            {/* Sub Sections */}
            {(p.narrative_sections || []).length > 0 && (
              <div className="space-y-32">
                {p.narrative_sections.map((s, i) => (
                  <section key={i} className="space-y-8">
                    <Label icon={Activity}>{s.title}</Label>
                    <AnimatedParagraph 
                      text={s.body} 
                      phrases={(s.highlight_phrases || "").split(',').map(x => x.trim())} 
                    />
                  </section>
                ))}
              </div>
            )}

            {/* Gallery Section */}
            {(p.gallery_updates || []).length > 0 && (
              <section className="space-y-12">
                <Label icon={ZoomIn}>Site Immersive Gallery</Label>
                <Gallery media={p.gallery_updates} />
              </section>
            )}

          </div>

          {/* Sidebar Right */}
          <aside className="space-y-12">
            
            {/* Project Info Card */}
            <div className="p-10 rounded-[2.5rem] bg-secondary/40 border border-border backdrop-blur-md space-y-10 lg:sticky lg:top-32 transition-colors duration-300">
              <div className="space-y-6">
                 <Label>{p.title}</Label>
                 <div className="grid gap-6">
                    {specs.map(spec => (
                      <div key={spec.label} className="group border-b border-border transition-colors duration-300 pb-4 last:border-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-vastu-green transition-colors">{spec.label}</p>
                        <p className="text-sm text-foreground/80 font-light mt-1 transition-colors duration-300">{spec.value}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Launcher */}
              {p.stream_url && (
                <button
                  onClick={() => onLaunch(p)}
                  className="w-full h-16 rounded-2xl bg-foreground text-background font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-vastu-green hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-vastu-green/20"
                >
                  <Play size={14} fill="currentColor" />
                  Launch Experience
                  <ExternalLink size={12} className="opacity-40" />
                </button>
              )}
            </div>

          </aside>
        </div>


      </main>

      <footer className="py-24 border-t border-border transition-colors duration-300 text-center px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30 transition-colors duration-300">VastuChitra ArchViz — {new Date().getFullYear()}</p>
      </footer>
    </motion.div>
  );
}
