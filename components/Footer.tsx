"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-8 lg:px-16 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="IPDS Logo" className="dark:hidden h-12 w-auto opacity-90" />
          <img src="/dlogo.png" alt="IPDS Logo" className="hidden dark:block h-12 w-auto opacity-90" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              © {year} · ArchViz & Design
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-light tracking-wide max-w-xs text-center sm:text-left">
          Real-time architecture visualization and immersive digital experiences.
        </p>

        <div className="flex items-center gap-8">
          {[
            { label: "Overview", href: "#overview" },
            { label: "Portfolio", href: "#projects" },
            { label: "Contact",  href: "#contact"  },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground hover:text-vastu-green transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
