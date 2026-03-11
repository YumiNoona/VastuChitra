"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, CheckCircle2, Phone, Mail, Eye, EyeOff, SendHorizonal } from "lucide-react";
import { Project, saveVisitor, verifyOtp } from "@/lib/supabase";
import { haptic } from "@/lib/utils";

interface Props { project: Project | null; onClose: () => void; }

type Stage =
  | "form"
  | "submitting"
  | "success"
  | "pw-wrong"
  | "otp-sending"
  | "otp-sent"
  | "otp-verifying";

const SALES_EMAIL = "sales@vastuchitra.com";
const SALES_PHONE = "+919763965277";

export default function LaunchModal({ project, onClose }: Props) {
  const [stage,    setStage]   = useState<Stage>("form");
  const [name,     setName]    = useState("");
  const [email,    setEmail]   = useState("");
  const [contact,  setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]  = useState(false);
  const [otp,      setOtp]     = useState("");
  const [otpErr,   setOtpErr]  = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errors,   setErrors]  = useState<Record<string, string>>({});

  const access = project?.access_type ?? "public";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = "Name is required";
    if (!email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!contact.trim()) e.contact = "Phone is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const normalizePhone = (p: string) => {
    const n = p.replace(/[\s\-()]/g, "");
    if (n.startsWith("+")) return n;
    if (n.length === 10)   return `+91${n}`;
    return `+${n}`;
  };

  const launch = async () => {
    if (!project) return;
    setStage("submitting");
    try {
      await saveVisitor({ name, email, contact, project: project.title, project_id: project.id });
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [{ name, email, project: project.title }],
          subject: "Welcome to {{project}} — VastuChitra ArchViz",
          body: `Hi {{name}},\n\nThank you for exploring {{project}}.\n\nWarm regards,\nVastuChitra ArchViz Studio`,
        }),
      }).catch(() => {});
    } catch { /* silent */ }
    setStage("success");
    haptic(15);
    setTimeout(() => {
      window.open(project.stream_url, "_blank", "noopener,noreferrer");
      onClose();
    }, 1800);
  };

  const sendOtp = async () => {
    if (!validate() || !project) return;
    haptic(10);
    setStage("otp-sending");
    setOtpErr("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkToken: `main-${project.id}`,
        phone: normalizePhone(contact),
        email,
        projectTitle: project.title,
        clientName: name,
      }),
    });
    if (res.ok) {
      setCodeSent(true);
      setStage("otp-sent");
    } else {
      const d = await res.json().catch(() => ({}));
      setOtpErr(d.error ?? "Failed to send code. Please try again.");
      setStage("form");
    }
  };

  const verifyCode = async () => {
    if (!project || otp.replace(/\s/g,"").length < 4) {
      setOtpErr("Enter the code we sent you.");
      return;
    }
    setStage("otp-verifying");
    const { valid } = await verifyOtp(`main-${project.id}`, otp.replace(/\s/g,""));
    if (valid) {
      await launch();
    } else {
      setOtpErr("Incorrect code — please try again.");
      setStage("otp-sent");
    }
  };

  const submit = async () => {
    if (!validate() || !project) return;
    haptic(10);
    if (access === "public")   { await launch(); return; }
    if (access === "password") {
      if (password === project.access_password) { await launch(); }
      else { setStage("pw-wrong"); }
      return;
    }
    if (access === "otp") { await sendOtp(); return; }
  };

  if (!project) return null;

  const iStyle = (key?: string): React.CSSProperties => ({
    background: "hsl(222 22% 6%)",
    border: `1px solid ${key && errors[key] ? "hsl(0 50% 45%)" : "hsl(222 18% 15%)"}`,
    color: "hsl(38 15% 82%)",
  });

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>

        <motion.div className="absolute inset-0" onClick={onClose}
          style={{ background:"hsl(222 24% 3%/0.8)", backdropFilter:"blur(12px)" }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}/>

        <motion.div className="relative w-full max-w-[420px] rounded-3xl border overflow-hidden"
          style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 14%)", boxShadow:"0 32px 80px hsl(222 24% 2%/0.8)" }}
          initial={{ scale:0.88, opacity:0, y:20, filter:"blur(8px)" }}
          animate={{ scale:1, opacity:1, y:0, filter:"blur(0px)" }}
          exit={{ scale:0.88, opacity:0, y:20 }}
          transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
          role="dialog" aria-modal="true">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ background:"linear-gradient(90deg,transparent,hsl(38 65% 55%/0.5),transparent)" }}/>

          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
            style={{ background:"hsl(222 18% 12%)", color:"hsl(38 8% 45%)" }}
            onMouseEnter={e=>e.currentTarget.style.color="hsl(38 12% 70%)"}
            onMouseLeave={e=>e.currentTarget.style.color="hsl(38 8% 45%)"}>
            <X size={13}/>
          </button>

          <AnimatePresence mode="wait">

            {/* ── SUCCESS ───────────────────────────────────────────── */}
            {stage==="success" && (
              <motion.div key="success" className="p-10 text-center"
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
                <motion.div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background:"hsl(142 40% 35%/0.12)", border:"1px solid hsl(142 40% 40%/0.25)" }}
                  animate={{ scale:[1,1.08,1] }} transition={{ duration:0.5 }}>
                  <CheckCircle2 size={26} style={{ color:"hsl(142 55% 52%)" }}/>
                </motion.div>
                <h3 className="text-xl font-light mb-1.5"
                  style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 85%)" }}>
                  Launching Experience
                </h3>
                <p className="text-sm mb-6" style={{ color:"hsl(38 8% 48%)" }}>
                  Opening {project.title} in a new tab…
                </p>
                <div className="h-1 rounded-full overflow-hidden" style={{ background:"hsl(222 18% 13%)" }}>
                  <motion.div className="h-full rounded-full" style={{ background:"hsl(38 65% 55%)" }}
                    initial={{ width:"0%" }} animate={{ width:"100%" }}
                    transition={{ duration:1.6, ease:"linear" }}/>
                </div>
              </motion.div>
            )}

            {/* ── WRONG PASSWORD ────────────────────────────────────── */}
            {stage==="pw-wrong" && (
              <motion.div key="pw-wrong" className="p-8 text-center"
                initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background:"hsl(0 50% 40%/0.12)", border:"1px solid hsl(0 50% 40%/0.25)" }}>
                  <X size={20} style={{ color:"hsl(0 65% 62%)" }}/>
                </div>
                <h3 className="text-lg font-light mb-2"
                  style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 85%)" }}>
                  Incorrect Password
                </h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color:"hsl(38 8% 50%)" }}>
                  Please contact our sales team to request access to this project.
                </p>
                <div className="flex gap-3 mb-4">
                  <a href={`mailto:${SALES_EMAIL}?subject=Access Request — ${project.title}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border"
                    style={{ borderColor:"hsl(222 18% 18%)", color:"hsl(38 8% 60%)" }}>
                    <Mail size={13}/> Email Sales
                  </a>
                  <a href={`tel:${SALES_PHONE}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)" }}>
                    <Phone size={13}/> Call Sales
                  </a>
                </div>
                <button onClick={()=>{ setStage("form"); setPassword(""); }}
                  className="text-xs" style={{ color:"hsl(38 8% 38%)" }}>
                  ← Try again
                </button>
              </motion.div>
            )}

            {/* ── OTP — enter code ──────────────────────────────────── */}
            {(stage==="otp-sent"||stage==="otp-verifying") && (
              <motion.div key="otp-verify"
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <div className="p-7 pb-5" style={{ borderBottom:"1px solid hsl(222 18% 12%)" }}>
                  <h2 className="text-xl font-light mb-1"
                    style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 86%)" }}>
                    Enter your code
                  </h2>
                  <p className="text-sm" style={{ color:"hsl(38 8% 48%)" }}>
                    Code sent to{" "}
                    <span style={{ color:"hsl(38 50% 65%)" }}>{contact}</span>
                  </p>
                </div>
                <div className="p-7 space-y-5">
                  <OtpBoxes value={otp} onChange={setOtp}/>
                  {otpErr && (
                    <motion.p className="text-xs text-center" style={{ color:"hsl(0 60% 58%)" }}
                      initial={{ opacity:0 }} animate={{ opacity:1 }}>{otpErr}</motion.p>
                  )}
                  <motion.button onClick={verifyCode}
                    disabled={stage==="otp-verifying"}
                    className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)",
                      opacity:stage==="otp-verifying"?0.7:1 }}
                    whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}>
                    {stage==="otp-verifying"
                      ? <><Loader2 size={14} className="animate-spin"/> Verifying…</>
                      : <>Verify & Launch <ArrowRight size={14}/></>}
                  </motion.button>
                  <button onClick={()=>{ setStage("form"); setOtp(""); setOtpErr(""); }}
                    className="w-full text-xs text-center" style={{ color:"hsl(38 8% 38%)" }}>
                    ← Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── MAIN FORM ─────────────────────────────────────────── */}
            {(stage==="form"||stage==="submitting"||stage==="otp-sending") && (
              <motion.div key="form" exit={{ opacity:0 }}>
                <div className="p-7 pb-5" style={{ borderBottom:"1px solid hsl(222 18% 12%)" }}>
                  <span className="inline-block text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full mb-3"
                    style={{ background:"hsl(38 65% 55%/0.08)", color:"hsl(38 55% 58%)", border:"1px solid hsl(38 50% 40%/0.2)" }}>
                    {project.type}
                  </span>
                  <h2 className="text-xl font-light mb-1"
                    style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 86%)" }}>
                    {project.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color:"hsl(38 8% 48%)" }}>
                    {project.description}
                  </p>
                </div>

                <div className="p-7 pt-5 space-y-4">
                  <p className="text-xs" style={{ color:"hsl(38 8% 40%)" }}>
                    Enter your details to access this experience
                  </p>

                  {/* Name */}
                  <LField label="Full Name" error={errors.name}>
                    <input type="text" placeholder="Alex Johnson" value={name}
                      onChange={e=>{ setName(e.target.value); setErrors(p=>({...p,name:""})); }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={iStyle("name")}
                      onFocus={e=>e.currentTarget.style.borderColor="hsl(38 50% 38%)"}
                      onBlur={e=>e.currentTarget.style.borderColor=errors.name?"hsl(0 50% 45%)":"hsl(222 18% 15%)"}/>
                  </LField>

                  {/* Email */}
                  <LField label="Email Address" error={errors.email}>
                    <input type="email" placeholder="alex@studio.com" value={email}
                      onChange={e=>{ setEmail(e.target.value); setErrors(p=>({...p,email:""})); }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={iStyle("email")}
                      onFocus={e=>e.currentTarget.style.borderColor="hsl(38 50% 38%)"}
                      onBlur={e=>e.currentTarget.style.borderColor=errors.email?"hsl(0 50% 45%)":"hsl(222 18% 15%)"}/>
                  </LField>

                  {/* Phone — with inline Send Code for OTP */}
                  <LField label="Phone / WhatsApp" error={errors.contact}>
                    <div className="flex gap-2">
                      <input type="tel" placeholder="+91 98765 43210" value={contact}
                        onChange={e=>{ setContact(e.target.value); setErrors(p=>({...p,contact:""})); }}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                        style={iStyle("contact")}
                        onFocus={e=>e.currentTarget.style.borderColor="hsl(38 50% 38%)"}
                        onBlur={e=>e.currentTarget.style.borderColor=errors.contact?"hsl(0 50% 45%)":"hsl(222 18% 15%)"}/>
                      {access==="otp" && (
                        <motion.button
                          onClick={sendOtp}
                          disabled={stage==="otp-sending"}
                          className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5"
                          style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)",
                            opacity:stage==="otp-sending"?0.6:1 }}
                          whileHover={{ y:-1 }} whileTap={{ scale:0.96 }}>
                          {stage==="otp-sending"
                            ? <Loader2 size={11} className="animate-spin"/>
                            : <><SendHorizonal size={11}/>{codeSent?"Resend":"Send Code"}</>}
                        </motion.button>
                      )}
                    </div>
                  </LField>

                  {/* Password field — only for password access */}
                  {access==="password" && (
                    <LField label="Access Password">
                      <div className="relative">
                        <input type={showPw?"text":"password"} placeholder="Enter access password"
                          value={password} onChange={e=>setPassword(e.target.value)}
                          onKeyDown={e=>e.key==="Enter"&&submit()}
                          className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none"
                          style={iStyle()}
                          onFocus={e=>e.currentTarget.style.borderColor="hsl(38 50% 38%)"}
                          onBlur={e=>e.currentTarget.style.borderColor="hsl(222 18% 15%)"}/>
                        <button type="button" onClick={()=>setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color:"hsl(38 8% 40%)" }}>
                          {showPw?<EyeOff size={13}/>:<Eye size={13}/>}
                        </button>
                      </div>
                    </LField>
                  )}

                  {/* OTP error if send failed */}
                  {otpErr && (stage==="form") && (
                    <p className="text-xs" style={{ color:"hsl(0 60% 58%)" }}>{otpErr}</p>
                  )}

                  {/* Main CTA — hidden for OTP (Send Code button is the CTA) */}
                  {access!=="otp" && (
                    <motion.button onClick={submit}
                      disabled={stage==="submitting"}
                      className="w-full mt-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5"
                      style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)",
                        boxShadow:"0 6px 24px hsl(38 65% 40%/0.22)",
                        opacity:stage==="submitting"?0.7:1 }}
                      whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}>
                      {stage==="submitting"
                        ? <><Loader2 size={14} className="animate-spin"/> Preparing…</>
                        : <>Start Experience <ArrowRight size={14}/></>}
                    </motion.button>
                  )}

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

