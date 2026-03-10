"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, Type, Palette, Layout, Eye, Zap, Globe, Save, Trash2 as Trash,
  MousePointer, Image, AlignLeft, Phone, MapPin, Mail, Link, Sparkles } from "lucide-react";
import { useSiteConfig, DebugPreset, DebugLayout, SiteConfig, DEFAULT_LAYOUT } from "./SiteConfigProvider";

/* ══════════════════════════════════════════════════════════  FONTS  */
export const FONTS = [
  { id:"editorial",  label:"Editorial",      sub:"Cormorant Garamond · architectural serif", display:"'Cormorant Garamond', Georgia, serif",      body:"'DM Sans', system-ui, sans-serif",       url:null },
  { id:"vercel",     label:"Vercel / Geist",  sub:"Inter · sharp modern system",              display:"'Inter', system-ui, sans-serif",            body:"'Inter', system-ui, sans-serif",         url:"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" },
  { id:"supabase",   label:"Supabase",        sub:"DM Sans · technical precision",            display:"'DM Sans', system-ui, sans-serif",          body:"'DM Sans', system-ui, sans-serif",       url:null },
  { id:"apple",      label:"Apple SF Pro",    sub:"System · immaculate precision",            display:"-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", body:"-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif", url:null },
  { id:"chanel",     label:"Chanel",          sub:"Playfair Display · haute couture",         display:"'Playfair Display', 'Didot', serif",         body:"'Jost', 'DM Sans', sans-serif",          url:"https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Jost:wght@300;400;500&display=swap" },
  { id:"neue",       label:"Swiss Neue",      sub:"Space Grotesk · bold Swiss design",        display:"'Space Grotesk', system-ui, sans-serif",    body:"'Space Grotesk', system-ui, sans-serif", url:"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" },
  { id:"mono",       label:"Mono / Terminal", sub:"JetBrains Mono · raw technical",           display:"'JetBrains Mono', 'DM Mono', monospace",    body:"'JetBrains Mono', 'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" },
  { id:"fraunces",   label:"Fraunces",        sub:"Fraunces · optical soft serif",            display:"'Fraunces', serif",                          body:"'Outfit', sans-serif",                   url:"https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap" },
] as const;

/* ══════════════════════════════════════════════════════════  THEMES  */
const DARK_THEMES = [
  { id:"obsidian",      label:"Obsidian",      sub:"Warm violet charcoal",   sw:["#0C0B18","#16152A","#A78BFA"], vars:{"--background":"240 15% 6%","--foreground":"40 18% 91%","--card":"240 14% 9%","--card-foreground":"40 18% 91%","--border":"240 10% 14%","--muted":"240 12% 13%","--muted-foreground":"240 6% 50%","--primary":"258 78% 70%","--primary-foreground":"0 0% 100%","--secondary":"240 12% 13%","--secondary-foreground":"40 12% 78%","--accent":"258 78% 70%","--accent-foreground":"0 0% 100%","--input":"240 10% 14%","--ring":"258 78% 70%"} },
  { id:"vercel-dark",   label:"Vercel",        sub:"Pure ash black",          sw:["#0A0A0A","#171717","#EDEDED"], vars:{"--background":"0 0% 4%","--foreground":"0 0% 93%","--card":"0 0% 7%","--card-foreground":"0 0% 93%","--border":"0 0% 12%","--muted":"0 0% 10%","--muted-foreground":"0 0% 46%","--primary":"0 0% 92%","--primary-foreground":"0 0% 5%","--secondary":"0 0% 10%","--secondary-foreground":"0 0% 80%","--accent":"0 0% 92%","--accent-foreground":"0 0% 5%","--input":"0 0% 12%","--ring":"0 0% 92%"} },
  { id:"midnight-teal", label:"Midnight Teal", sub:"Deep ocean & teal glow",  sw:["#030E12","#072030","#14B8A6"], vars:{"--background":"196 60% 4%","--foreground":"185 25% 90%","--card":"196 55% 7%","--card-foreground":"185 25% 90%","--border":"196 35% 12%","--muted":"196 40% 10%","--muted-foreground":"196 12% 50%","--primary":"174 85% 42%","--primary-foreground":"196 60% 4%","--secondary":"196 40% 10%","--secondary-foreground":"185 20% 75%","--accent":"174 85% 42%","--accent-foreground":"196 60% 4%","--input":"196 35% 12%","--ring":"174 85% 42%"} },
  { id:"ember",         label:"Ember",         sub:"Dark amber & fire",        sw:["#0D0700","#1E1100","#F59E0B"], vars:{"--background":"28 70% 4%","--foreground":"40 30% 90%","--card":"28 60% 7%","--card-foreground":"40 30% 90%","--border":"28 40% 12%","--muted":"28 45% 10%","--muted-foreground":"28 12% 50%","--primary":"38 96% 54%","--primary-foreground":"28 70% 4%","--secondary":"28 45% 10%","--secondary-foreground":"40 22% 75%","--accent":"38 96% 54%","--accent-foreground":"28 70% 4%","--input":"28 40% 12%","--ring":"38 96% 54%"} },
] as const;

