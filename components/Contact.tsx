"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { haptic } from "@/lib/utils";
import { useSiteConfig } from "./SiteConfigProvider";

export default function Contact() {
  const { config } = useSiteConfig();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); haptic(12); setSubmitted(true);
  };

  const infoItems = [
    { icon: Mail,    label: "Email",   value: config.contactEmail,   href: `mailto:${config.contactEmail}` },
    { icon: Phone,   label: "Phone",   value: config.contactPhone,   href: `tel:${config.contactPhone}`   },
    { icon: MapPin,  label: "Address", value: config.contactAddress, href: "#"                             },
  ];

  return (
    <section id="contact" className="relative py-32 px-6 border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <motion.span className="text-xs font-medium tracking-widest uppercase text-primary/70 block mb-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {config.contactEyebrow}
            </motion.span>
            <motion.h2 className="font-light leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4rem)" }}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}>
              {config.contactHeading}<br/>
              <em className="not-italic text-gradient">{config.contactHeadingEm}</em>
            </motion.h2>
            <motion.p className="text-muted-foreground leading-relaxed mb-10 max-w-sm"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}>
              {config.contactBody}
            </motion.p>
            <div className="space-y-4">
              {infoItems.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href}
                  className="flex items-center gap-3 group transition-colors"
                  style={{ color: "hsl(38 8% 50%)" }}>
                  <div className="w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors group-hover:border-primary/30"
                    style={{ background: "hsl(222 18% 9%)", borderColor: "hsl(222 18% 15%)" }}>
                    <Icon size={14} className="text-primary/60 group-hover:text-primary transition-colors"/>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase" style={{ color: "hsl(38 8% 38%)" }}>{label}</p>
                    <p className="text-sm group-hover:text-foreground transition-colors">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
            {submitted ? (
              <div className="rounded-2xl border p-12 text-center"
                style={{ background: "hsl(222 22% 8%)", borderColor: "hsl(142 40% 30% / 0.3)" }}>
                <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "hsl(142 55% 45% / 0.1)", border: "1px solid hsl(142 40% 35% / 0.3)" }}>
                  <Send size={22} className="text-emerald-400"/>
                </div>
                <h3 className="text-2xl font-light mb-3" style={{ fontFamily: "var(--font-display)" }}>Message Sent</h3>
                <p className="text-sm text-muted-foreground">We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border p-8 space-y-5"
                style={{ background: "hsl(222 22% 8%)", borderColor: "hsl(222 18% 14%)" }}>
                {[
                  { key: "name",    label: "Your Name",    type: "text",  placeholder: "Alex Johnson"          },
                  { key: "email",   label: "Email Address", type: "email", placeholder: "alex@studio.com"        },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5 tracking-wide"
                      style={{ color: "hsl(38 8% 50%)" }}>{label}</label>
                    <input type={type} placeholder={placeholder} required
                      value={form[key as "name" | "email"]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                      style={{ background: "hsl(222 22% 6%)", borderColor: "hsl(222 18% 15%)", color: "hsl(38 15% 82%)" }}
                      onFocus={e => e.currentTarget.style.borderColor = "hsl(38 50% 40%)"}
                      onBlur={e => e.currentTarget.style.borderColor = "hsl(222 18% 15%)"}/>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "hsl(38 8% 50%)" }}>Message</label>
                  <textarea placeholder="Tell us about your project…" required rows={4}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors resize-none"
                    style={{ background: "hsl(222 22% 6%)", borderColor: "hsl(222 18% 15%)", color: "hsl(38 15% 82%)" }}
                    onFocus={e => e.currentTarget.style.borderColor = "hsl(38 50% 40%)"}
                    onBlur={e => e.currentTarget.style.borderColor = "hsl(222 18% 15%)"}/>
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: "hsl(38 65% 58%)", color: "hsl(222 24% 5%)", boxShadow: "0 6px 24px hsl(38 65% 40% / 0.2)" }}>
                  <Send size={14}/> Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