function LField({ label, error, children }: { label:string; error?:string; children:React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color:"hsl(38 8% 46%)" }}>{label}</label>
      {children}
      {error && (
        <motion.p className="text-[11px] mt-1" style={{ color:"hsl(0 60% 58%)" }}
          initial={{ opacity:0, y:-3 }} animate={{ opacity:1, y:0 }}>{error}</motion.p>
      )}
    </div>
  );
}

function OtpBoxes({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  const boxes = 6;
  const refs  = Array.from({ length:boxes }, ()=>({ current:null as HTMLInputElement|null }));

  const handle = (i:number, v:string) => {
    const digit = v.replace(/\D/,"").slice(-1);
    const arr   = (value+"      ").slice(0,boxes).split("");
    arr[i]      = digit||" ";
    onChange(arr.join("").trimEnd());
    if (digit && i<boxes-1) refs[i+1].current?.focus();
  };

  const handleKey = (i:number, e:React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key==="Backspace" && !(value[i]||"").trim() && i>0) refs[i-1].current?.focus();
  };

  const handlePaste = (e:React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,boxes);
    onChange(txt);
    refs[Math.min(txt.length,boxes-1)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length:boxes }).map((_,i) => (
        <input key={i} ref={el=>{ refs[i].current=el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={(value[i]||"").trim()}
          onChange={e=>handle(i,e.target.value)}
          onKeyDown={e=>handleKey(i,e)}
          onPaste={handlePaste}
          className="w-10 h-12 text-center text-lg font-light rounded-xl focus:outline-none"
          style={{
            background:"hsl(222 22% 6%)",
            border:`1px solid ${(value[i]||"").trim()?"hsl(38 50% 38%)":"hsl(222 18% 15%)"}`,
            color:"hsl(38 15% 90%)",
          }}
          onFocus={e=>e.currentTarget.style.borderColor="hsl(38 50% 48%)"}
          onBlur={e=>e.currentTarget.style.borderColor=(value[i]||"").trim()?"hsl(38 50% 38%)":"hsl(222 18% 15%)"}
        />
      ))}
    </div>
  );
}
