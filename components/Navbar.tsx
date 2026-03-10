"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { haptic } from "@/lib/utils";
import { Menu, X, Zap } from "lucide-react";

const BRAND = "Interactive ArchViz";
const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const v = window.scrollY;
        setScrolled(v > 50);
        if (v > lastY.current + 8 && v > 120) setHidden(true);
        else if (v < lastY.current - 4) setHidden(false);
        lastY.current = v;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed left-0 right-0 z-[60]"
        style={{ top: 0, overflow: "visible" }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated glow line at top when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-px"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)/0.6), transparent)", transformOrigin: "center" }}
            />
          )}
        </AnimatePresence>

        {/* Backdrop blur */}
        <motion.div
          className="absolute inset-0 border-b border-border/0 transition-all duration-500"
          animate={{
            backgroundColor: scrolled ? "hsl(var(--background)/0.82)" : "transparent",
            borderColor: scrolled ? "hsl(var(--border)/0.5)" : "hsl(var(--border)/0)",
          }}
          style={{ backdropFilter: scrolled ? "blur(24px) saturate(1.6)" : "none" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo with animated icon */}
          <motion.a href="/" className="flex items-center gap-2.5 z-10"
            onClick={() => haptic(6)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoMark />
            <span className="text-sm font-medium tracking-tight hidden sm:block" style={{ fontFamily: "var(--font-body)" }}>
              {BRAND}
            </span>
          </motion.a>

          {/* Animated pill nav — center */}
          <div className="hidden md:flex items-center z-10">
            <motion.div
              className="flex items-center gap-1 px-2 py-1.5 rounded-full border border-border/50 backdrop-blur-sm"
              style={{ background: "hsl(var(--card)/0.6)" }}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {navLinks.map((link, i) => (
                <NavLink key={link.label} link={link} delay={0.2 + i * 0.07} />
              ))}
            </motion.div>
          </div>

          {/* Right */}
          <motion.div className="flex items-center gap-2.5 z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ThemeToggle />
            <motion.a href="#contact" onClick={() => haptic(8)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all duration-200"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              whileHover={{ scale: 1.04, opacity: 0.9 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap size={10} />
              Get Started
            </motion.a>
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground"
              onClick={() => { setMobileOpen(!mobileOpen); haptic(6); }}>
              {mobileOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-x-0 top-0 z-[55] pt-20 pb-6 px-6 border-b"
            style={{ background: "hsl(var(--background)/0.96)", borderColor: "hsl(var(--border)/0.5)", backdropFilter: "blur(24px)" }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}
          >
            {navLinks.map((link, i) => (
              <motion.a key={link.label} href={link.href}
                className="flex items-center justify-between py-3.5 text-base border-b text-muted-foreground hover:text-foreground transition-colors"
                style={{ borderColor: "hsl(var(--border)/0.3)" }}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => { setMobileOpen(false); haptic(6); }}
              >
                {link.label}
                <span className="text-xs text-muted-foreground/40">→</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ link, delay }: { link: { label: string; href: string }; delay: number }) {
  const [active, setActive] = useState(false);
  return (
    <motion.a href={link.href}
      className="relative px-4 py-1.5 text-sm rounded-full transition-colors duration-200"
      style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay }}
      onClick={() => haptic(5)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      whileHover={{ color: "hsl(var(--foreground))" }}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-full"
            style={{ background: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.2)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{link.label}</span>
    </motion.a>
  );
}

function LogoMark() {
  return (
    <motion.div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
      style={{ background: "hsl(var(--primary)/0.12)", borderColor: "hsl(var(--primary)/0.3)" }}
      whileHover={{ rotate: 90 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <motion.rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))"
          animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0 }} />
        <motion.rect x="7.5" y="1" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} />
        <motion.rect x="1" y="7.5" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
        <motion.rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))"
          animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
      </svg>
    </motion.div>
  );
}