const LIGHT_THEMES = [
  { id:"saffron",    label:"Saffron",     sub:"Warm amber cream",      sw:["#F5EFE0","#FDE9C5","#EA6A1A"], vars:{"--background":"38 52% 95%","--foreground":"220 30% 10%","--card":"38 40% 91%","--card-foreground":"220 30% 10%","--border":"38 20% 80%","--muted":"38 25% 88%","--muted-foreground":"220 14% 42%","--primary":"22 92% 48%","--primary-foreground":"0 0% 100%","--secondary":"38 30% 86%","--secondary-foreground":"220 25% 15%","--accent":"22 92% 48%","--accent-foreground":"0 0% 100%","--input":"38 20% 80%","--ring":"22 92% 48%"} },
  { id:"arctic",     label:"Arctic Sky",  sub:"Sky blue & fresh teal", sw:["#EBF5FF","#C8E6FF","#0EA5E9"], vars:{"--background":"210 70% 97%","--foreground":"215 35% 10%","--card":"210 55% 93%","--card-foreground":"215 35% 10%","--border":"210 30% 84%","--muted":"210 35% 90%","--muted-foreground":"215 16% 44%","--primary":"199 89% 46%","--primary-foreground":"0 0% 100%","--secondary":"210 30% 88%","--secondary-foreground":"215 28% 18%","--accent":"199 89% 46%","--accent-foreground":"0 0% 100%","--input":"210 30% 84%","--ring":"199 89% 46%"} },
  { id:"rose-linen", label:"Rose Linen",  sub:"Dusty rose & terracotta",sw:["#FDF0F0","#F9E0E0","#DC4444"], vars:{"--background":"0 40% 97%","--foreground":"355 30% 12%","--card":"0 28% 93%","--card-foreground":"355 30% 12%","--border":"0 20% 84%","--muted":"0 22% 90%","--muted-foreground":"355 12% 45%","--primary":"4 78% 52%","--primary-foreground":"0 0% 100%","--secondary":"0 22% 88%","--secondary-foreground":"355 25% 18%","--accent":"4 78% 52%","--accent-foreground":"0 0% 100%","--input":"0 20% 84%","--ring":"4 78% 52%"} },
  { id:"forest",     label:"Forest Sage", sub:"Deep green & gold",     sw:["#F0F5EE","#DCF0D8","#3D8F4A"], vars:{"--background":"120 25% 96%","--foreground":"130 35% 10%","--card":"120 18% 91%","--card-foreground":"130 35% 10%","--border":"120 15% 82%","--muted":"120 15% 88%","--muted-foreground":"130 12% 44%","--primary":"135 45% 35%","--primary-foreground":"0 0% 100%","--secondary":"120 15% 86%","--secondary-foreground":"130 28% 15%","--accent":"135 45% 35%","--accent-foreground":"0 0% 100%","--input":"120 15% 82%","--ring":"135 45% 35%"} },
] as const;

/* ══════════════════════════════════════════════════════════  OPTION LISTS  */
const CAROUSEL_STYLES = [
  { id:"fan-3d",      label:"3D Fan",       sub:"Perspective rotation spread" },
  { id:"glass-stack", label:"Glass Stack",  sub:"Frosted stacked cards"        },
  { id:"coverflow",   label:"Coverflow",    sub:"iTunes-style flip"            },
  { id:"orbital",     label:"Orbital",      sub:"Circular orbit layout"        },
] as const;

const PAGE_ANIMATIONS = [
  { id:"fade-blur",    label:"Fade + Blur",   sub:"Soft blur reveal"     },
  { id:"slide-up",     label:"Slide Up",      sub:"Classic upward slide" },
  { id:"spring-pop",   label:"Spring Pop",    sub:"Bouncy spring"        },
  { id:"split-reveal", label:"Split Reveal",  sub:"Text splits apart"    },
  { id:"scramble",     label:"Scramble",      sub:"Matrix text scramble" },
  { id:"stagger-wave", label:"Stagger Wave",  sub:"Wave through words"   },
] as const;

const CURSOR_VARIANTS = [
  { id:"dot-ring",   label:"Dot + Ring",  sub:"Classic dot with trailing ring"    },
  { id:"crosshair",  label:"Crosshair",   sub:"Precision architectural reticle"   },
  { id:"spotlight",  label:"Spotlight",   sub:"Soft glow follows cursor"          },
  { id:"magnetic",   label:"Magnetic",    sub:"Morphing blob with blend mode"     },
] as const;

export const HERO_VARIANTS = [
  { id:"split",    label:"Split",     sub:"Text left · visual right" },
  { id:"centered", label:"Centered",  sub:"Full center · cinematic"  },
  { id:"bold",     label:"Bold Type", sub:"Giant headline · minimal" },
] as const;

export const FOOTER_VARIANTS = [
  { id:"minimal",  label:"Minimal",     sub:"Single line"    },
  { id:"full",     label:"Full Grid",   sub:"Links & brand"  },
  { id:"centered", label:"Centered",    sub:"Logo + links"   },
] as const;

