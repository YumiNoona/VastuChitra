"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, Layers, Zap } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";

const ICONS = [Cpu, Globe, Layers, Zap];

export default function About() {
  const { config } = useSiteConfig();

  return (
    <section id="about" className="relative py-32 px-6 overflow-hidden border-t border-border/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-1/4 top-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, hsl(238 84% 67%) 0%, transparent 70%)", filter: "blur(60px)" }}/>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <motion.span className="text-xs font-medium tracking-widest uppercase text-primary/70 block mb-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {config.aboutEyebrow}
            </motion.span>
            <motion.h2 className="font-light leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4rem)" }}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}>
              {config.aboutHeading}<br/>
              <em className="not-italic text-gradient">{config.aboutHeadingEm}</em>
            </motion.h2>
            <motion.p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}>
              {config.aboutBody}
            </motion.p>
            <motion.div className="flex items-center gap-3"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}>
              <div className="flex -space-x-2">
                {["UE5", "PS", "VG"].map(tag => (
                  <div key={tag} className="w-9 h-9 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[9px] font-mono text-primary">{tag}</div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Powered by Unreal Engine 5 · Vagon Streams</span>
            </motion.div>
          </div>

          {/* Right: feature cards — responsive 2-col always */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.features.map((feature, i) => {
              const Icon = ICONS[i] ?? Cpu;
              return (
                <motion.div key={i}
                  className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-colors duration-300"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -2 }}>
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon size={16} className="text-primary"/>
                  </div>
                  <h3 className="text-base font-normal mb-2" style={{ fontFamily: "var(--font-display)" }}>{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
