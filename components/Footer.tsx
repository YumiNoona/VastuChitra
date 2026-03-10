"use client";

import { useDebug } from "./DebugPanel";
import { useSiteConfig } from "./SiteConfigProvider";

function Logo({ brand }: { brand: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <rect x="1"   y="1"   width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))"/>
          <rect x="7.5" y="1"   width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))" opacity="0.4"/>
          <rect x="1"   y="7.5" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))" opacity="0.4"/>
          <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))"/>
        </svg>
      </div>
      <span className="text-sm font-medium">{brand}</span>
    </div>
  );
}

export default function Footer() {
  const { footerVariant } = useDebug();
  const { config } = useSiteConfig();
  const { brand, footerTagline, footerLinks } = config;
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Projects", href: footerLinks.Projects },
    { label: "About",    href: footerLinks.About    },
    { label: "Contact",  href: footerLinks.Contact  },
    { label: "Privacy",  href: footerLinks.Privacy  },
    { label: "Terms",    href: footerLinks.Terms    },
  ];

  const sections = {
    Product: [
      { label: "Projects", href: footerLinks.Projects },
      { label: "About",    href: footerLinks.About    },
    ],
    Company: [
      { label: "Contact",  href: footerLinks.Contact  },
    ],
    Legal: [
      { label: "Privacy",  href: footerLinks.Privacy  },
      { label: "Terms",    href: footerLinks.Terms    },
    ],
  };

  if (footerVariant === "full") return (
    <footer className="border-t border-border/30 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Logo brand={brand}/>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-[180px]">{footerTagline}</p>
          </div>
          {Object.entries(sections).map(([section, links]) => (
            <div key={section}>
              <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-3">{section}</p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {year} {brand}. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/50">Powered by Unreal Engine 5 · Vagon Streams</p>
        </div>
      </div>
    </footer>
  );

  if (footerVariant === "centered") return (
    <footer className="border-t border-border/30 py-14 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <Logo brand={brand}/>
        <div className="flex flex-wrap items-center justify-center gap-5 mt-6 mb-8">
          {quickLinks.map(({ label, href }) => (
            <a key={label} href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">© {year} {brand}.</p>
      </div>
    </footer>
  );

  // minimal
  return (
    <footer className="border-t border-border/30 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo brand={brand}/>
        <p className="text-xs text-muted-foreground">© {year} {brand}. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href={footerLinks[l as keyof typeof footerLinks] ?? "#"}
              className="hover:text-foreground transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
