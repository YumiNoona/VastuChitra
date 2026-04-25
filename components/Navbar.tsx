"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Contact",  href: "#contact"  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-md border-b border-border py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <img src="/logo.png" alt="IPDS Logo" className="dark:hidden h-10 w-auto transition-transform group-hover:scale-105" />
            <img src="/dlogo.png" alt="IPDS Logo" className="hidden dark:block h-10 w-auto transition-transform group-hover:scale-105" />
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {label}
              </a>
            ))}
            
            <div className="mx-2 w-px h-4 bg-border" />
            <ThemeToggle />

            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-4 btn-vercel h-9 px-4 text-xs group"
            >
              Get Started
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-0 z-[55] pt-20 pb-10 bg-background/95 backdrop-blur-xl border-b border-border md:hidden"
          >
            <div className="flex flex-col items-center gap-4 px-6">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="w-full text-center py-4 text-lg font-medium border-b border-border/50 last:border-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </a>
              ))}
              <a
                href="#contact"
                className="w-full btn-vercel h-12 text-base mt-4"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