const CARD_EFFECTS = [
  { id:"glow",         label:"Glow",         sub:"Warm ambient shadow bloom"         },
  { id:"tilt",         label:"3D Tilt",       sub:"Mouse-tracked 3D perspective tilt" },
  { id:"tint",         label:"Colour Tint",   sub:"Gold gradient overlay on hover"    },
  { id:"lift",         label:"Lift",          sub:"Card floats up with deep shadow"   },
  { id:"border-trace", label:"Border Trace",  sub:"Light shimmer traces the border"   },
] as const;

/* ══════════════════════════════════════════════════════════  CONTEXT  */
interface DebugCtx { heroVariant:string; footerVariant:string; carouselStyle:string; pageAnimation:string; cursorVariant:string; }
const DebugContext = createContext<DebugCtx>({ heroVariant:"split", footerVariant:"minimal", carouselStyle:"fan-3d", pageAnimation:"fade-blur", cursorVariant:"dot-ring" });
export const useDebug = () => useContext(DebugContext);

/* ══════════════════════════════════════════════════════════  PROVIDER  */
export function DebugProvider({ children }: { children: React.ReactNode }) {
  const { layout, layoutLoaded, saveLayout } = useSiteConfig();

  // Initialize with hardcoded defaults — Supabase will override via useEffect below
  const [heroVariant,   setHeroVariantState]   = useState("split");
  const [footerVariant, setFooterVariantState] = useState("minimal");
  const [carouselStyle, setCarouselStyleState] = useState("fan-3d");
  const [pageAnimation, setPageAnimationState] = useState("fade-blur");
  const [cursorVariant, setCursorVariantState] = useState("dot-ring");
  const [fontId,        setFontId]             = useState("editorial");
  const [darkId,        setDarkId]             = useState("obsidian");
  const [lightId,       setLightId]            = useState("saffron");
  const [open,  setOpen]  = useState(false);
  const [tab,   setTab]   = useState<"font"|"theme"|"layout"|"motion"|"cards"|"site"|"content"|"presets">("font");
  // Track whether Supabase has loaded real data yet
  const layoutLoadedRef = useRef(false);

  // ── THE FIX ─────────────────────────────────────────────────────────────────
  // useState(layout.xxx) only reads the value ONCE at mount — at that moment
  // layout is still DEFAULT_LAYOUT because Supabase hasn't responded yet.
  // layoutLoaded flips to true once SiteConfigProvider gets the DB response.
  useEffect(() => {
    if (!layoutLoaded) return; // Supabase hasn't responded yet, don't overwrite
    layoutLoadedRef.current = true;
    setHeroVariantState(layout.heroVariant);
    setFooterVariantState(layout.footerVariant);
    setCarouselStyleState(layout.carouselStyle);
    setPageAnimationState(layout.animStyle);
    setCursorVariantState(layout.cursorStyle);
    setFontId(layout.fontId);
    setDarkId(layout.darkId);
    setLightId(layout.lightId);
    applyFontById(layout.fontId);
    applyThemeById(layout.darkId, true);
    applyThemeById(layout.lightId, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutLoaded, layout]);

  const persist = (patch: Partial<DebugLayout>) => {
    const next: DebugLayout = {
      fontId, darkId, lightId,
      heroVariant, footerVariant, carouselStyle,
      animStyle: pageAnimation, cursorStyle: cursorVariant,
      ...patch,
    };
    saveLayout(next);
  };

  const applyFontById = (id: string) => {
    const f = FONTS.find(x => x.id === id); if (!f) return;
    const old = document.getElementById("dbg-gf"); if (old) old.remove();
    if (f.url) { const lnk = document.createElement("link"); lnk.id="dbg-gf"; lnk.rel="stylesheet"; lnk.href=f.url; document.head.appendChild(lnk); }
    document.documentElement.style.setProperty("--font-display", f.display);
    document.documentElement.style.setProperty("--font-body", f.body);
    document.body.style.fontFamily = f.body;
  };

  const applyFont = (id: string) => { setFontId(id); applyFontById(id); persist({ fontId: id }); };

  const applyThemeById = (id: string, dark: boolean) => {
    const list = dark ? DARK_THEMES : LIGHT_THEMES;
    const t = list.find(x => x.id === id); if (!t) return;
    Object.entries(t.vars).forEach(([k,v]) => document.documentElement.style.setProperty(k, v as string));
  };

  const applyTheme = (id: string, dark: boolean) => {
    applyThemeById(id, dark);
    if (dark) { setDarkId(id); persist({ darkId: id }); }
    else      { setLightId(id); persist({ lightId: id }); }
  };

  const setHeroVariant   = (v: string) => { setHeroVariantState(v);   persist({ heroVariant: v }); };
  const setFooterVariant = (v: string) => { setFooterVariantState(v); persist({ footerVariant: v }); };
  const setCarouselStyle = (v: string) => { setCarouselStyleState(v); persist({ carouselStyle: v }); };
  const setPageAnimation = (v: string) => { setPageAnimationState(v); persist({ animStyle: v }); };
  const setCursorVariant = (v: string) => { setCursorVariantState(v); persist({ cursorStyle: v }); };

  return (
    <DebugContext.Provider value={{ heroVariant, footerVariant, carouselStyle, pageAnimation, cursorVariant }}>
      {children}
      <DebugUI
        open={open} setOpen={setOpen} tab={tab} setTab={setTab}
        fontId={fontId} applyFont={applyFont}
        darkId={darkId} lightId={lightId} applyTheme={applyTheme}
        heroVariant={heroVariant} setHeroVariant={setHeroVariant}
        footerVariant={footerVariant} setFooterVariant={setFooterVariant}
        carouselStyle={carouselStyle} setCarouselStyle={setCarouselStyle}
        pageAnimation={pageAnimation} setPageAnimation={setPageAnimation}
        cursorVariant={cursorVariant} setCursorVariant={setCursorVariant}
      />
    </DebugContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════════  PANEL UI  */
type TabId = "font"|"theme"|"layout"|"motion"|"cards"|"site"|"content"|"presets";

const TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id:"font",     icon:Type,         label:"Font"    },
  { id:"theme",    icon:Palette,      label:"Theme"   },
  { id:"layout",   icon:Layout,       label:"Layout"  },
  { id:"motion",   icon:Zap,          label:"Motion"  },
  { id:"cards",    icon:Sparkles,     label:"Cards"   },
  { id:"site",     icon:Globe,        label:"Site"    },
  { id:"content",  icon:AlignLeft,    label:"Content" },
  { id:"presets",  icon:Save,         label:"Saves"   },
];

function DebugUI({ open, setOpen, tab, setTab, fontId, applyFont, darkId, lightId, applyTheme,
  heroVariant, setHeroVariant, footerVariant, setFooterVariant, carouselStyle, setCarouselStyle,
  pageAnimation, setPageAnimation, cursorVariant, setCursorVariant }: any) {

  // Split tabs into two rows of 4
  const row1 = TABS.slice(0, 4);
  const row2 = TABS.slice(4);

  return (
    <>
      {/* Toggle button */}
      <motion.button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9985] w-11 h-11 rounded-full shadow-2xl flex items-center justify-center border"
        style={{ background:"hsl(var(--card))", borderColor:"hsl(var(--border))", color:"hsl(var(--muted-foreground))" }}
        whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} title="Design Panel">
        <AnimatePresence mode="wait">
          <motion.div key={open?"x":"s"}
            initial={{ rotate:-90, opacity:0, scale:0.5 }} animate={{ rotate:0, opacity:1, scale:1 }}
            exit={{ rotate:90, opacity:0, scale:0.5 }} transition={{ duration:0.18 }}>
            {open ? <X size={16}/> : <Settings2 size={16}/>}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 right-6 z-[9984] w-[300px] rounded-2xl overflow-hidden shadow-2xl border flex flex-col"
            style={{ background:"hsl(var(--card))", borderColor:"hsl(var(--border))", maxHeight:"calc(100vh - 120px)" }}
            initial={{ opacity:0, y:16, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:12, scale:0.92 }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}>

            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor:"hsl(var(--border)/0.6)" }}>
              <div className="flex items-center gap-2">
                <Eye size={11} style={{ color:"hsl(var(--primary))" }}/>
                <span className="text-xs font-medium" style={{ color:"hsl(var(--foreground))" }}>Design Studio</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color:"hsl(var(--muted-foreground)/0.5)" }}>Live · Auto-saved</span>
            </div>

            {/* Tab rows — 2 rows of 4 */}
            <div className="flex-shrink-0 border-b" style={{ borderColor:"hsl(var(--border)/0.4)" }}>
              {[row1, row2].map((row, ri) => (
                <div key={ri} className="flex" style={{ borderBottom: ri===0 ? "1px solid hsl(var(--border)/0.2)" : "none" }}>
                  {row.map(({ id, icon:Icon, label }) => (
                    <button key={id} onClick={() => setTab(id)}
                      className="flex-1 flex flex-col items-center gap-0.5 py-2 relative transition-all duration-150"
                      style={{ color: tab===id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground)/0.6)", background: tab===id ? "hsl(var(--muted)/0.4)" : "transparent" }}>
                      <Icon size={10}/>
                      <span className="text-[8px] leading-none">{label}</span>
                      {tab===id && (
                        <motion.div layoutId="dtab" className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                          style={{ background:"hsl(var(--primary))" }} transition={{ type:"spring", bounce:0.25, duration:0.3 }}/>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-3 space-y-1 flex-1" style={{ maxHeight:"400px" }}>
              <AnimatePresence mode="wait">

                {/* ─ FONTS ─ */}
                {tab==="font" && (
                  <motion.div key="font" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => applyFont(f.id)}
                        className="w-full text-left p-3 rounded-xl border mb-1 transition-all"
                        style={{ borderColor: fontId===f.id ? "hsl(var(--primary)/0.4)" : "transparent", background: fontId===f.id ? "hsl(var(--primary)/0.08)" : "transparent" }}
                        onMouseOver={e => { if (fontId!==f.id) (e.currentTarget as HTMLElement).style.background="hsl(var(--muted)/0.6)"; }}
                        onMouseOut={e => { if (fontId!==f.id) (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-[11px] font-semibold" style={{ fontFamily:f.display, color:"hsl(var(--foreground))" }}>{f.label}</span>
                          {fontId===f.id && <span className="text-[9px]" style={{ color:"hsl(var(--primary))" }}>● Active</span>}
                        </div>
                        <div className="text-[9px] mb-1" style={{ color:"hsl(var(--muted-foreground))" }}>{f.sub}</div>
                        <div className="text-sm font-light truncate" style={{ fontFamily:f.display, color:"hsl(var(--foreground)/0.85)" }}>Architecture</div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* ─ THEME ─ */}
                {tab==="theme" && (
                  <motion.div key="theme" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <Label>Dark Modes</Label>
                    {DARK_THEMES.map(t => (
                      <ThemeRow key={t.id} theme={t} active={darkId===t.id} onClick={() => applyTheme(t.id, true)}/>
                    ))}
                    <Label className="mt-3">Light Modes</Label>
                    {LIGHT_THEMES.map(t => (
                      <ThemeRow key={t.id} theme={t} active={lightId===t.id} onClick={() => applyTheme(t.id, false)}/>
                    ))}
                  </motion.div>
                )}

                {/* ─ LAYOUT ─ */}
                {tab==="layout" && (
                  <motion.div key="layout" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <Label>Hero Layout</Label>
                    {HERO_VARIANTS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={heroVariant===v.id} onClick={() => setHeroVariant(v.id)}/>)}
                    <Label className="mt-3">Footer Style</Label>
                    {FOOTER_VARIANTS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={footerVariant===v.id} onClick={() => setFooterVariant(v.id)}/>)}
                    <Label className="mt-3">Carousel Style</Label>
                    {CAROUSEL_STYLES.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={carouselStyle===v.id} onClick={() => setCarouselStyle(v.id)}/>)}
                  </motion.div>
                )}

                {/* ─ MOTION ─ */}
                {tab==="motion" && (
                  <motion.div key="motion" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <Label>Page Entrance</Label>
                    {PAGE_ANIMATIONS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={pageAnimation===v.id} onClick={() => setPageAnimation(v.id)}/>)}
                    <Label className="mt-3">Cursor Style</Label>
                    {CURSOR_VARIANTS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={cursorVariant===v.id} onClick={() => setCursorVariant(v.id)}/>)}
                  </motion.div>
                )}

                {/* ─ CARDS ─ */}
                {tab==="cards" && <CardsTab/>}

                {/* ─ SITE ─ */}
                {tab==="site" && <SiteTab/>}

                {/* ─ CONTENT ─ */}
                {tab==="content" && <ContentTab/>}

                {/* ─ PRESETS ─ */}
                {tab==="presets" && (
                  <PresetsTab
                    fontId={fontId} darkId={darkId} lightId={lightId}
                    heroVariant={heroVariant} footerVariant={footerVariant}
                    carouselStyle={carouselStyle} animStyle={pageAnimation} cursorStyle={cursorVariant}
                    applyFont={applyFont} applyTheme={applyTheme}
                    setHeroVariant={setHeroVariant} setFooterVariant={setFooterVariant}
                    setCarouselStyle={setCarouselStyle} setPageAnimation={setPageAnimation}
                    setCursorVariant={setCursorVariant}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t flex-shrink-0 flex items-center gap-2" style={{ borderColor:"hsl(var(--border)/0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-[9px]" style={{ color:"hsl(var(--muted-foreground)/0.45)" }}>VastuChitra · All changes auto-saved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════════════  SHARED ATOMS  */
function Label({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[9px] font-medium tracking-widest uppercase px-1 mb-1.5 ${className}`} style={{ color:"hsl(var(--muted-foreground))" }}>{children}</p>;
}

function OptionRow({ label, sub, active, onClick }: { label:string; sub:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left p-2.5 rounded-xl border mb-1 transition-all flex items-center justify-between"
      style={{ borderColor: active ? "hsl(var(--primary)/0.4)" : "transparent", background: active ? "hsl(var(--primary)/0.08)" : "transparent" }}
      onMouseOver={e => { if (!active) (e.currentTarget as HTMLElement).style.background="hsl(var(--muted)/0.6)"; }}
      onMouseOut={e => { if (!active) (e.currentTarget as HTMLElement).style.background="transparent"; }}>
      <div>
        <div className="text-xs font-medium" style={{ color:"hsl(var(--foreground))" }}>{label}</div>
        <div className="text-[10px]" style={{ color:"hsl(var(--muted-foreground)/0.6)" }}>{sub}</div>
      </div>
      {active && <span className="text-[9px]" style={{ color:"hsl(var(--primary))" }}>✓</span>}
    </button>
  );
}

function ThemeRow({ theme, active, onClick }: { theme:{ label:string; sub:string; sw:readonly string[] }; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl border mb-1 transition-all"
      style={{ borderColor: active ? "hsl(var(--primary)/0.4)" : "transparent", background: active ? "hsl(var(--primary)/0.08)" : "transparent" }}
      onMouseOver={e => { if (!active) (e.currentTarget as HTMLElement).style.background="hsl(var(--muted)/0.6)"; }}
      onMouseOut={e => { if (!active) (e.currentTarget as HTMLElement).style.background="transparent"; }}>
      <div className="flex -space-x-1.5 flex-shrink-0">
        {theme.sw.map((c,i) => <div key={i} className="w-4 h-4 rounded-full border-2" style={{ background:c, borderColor:"hsl(var(--card))", zIndex:3-i }}/>)}
      </div>
      <div className="text-left flex-1">
        <div className="text-xs font-medium" style={{ color:"hsl(var(--foreground))" }}>{theme.label}</div>
        <div className="text-[10px]" style={{ color:"hsl(var(--muted-foreground)/0.6)" }}>{theme.sub}</div>
      </div>
      {active && <span className="text-[9px]" style={{ color:"hsl(var(--primary))" }}>✓</span>}
    </button>
  );
}

function Inp({ label, value, onChange, placeholder, type="text" }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} className="w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none mb-2" placeholder={placeholder}
        style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
        value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}

function Textarea({ label, value, onChange, rows=2 }: { label:string; value:string; onChange:(v:string)=>void; rows?:number }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea className="w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none mb-2 resize-y" rows={rows}
        style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
        value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}

function SaveBtn({ saving, saved, onClick }: { saving:boolean; saved:boolean; onClick:()=>void }) {
  return (
    <>
      <button onClick={onClick} disabled={saving}
        className="w-full mt-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        style={{ background: saved ? "hsl(142 55% 45%)" : "hsl(var(--primary))", color:"hsl(var(--primary-foreground))" }}>
        {saving ? "Saving…" : saved ? "✓ Saved!" : <><Save size={11}/> Save to Supabase</>}
      </button>
      <p className="text-center text-[9px] mt-1 mb-2" style={{ color:"hsl(var(--muted-foreground)/0.4)" }}>Persists across all sessions & devices</p>
    </>
  );
}

/* ══════════════════════════════════════════════════════════  CARDS TAB  */
function CardsTab() {
  const { config, saveConfig, saving } = useSiteConfig();
  const [saved, setSaved] = useState(false);
  const current = config.cardHoverEffect ?? "glow";

  const handleSelect = async (id: string) => {
    const next = { ...config, cardHoverEffect: id as SiteConfig["cardHoverEffect"] };
    await saveConfig(next);
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  return (
    <motion.div key="cards" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <Label>Card Hover Effect</Label>
      <p className="text-[9px] px-1 mb-2" style={{ color:"hsl(var(--muted-foreground)/0.6)" }}>Applied to all project cards. Click to preview & save instantly.</p>
      {CARD_EFFECTS.map(e => (
        <button key={e.id} onClick={() => handleSelect(e.id)}
          className="w-full text-left p-2.5 rounded-xl border mb-1 transition-all flex items-center justify-between"
          style={{ borderColor: current===e.id ? "hsl(var(--primary)/0.4)" : "transparent", background: current===e.id ? "hsl(var(--primary)/0.08)" : "transparent" }}
          onMouseOver={el => { if (current!==e.id) (el.currentTarget as HTMLElement).style.background="hsl(var(--muted)/0.6)"; }}
          onMouseOut={el => { if (current!==e.id) (el.currentTarget as HTMLElement).style.background="transparent"; }}>
          <div>
            <div className="text-xs font-medium" style={{ color:"hsl(var(--foreground))" }}>{e.label}</div>
            <div className="text-[10px]" style={{ color:"hsl(var(--muted-foreground)/0.6)" }}>{e.sub}</div>
          </div>
          {current===e.id && <span className="text-[9px]" style={{ color:"hsl(var(--primary))" }}>✓ Active</span>}
        </button>
      ))}
      {saved && <p className="text-center text-[10px] mt-2 text-emerald-400">Effect saved ✓</p>}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════  SITE TAB (brand + hero + images)  */
function SiteTab() {
  const { config, saveConfig, saving } = useSiteConfig();
  const [d, setD] = useState<SiteConfig>({...config});
  const [saved, setSaved] = useState(false);
  useEffect(() => { setD({...config}); }, [config.brand]);

  const set = (k: keyof SiteConfig, v: unknown) => setD(p => ({...p, [k]: v}));
  const setHL = (i: number, v: string) => { const h=[...d.headline] as [string,string,string]; h[i]=v; setD(p=>({...p,headline:h})); };
  const setStat = (i: number, k: "value"|"label", v: string) => { const s=d.stats.map((x,j)=>j===i?{...x,[k]:v}:x); setD(p=>({...p,stats:s})); };

  const save = async () => { await saveConfig(d); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return (
    <motion.div key="site" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-0.5">
      <Inp label="Brand Name"     value={d.brand}        onChange={v=>set("brand",v)}        placeholder="VastuChitra ArchViz"/>
      <Inp label="Favicon URL"    value={d.faviconUrl}   onChange={v=>set("faviconUrl",v)}   placeholder="https://… (svg/png) or emoji"/>
      <Inp label="Hero Image URL" value={d.heroImageUrl} onChange={v=>set("heroImageUrl",v)} placeholder="https://… background image"/>
      <Inp label="Eyebrow"        value={d.eyebrow}      onChange={v=>set("eyebrow",v)}/>
      <Label>Headline (3 words)</Label>
      <div className="flex gap-1 mb-2">
        {[0,1,2].map(i=>(
          <input key={i} className="flex-1 px-2 py-1.5 rounded-lg text-xs border focus:outline-none"
            style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
            value={d.headline[i]} onChange={e=>setHL(i,e.target.value)}/>
        ))}
      </div>
      <Textarea label="Sub-heading" value={d.sub} onChange={v=>set("sub",v)} rows={2}/>
      <div className="flex gap-1.5">
        <div className="flex-1"><Inp label="Primary CTA"   value={d.cta}          onChange={v=>set("cta",v)}/></div>
        <div className="flex-1"><Inp label="Secondary CTA" value={d.ctaSecondary} onChange={v=>set("ctaSecondary",v)}/></div>
      </div>
      <Label>Stats</Label>
      {d.stats.map((s,i)=>(
        <div key={i} className="flex gap-1 mb-1">
          <input className="w-16 px-2 py-1.5 rounded-lg text-xs border focus:outline-none" style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
            value={s.value} onChange={e=>setStat(i,"value",e.target.value)} placeholder="UE5"/>
          <input className="flex-1 px-2 py-1.5 rounded-lg text-xs border focus:outline-none" style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
            value={s.label} onChange={e=>setStat(i,"label",e.target.value)} placeholder="Powered by"/>
        </div>
      ))}
      <SaveBtn saving={saving} saved={saved} onClick={save}/>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════  CONTENT TAB (about + contact + footer)  */
function ContentTab() {
  const { config, saveConfig, saving } = useSiteConfig();
  const [d, setD] = useState<SiteConfig>({...config});
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<"about"|"contact"|"footer">("about");
  useEffect(() => { setD({...config}); }, [config.brand]);

  const set = (k: keyof SiteConfig, v: unknown) => setD(p => ({...p, [k]: v}));
  const setFL = (k: keyof SiteConfig["footerLinks"], v: string) => setD(p=>({...p, footerLinks:{...p.footerLinks,[k]:v}}));
  const setFeat = (i:number, k:"title"|"description", v:string) => {
    const f = d.features.map((x,j)=>j===i?{...x,[k]:v}:x);
    setD(p=>({...p,features:f}));
  };

  const save = async () => { await saveConfig(d); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const secBtnStyle = (s: string) => ({
    background: section===s ? "hsl(var(--primary)/0.1)" : "transparent",
    borderColor: section===s ? "hsl(var(--primary)/0.4)" : "hsl(var(--border)/0.4)",
    color: section===s ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
  });

  return (
    <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      {/* Section picker */}
      <div className="flex gap-1 mb-3">
        {(["about","contact","footer"] as const).map(s=>(
          <button key={s} onClick={()=>setSection(s)}
            className="flex-1 py-1.5 rounded-lg text-[10px] border capitalize transition-all"
            style={secBtnStyle(s)}>{s}</button>
        ))}
      </div>

      {section==="about" && (
        <div className="space-y-0.5">
          <Inp label="Eyebrow"    value={d.aboutEyebrow}   onChange={v=>set("aboutEyebrow",v)}/>
          <Inp label="Heading"    value={d.aboutHeading}   onChange={v=>set("aboutHeading",v)}/>
          <Inp label="Heading em" value={d.aboutHeadingEm} onChange={v=>set("aboutHeadingEm",v)}/>
          <Textarea label="Body text" value={d.aboutBody} onChange={v=>set("aboutBody",v)} rows={3}/>
          <Label>Feature Cards</Label>
          {d.features.map((f,i)=>(
            <div key={i} className="p-2 rounded-xl border mb-1.5" style={{ borderColor:"hsl(var(--border)/0.4)" }}>
              <input className="w-full px-2 py-1 rounded-lg text-xs border focus:outline-none mb-1"
                style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
                value={f.title} onChange={e=>setFeat(i,"title",e.target.value)} placeholder={`Feature ${i+1} title`}/>
              <textarea className="w-full px-2 py-1 rounded-lg text-xs border focus:outline-none resize-none"
                style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
                rows={2} value={f.description} onChange={e=>setFeat(i,"description",e.target.value)}/>
            </div>
          ))}
        </div>
      )}

      {section==="contact" && (
        <div className="space-y-0.5">
          <Inp label="Eyebrow"      value={d.contactEyebrow}   onChange={v=>set("contactEyebrow",v)}/>
          <Inp label="Heading"      value={d.contactHeading}   onChange={v=>set("contactHeading",v)}/>
          <Inp label="Heading em"   value={d.contactHeadingEm} onChange={v=>set("contactHeadingEm",v)}/>
          <Textarea label="Body"    value={d.contactBody}      onChange={v=>set("contactBody",v)}/>
          <Inp label="Email"  type="email" value={d.contactEmail}   onChange={v=>set("contactEmail",v)}   placeholder="hello@vastuchitra.com"/>
          <Inp label="Phone"  type="tel"   value={d.contactPhone}   onChange={v=>set("contactPhone",v)}   placeholder="+91 98765 43210"/>
          <Inp label="Address"             value={d.contactAddress} onChange={v=>set("contactAddress",v)} placeholder="Mumbai, India"/>
        </div>
      )}

      {section==="footer" && (
        <div className="space-y-0.5">
          <Textarea label="Footer Tagline" value={d.footerTagline} onChange={v=>set("footerTagline",v)} rows={2}/>
          <Label>Footer Links (href)</Label>
          {(["Projects","About","Contact","Privacy","Terms"] as const).map(k=>(
            <div key={k} className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] w-14 flex-shrink-0" style={{ color:"hsl(var(--muted-foreground))" }}>{k}</span>
              <input className="flex-1 px-2 py-1.5 rounded-lg text-xs border focus:outline-none"
                style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
                value={d.footerLinks[k]} onChange={e=>setFL(k,e.target.value)} placeholder="#projects"/>
            </div>
          ))}
        </div>
      )}

      <SaveBtn saving={saving} saved={saved} onClick={save}/>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════  PRESETS TAB  */
function PresetsTab({ fontId, darkId, lightId, heroVariant, footerVariant, carouselStyle, animStyle, cursorStyle,
  applyFont, applyTheme, setHeroVariant, setFooterVariant, setCarouselStyle, setPageAnimation, setCursorVariant }: {
  fontId:string; darkId:string; lightId:string; heroVariant:string; footerVariant:string;
  carouselStyle:string; animStyle:string; cursorStyle:string;
  applyFont:(id:string)=>void; applyTheme:(id:string,dark:boolean)=>void;
  setHeroVariant:(v:string)=>void; setFooterVariant:(v:string)=>void;
  setCarouselStyle:(v:string)=>void; setPageAnimation:(v:string)=>void; setCursorVariant:(v:string)=>void;
}) {
  const { presets, savePreset, deletePreset, presetsLoading } = useSiteConfig();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await savePreset({ name: name.trim(), layout:{ fontId, darkId, lightId, heroVariant, footerVariant, carouselStyle, animStyle, cursorStyle }, config:{} });
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),1500); setName("");
  };

  const handleLoad = (p: DebugPreset) => {
    applyFont(p.layout.fontId);
    applyTheme(p.layout.darkId, true);
    applyTheme(p.layout.lightId, false);
    setHeroVariant(p.layout.heroVariant);
    setFooterVariant(p.layout.footerVariant);
    setCarouselStyle(p.layout.carouselStyle);
    setPageAnimation(p.layout.animStyle);
    setCursorVariant(p.layout.cursorStyle);
  };

  return (
    <motion.div key="presets" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <Label>Save Current Layout</Label>
      <div className="flex gap-1 mb-3">
        <input className="flex-1 px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none"
          style={{ background:"hsl(var(--muted)/0.5)", borderColor:"hsl(var(--border)/0.5)", color:"hsl(var(--foreground))" }}
          placeholder="Preset name…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSave()}/>
        <button onClick={handleSave} disabled={!name.trim()||saving}
          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
          style={{ background: saved?"hsl(142 55% 45%)":"hsl(var(--primary))", color:"hsl(var(--primary-foreground))" }}>
          {saving?"…":saved?"✓":<Save size={11}/>}
        </button>
      </div>
      <Label>Saved Presets</Label>
      {presetsLoading ? (
        <p className="text-[10px] text-center py-3" style={{ color:"hsl(var(--muted-foreground)/0.5)" }}>Loading…</p>
      ) : presets.length===0 ? (
        <p className="text-[10px] text-center py-4" style={{ color:"hsl(var(--muted-foreground)/0.4)" }}>No presets yet. Configure the tabs then save here.</p>
      ) : (
        <div className="space-y-1">
          {presets.map(p=>(
            <div key={p.name} className="flex items-center gap-1 p-2.5 rounded-xl border"
              style={{ borderColor:"hsl(var(--border)/0.4)", background:"hsl(var(--muted)/0.2)" }}>
              <button onClick={()=>handleLoad(p)} className="flex-1 text-left">
                <p className="text-xs font-medium" style={{ color:"hsl(var(--foreground))" }}>{p.name}</p>
                <p className="text-[9px]" style={{ color:"hsl(var(--muted-foreground)/0.6)" }}>{p.layout.fontId} · {p.layout.darkId} · {p.layout.heroVariant}</p>
              </button>
              <button onClick={()=>deletePreset(p.name)} className="p-1 rounded-lg opacity-40 hover:opacity-80" style={{ color:"hsl(0 65% 60%)" }}>
                <Trash size={11}/>
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-center text-[9px] mt-2" style={{ color:"hsl(var(--muted-foreground)/0.4)" }}>Presets saved to Supabase</p>
    </motion.div>
  );
}
