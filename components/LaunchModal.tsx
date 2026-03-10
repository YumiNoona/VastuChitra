"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Project } from "@/lib/supabase";
import { saveVisitor } from "@/lib/supabase";
import { haptic } from "@/lib/utils";

interface Props { project: Project | null; onClose: () => void; }
type Stage = "form" | "submitting" | "success";

export default function LaunchModal({ project, onClose }: Props) {
  const [stage, setStage]   = useState<Stage>("form");
  const [form, setForm]     = useState({ name: "", email: "", contact: "" });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.contact.trim()) e.contact = "Contact is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate() || !project) return;
    haptic(10); setStage("submitting");
    try { await saveVisitor({ ...form, project: project.title, project_id: project.id }); }
    catch { /* silent */ }
    setStage("success"); haptic(15);
    setTimeout(() => {
      window.open(project.stream_url, "_blank", "noopener,noreferrer");
      onClose();
      setTimeout(() => { setStage("form"); setForm({ name:"", email:"", contact:"" }); }, 300);
    }, 1800);
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
        {/* Backdrop */}
        <motion.div className="absolute inset-0" onClick={onClose}
          style={{ background: "hsl(222 24% 3% / 0.8)", backdropFilter: "blur(12px)" }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} />

        {/* Modal */}
        <motion.div className="relative w-full max-w-[420px] rounded-3xl border overflow-hidden"
          style={{ background: "hsl(222 22% 8%)", borderColor: "hsl(222 18% 14%)", boxShadow: "0 32px 80px hsl(222 24% 2% / 0.8)" }}
          initial={{ scale:0.88, opacity:0, y:20, filter:"blur(8px)" }}
          animate={{ scale:1, opacity:1, y:0, filter:"blur(0px)" }}
          exit={{ scale:0.88, opacity:0, y:20 }}
          transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
          role="dialog" aria-modal="true">

          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ background: "linear-gradient(90deg,transparent,hsl(38 65% 55% / 0.5),transparent)" }} />

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ background: "hsl(222 18% 12%)", color: "hsl(38 8% 45%)" }}
            onMouseEnter={e => e.currentTarget.style.color = "hsl(38 12% 70%)"}
            onMouseLeave={e => e.currentTarget.style.color = "hsl(38 8% 45%)"}>
            <X size={13} />
          </button>

          <AnimatePresence mode="wait">
            {stage === "success" ? (
              <motion.div key="success" className="p-10 text-center"
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
                <motion.div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "hsl(142 40% 35% / 0.12)", border: "1px solid hsl(142 40% 40% / 0.25)" }}
                  animate={{ scale:[1,1.08,1] }} transition={{ duration:0.5 }}>
                  <CheckCircle2 size={26} style={{ color: "hsl(142 55% 52%)" }} />
                </motion.div>
                <h3 className="text-xl font-light mb-1.5" style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 85%)" }}>
                  Launching Experience
                </h3>
                <p className="text-sm mb-6" style={{ color:"hsl(38 8% 48%)" }}>Opening {project.title} in a new tab…</p>
                <div className="h-1 rounded-full overflow-hidden" style={{ background:"hsl(222 18% 13%)" }}>
                  <motion.div className="h-full rounded-full" style={{ background:"hsl(38 65% 55%)" }}
                    initial={{ width:"0%" }} animate={{ width:"100%" }} transition={{ duration:1.6, ease:"linear" }} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity:1 }} exit={{ opacity:0 }}>
                {/* Header */}
                <div className="p-7 pb-5" style={{ borderBottom:"1px solid hsl(222 18% 12%)" }}>
                  <span className="inline-block text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full mb-3"
                    style={{ background:"hsl(38 65% 55% / 0.08)", color:"hsl(38 55% 58%)", border:"1px solid hsl(38 50% 40% / 0.2)" }}>
                    {project.type}
                  </span>
                  <h2 className="text-xl font-light mb-1" style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 86%)" }}>
                    {project.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color:"hsl(38 8% 48%)" }}>{project.description}</p>
                </div>

                {/* Form */}
                <div className="p-7 pt-5 space-y-4">
                  <p className="text-xs" style={{ color:"hsl(38 8% 40%)" }}>Enter your details to access this experience</p>

                  {[
                    { key:"name",    label:"Full Name",       type:"text",  placeholder:"Alex Johnson" },
                    { key:"email",   label:"Email Address",   type:"email", placeholder:"alex@studio.com" },
                    { key:"contact", label:"Phone / WhatsApp",type:"tel",   placeholder:"+1 555 000 0000" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color:"hsl(38 8% 46%)" }}>{label}</label>
                      <input type={type} placeholder={placeholder}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                        style={{
                          background:"hsl(222 22% 6%)",
                          border:`1px solid ${errors[key] ? "hsl(0 50% 45%)" : "hsl(222 18% 15%)"}`,
                          color:"hsl(38 15% 82%)"
                        }}
                        onFocus={e => !errors[key] && (e.currentTarget.style.borderColor = "hsl(38 50% 38%)")}
                        onBlur={e => !errors[key] && (e.currentTarget.style.borderColor = "hsl(222 18% 15%)")}
                      />
                      {errors[key] && (
                        <motion.p className="text-[11px] mt-1" style={{ color:"hsl(0 60% 58%)" }}
                          initial={{ opacity:0, y:-3 }} animate={{ opacity:1, y:0 }}>{errors[key]}</motion.p>
                      )}
                    </div>
                  ))}

                  <motion.button onClick={submit} disabled={stage === "submitting"}
                    className="w-full mt-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 transition-all"
                    style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)", boxShadow:"0 6px 24px hsl(38 65% 40% / 0.22)" }}
                    whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}>
                    {stage === "submitting"
                      ? <><Loader2 size={14} className="animate-spin" /> Preparing…</>
                      : <>Start Experience <ArrowRight size={14} /></>}
                  </motion.button>

                  <p className="text-[10px] text-center" style={{ color:"hsl(38 8% 35%)" }}>
                    Your details are private and used only for project access.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
