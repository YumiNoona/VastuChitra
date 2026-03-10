"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SiteConfig {
  // Brand
  brand:          string;
  faviconUrl:     string;
  heroImageUrl:   string;
  // Hero
  eyebrow:        string;
  headline:       [string, string, string];
  sub:            string;
  cta:            string;
  ctaSecondary:   string;
  stats:          { value: string; label: string }[];
  // About
  aboutEyebrow:   string;
  aboutHeading:   string;
  aboutHeadingEm: string;
  aboutBody:      string;
  features:       { title: string; description: string }[];
  // Contact
  contactEyebrow:    string;
  contactHeading:    string;
  contactHeadingEm:  string;
  contactBody:       string;
  contactEmail:      string;
  contactPhone:      string;
  contactAddress:    string;
  // Footer
  footerTagline:  string;
  footerLinks:    { Projects: string; About: string; Contact: string; Privacy: string; Terms: string };
  // Card hover effect
  cardHoverEffect: "glow" | "tilt" | "tint" | "lift" | "border-trace";
}

export interface DebugLayout {
  fontId:        string;
  darkId:        string;
  lightId:       string;
  heroVariant:   string;
  footerVariant: string;
  carouselStyle: string;
  animStyle:     string;
  cursorStyle:   string;
}

export interface DebugPreset {
  name: string;
  layout: DebugLayout;
  config: Partial<SiteConfig>;
}

interface SiteConfigCtx {
  config:          SiteConfig;
  setConfig:       (c: SiteConfig) => void;
  saveConfig:      (c: SiteConfig) => Promise<void>;
  saving:          boolean;
  // layout (debug panel state)
  layout:          DebugLayout;
  saveLayout:      (l: DebugLayout) => Promise<void>;
  // presets
  presets:         DebugPreset[];
  savePreset:      (p: DebugPreset) => Promise<void>;
  deletePreset:    (name: string)   => Promise<void>;
  presetsLoading:  boolean;
}

// ── Defaults ──────────────────────────────────────────────────────────────────
export const DEFAULT_LAYOUT: DebugLayout = {
  fontId: "editorial", darkId: "obsidian", lightId: "saffron",
  heroVariant: "split", footerVariant: "minimal", carouselStyle: "fan-3d",
  animStyle: "fade-blur", cursorStyle: "dot-ring",
};

export const DEFAULT_CONFIG: SiteConfig = {
  brand:          "VastuChitra ArchViz",
  faviconUrl:     "",
  heroImageUrl:   "",
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
  aboutEyebrow:    "— Technology",
  aboutHeading:    "See Every Space",
  aboutHeadingEm:  "Before It's Built",
  aboutBody:       "We deliver immersive architectural visualization using Unreal Engine 5 with Pixel Streaming, enabling you to navigate photorealistic spaces from any browser, anywhere in the world.",
  features: [
    { title: "Unreal Engine 5",      description: "Powered by Lumen global illumination and Nanite virtualized geometry for cinematic realism." },
    { title: "Browser Streaming",    description: "Access full photorealistic experiences directly in your browser via Pixel Streaming technology." },
    { title: "Real-time Navigation", description: "Walk through spaces, change materials, adjust lighting — all in real-time, before construction." },
    { title: "60fps @ 4K",           description: "Crystal-clear 4K resolution at silky smooth 60 frames per second, streamed to any device." },
  ],
  contactEyebrow:   "— Get In Touch",
  contactHeading:   "Let's Visualize",
  contactHeadingEm: "Your Vision",
  contactBody:      "Have a project in mind? We'd love to create an immersive visualization experience for your architectural vision.",
  contactEmail:     "hello@vastuchitra.com",
  contactPhone:     "+91 98765 43210",
  contactAddress:   "Mumbai, Maharashtra, India",
  footerTagline:    "Real-time architecture visualization powered by Unreal Engine.",
  footerLinks: {
    Projects: "#projects", About: "#about", Contact: "#contact",
    Privacy: "/privacy",   Terms: "/terms",
  },
  cardHoverEffect: "glow",
};

// ── Context ───────────────────────────────────────────────────────────────────
const Ctx = createContext<SiteConfigCtx>({
  config: DEFAULT_CONFIG, setConfig: () => {}, saveConfig: async () => {}, saving: false,
  layout: DEFAULT_LAYOUT, saveLayout: async () => {},
  presets: [], savePreset: async () => {}, deletePreset: async () => {}, presetsLoading: false,
});
export const useSiteConfig = () => useContext(Ctx);

const CFG_KEY     = "site_config";
const LAYOUT_KEY  = "debug_layout";
const PRESETS_KEY = "debug_presets";

// ── Provider ──────────────────────────────────────────────────────────────────
export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState]   = useState<SiteConfig>(DEFAULT_CONFIG);
  const [layout, setLayoutState]   = useState<DebugLayout>(DEFAULT_LAYOUT);
  const [saving, setSaving]        = useState(false);
  const [presets, setPresets]      = useState<DebugPreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);

  // Load all three keys on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: cfgRow }  = await supabase.from("site_settings").select("value").eq("key", CFG_KEY).single();
        if (cfgRow?.value) { const cfg = { ...DEFAULT_CONFIG, ...(cfgRow.value as SiteConfig) }; setConfigState(cfg); if (cfg.faviconUrl) { let el = document.querySelector("link[rel*=icon]") as HTMLLinkElement | null; if (!el) { el = document.createElement("link"); el.rel = "icon"; document.head.appendChild(el); } el.href = cfg.faviconUrl; } }
      } catch {}

      try {
        const { data: layRow }  = await supabase.from("site_settings").select("value").eq("key", LAYOUT_KEY).single();
        if (layRow?.value)  setLayoutState(v => ({ ...DEFAULT_LAYOUT, ...(layRow.value as DebugLayout) }));
      } catch {}

      setPresetsLoading(true);
      try {
        const { data: preRow } = await supabase.from("site_settings").select("value").eq("key", PRESETS_KEY).single();
        if (preRow?.value)  setPresets(preRow.value as DebugPreset[]);
      } catch {}
      setPresetsLoading(false);
    })();
  }, []);

  // Update favicon dynamically when faviconUrl changes
  const applyFavicon = useCallback((url: string) => {
    if (!url || typeof document === "undefined") return;
    let el = document.querySelector("link[rel*=icon]") as HTMLLinkElement | null;
    if (!el) { el = document.createElement("link"); el.rel = "icon"; document.head.appendChild(el); }
    el.href = url;
  }, []);

  const saveConfig = useCallback(async (c: SiteConfig) => {
    setSaving(true);
    setConfigState(c);
    if (c.faviconUrl) applyFavicon(c.faviconUrl);
    try { await supabase.from("site_settings").upsert({ key: CFG_KEY, value: c }, { onConflict: "key" }); } catch {}
    setSaving(false);
  }, [applyFavicon]);

  const saveLayout = useCallback(async (l: DebugLayout) => {
    setLayoutState(l);
    try { await supabase.from("site_settings").upsert({ key: LAYOUT_KEY, value: l }, { onConflict: "key" }); } catch {}
  }, []);

  const savePreset = useCallback(async (p: DebugPreset) => {
    const updated = [...presets.filter(x => x.name !== p.name), p];
    setPresets(updated);
    try { await supabase.from("site_settings").upsert({ key: PRESETS_KEY, value: updated }, { onConflict: "key" }); } catch {}
  }, [presets]);

  const deletePreset = useCallback(async (name: string) => {
    const updated = presets.filter(x => x.name !== name);
    setPresets(updated);
    try { await supabase.from("site_settings").upsert({ key: PRESETS_KEY, value: updated }, { onConflict: "key" }); } catch {}
  }, [presets]);

  return (
    <Ctx.Provider value={{
      config, setConfig: setConfigState, saveConfig, saving,
      layout, saveLayout,
      presets, savePreset, deletePreset, presetsLoading,
    }}>
      {children}
    </Ctx.Provider>
  );
}
