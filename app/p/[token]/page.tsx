"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, X, Sun, Moon, Monitor, Smartphone } from "lucide-react";
import { getProjectByToken, verifyOtp, Project, ProjectAuth } from "@/lib/supabase";
import { useTheme } from "next-themes";

// ── Helpers ───────────────────────────────────────────────────────────────────
function useToken() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/p/")[1] ?? "";
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PrivateLinkPage() {
  const token = useToken();
  const [project, setProject] = useState<Project | null>(null);
  const [auth,    setAuth]    = useState<ProjectAuth | null>(null);
  const [status,  setStatus]  = useState<"loading"|"not-found"|"granted">("loading");

  useEffect(() => {
    if (!token) { setStatus("not-found"); return; }
    (async () => {
      const { project: p, auth: a } = await getProjectByToken(token);
      if (!p || !a) { setStatus("not-found"); return; }
      setProject(p);
      setAuth(a);
      setStatus("granted");
    })();
  }, [token]);

  if (status === "loading") return <Loader />;
  if (status === "not-found") return <NotFound />;
  
  return <ProjectView project={project!} auth={auth!} />;
}

// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(240 15% 6%)" }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: "hsl(258 78% 70%/0.2)", borderTopColor: "hsl(258 78% 70%)" }} />
    </div>
  );
}

// ── Not Found ─────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#000" }}>
      <X size={32} className="mb-4 text-red-500" />
      <h1 className="text-xl font-light mb-2 text-white">
        Link not found or expired
      </h1>
      <p className="text-sm text-center text-white/40">
        This link may have expired or been revoked. Please contact your architect.
      </p>
    </div>
  );
}

// ── OTP 6-box input ───────────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !refs[i].current?.value && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/, "").slice(-1);
    const arr = value.split("");
    arr[i] = digit;
    const next = arr.join("").padEnd(6, "").slice(0, 6);
    onChange(next.trimEnd());
    if (digit && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(txt);
    refs[Math.min(txt.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-10 h-12 text-center text-lg font-light rounded-xl focus:outline-none"
          style={{
            background: "hsl(240 14% 7%)",
            border: `1px solid ${value[i] ? "hsl(258 60% 60%)" : "hsl(240 10% 18%)"}`,
            color: "hsl(40 18% 90%)",
            transition: "border-color .15s",
          }}
          onFocus={e => e.currentTarget.style.borderColor = "hsl(258 60% 62%)"}
          onBlur={e => e.currentTarget.style.borderColor = value[i] ? "hsl(258 60% 60%)" : "hsl(240 10% 18%)"}
        />
      ))}
    </div>
  );
}

// ── Project View — what the client actually sees ───────────────────────────────
function ProjectView({ project, auth }: { project: Project; auth: ProjectAuth }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || theme === "dark";

  // Pick the right thumbnail based on current theme
  const thumbnail = (() => {
    if (!mounted) return project.image_url;
    if (isDark  && project.image_url_dark)  return project.image_url_dark;
    if (!isDark && project.image_url_light) return project.image_url_light;
    return project.image_url;
  })();

  const bg   = isDark ? "hsl(240 15% 6%)"  : "hsl(38 52% 95%)";
  const card = isDark ? "hsl(240 14% 9%)"  : "hsl(38 40% 91%)";
  const bdr  = isDark ? "hsl(240 10% 14%)" : "hsl(38 20% 80%)";
  const fg   = isDark ? "hsl(40 18% 88%)"  : "hsl(220 30% 10%)";
  const sub  = isDark ? "hsl(240 6% 48%)"  : "hsl(220 14% 42%)";
  const acc  = isDark ? "hsl(258 78% 70%)" : "hsl(22 92% 48%)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg, transition: "background .3s" }}>
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: bdr }}>
        <div>
          <span className="text-sm font-bold tracking-tighter" style={{ color: "#fff" }}>
            VASTU<span style={{ color: "#e2ffaf" }}>CHITRA</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {auth.email && (
            <span className="text-xs" style={{ color: sub }}>for {auth.email}</span>
          )}
          {/* Theme toggle */}
          <button onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: bdr }}>
            {isDark
              ? <Sun size={13} style={{ color: "hsl(38 65% 60%)" }} />
              : <Moon size={13} style={{ color: "hsl(220 60% 50%)" }} />}
          </button>
        </div>
      </header>

      {/* Main content — single project card, centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>

            {/* Label */}
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-4 text-center" style={{ color: "#e2ffaf" }}>
              Private Preview
            </p>

            {/* Card */}
            <div className="rounded-2xl overflow-hidden border" style={{ background: card, borderColor: bdr }}>
              {/* Image */}
              <div className="relative w-full h-56 overflow-hidden">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transition: "opacity .4s" }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ color: sub }}>
                    No image
                  </div>
                )}
                {/* Access badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] px-2 py-1 rounded-full"
                    style={{ background: "hsl(142 55% 40%/0.15)", color: "hsl(142 55% 60%)", border: "1px solid hsl(142 55% 40%/0.25)" }}>
                    Private
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-lg font-light leading-tight" style={{ color: fg, fontFamily: "Georgia, serif" }}>
                    {project.title}
                  </h2>
                  <span className="text-[11px] px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ background: isDark ? "hsl(240 12% 14%)" : "hsl(38 25% 84%)", color: sub }}>
                    {project.type}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: sub }}>{project.description}</p>
                <div className="flex items-center gap-4 text-xs mb-5" style={{ color: sub }}>
                  <span>{project.location}</span>
                  <span>{project.year}</span>
                </div>

                {/* Launch button */}
                {project.stream_url ? (
                  <motion.button
                    onClick={() => setFormOpen(true)}
                    className="w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: "#e2ffaf", color: "#000", boxShadow: "0 10px 30px rgba(226, 255, 175, 0.2)" }}
                    whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
                    Launch Tour →
                  </motion.button>
                ) : (
                  <div className="w-full py-3 rounded-xl text-sm text-center"
                    style={{ background: isDark ? "hsl(240 12% 13%)" : "hsl(38 20% 84%)", color: sub }}>
                    Tour coming soon
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: isDark ? "hsl(240 6% 32%)" : "hsl(220 10% 60%)" }}>
              This is a private preview link. Please do not share.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Launch form modal (same as main site) */}
      <AnimatePresence>
        {formOpen && (
          <LaunchModal
            project={project}
            auth={auth}
            clientEmail={auth.email || ""}
            onClose={() => setFormOpen(false)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LaunchModal({ project, auth, clientEmail, onClose, isDark }: {
  project: Project; auth: ProjectAuth; clientEmail: string;
  onClose: () => void; isDark: boolean;
}) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState(clientEmail || "");
  const [contact, setContact] = useState("");
  const [step,    setStep]    = useState<"form"|"instructions"|"launching">("form");

  // Auth States
  const [pw,       setPw]       = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [usePhone, setUsePhone] = useState(true); // prefer SMS for OTP
  const [otpCode,  setOtpCode]  = useState("");
  const [otpSent,  setOtpSent]  = useState(false);
  const [channel,  setChannel]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [checking, setChecking] = useState(false);
  const [error,    setError]    = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const requiresAuth = project.access_type !== "public";

  const startCountdown = () => {
    setCountdown(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(n => { if (n <= 1) { clearInterval(timerRef.current); return 0; } return n - 1; });
    }, 1000);
  };

  const sendOtp = async () => {
    const targetContact = usePhone ? contact : email;
    if (!targetContact) { setError(usePhone ? "Enter your phone number above." : "Enter your email address above."); return; }
    setSending(true); setError("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkToken: auth.token,
        phone:  usePhone ? targetContact : undefined,
        email:  usePhone ? undefined : targetContact,
        projectTitle: project.title,
        clientName: name || "Valued Client",
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (res.ok) { setOtpSent(true); setChannel(data.channel ?? ""); startCountdown(); }
    else { setError(data.error ?? "Failed to send code. Please try again."); }
  };

  const executeLaunch = async () => {
    setStep("launching");
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, contact, project: project.title, projectId: project.id }),
    }).catch(() => {});
    
    setTimeout(() => {
      if (project.stream_url) window.open(project.stream_url, "_blank");
    }, 800);
  };

  const submit = async () => {
    if (!name || !email) return;

    if (project.access_type === "password") {
      if (pw !== project.access_password) {
        setError("Incorrect password. Please try again.");
        return;
      }
    } 
    
    if (project.access_type === "otp") {
      if (!otpSent) {
        // Only trigger send if they clicked launch without sending first
        sendOtp();
        return;
      }
      if (otpCode.length !== 6) { setError("Enter the 6-digit code."); return; }
      setChecking(true); setError("");
      const { valid } = await verifyOtp(project.id, otpCode);
      setChecking(false);
      if (!valid) {
        setError("Invalid or expired code.");
        return;
      }
    }

    setStep("instructions");
  };

  const bg  = isDark ? "hsl(240 15% 6%)"  : "hsl(38 52% 95%)";
  const crd = isDark ? "hsl(240 14% 9%)"  : "hsl(38 40% 91%)";
  const bdr = isDark ? "hsl(240 10% 14%)" : "hsl(38 20% 80%)";
  const fg  = isDark ? "hsl(40 18% 88%)"  : "hsl(220 30% 10%)";
  const sub = isDark ? "hsl(240 6% 48%)"  : "hsl(220 14% 42%)";
  const acc = isDark ? "hsl(258 78% 70%)" : "hsl(22 92% 48%)";

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14,
    background: isDark ? "hsl(240 14% 7%)" : "hsl(38 30% 87%)",
    border: `1px solid ${bdr}`, color: fg, outline: "none",
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="w-full max-w-sm rounded-2xl border p-7 max-h-[90vh] overflow-y-auto no-scrollbar"
        style={{ background: crd, borderColor: bdr }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>

        {step === "form" ? (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-light text-base" style={{ color: fg, fontFamily: "Georgia, serif" }}>
                  Ready to launch?
                </h3>
                <p className="text-xs mt-0.5" style={{ color: sub }}>Quick confirmation before we open your tour</p>
              </div>
              <button onClick={onClose} style={{ color: sub }}><X size={16} /></button>
            </div>

            <div className="space-y-3 mb-5">
              <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = acc}
                onBlur={e => e.currentTarget.style.borderColor = bdr} />
              <input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = acc}
                onBlur={e => e.currentTarget.style.borderColor = bdr} />
              <input placeholder="Phone (optional)" value={contact} onChange={e => setContact(e.target.value)} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = acc}
                onBlur={e => e.currentTarget.style.borderColor = bdr} />
            </div>

            {/* --- Auth Integration inside Modal --- */}
            {requiresAuth && (
              <div className="mb-6 space-y-4 pt-4 border-t" style={{ borderColor: bdr }}>
                
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={12} style={{ color: acc }} />
                  <p className="text-xs font-medium" style={{ color: fg }}>
                    {project.access_type === "password" ? "Password Required" : "Verification Required"}
                  </p>
                </div>

                {project.access_type === "password" && (
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Access password"
                      value={pw}
                      onChange={e => { setPw(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && submit()}
                      style={inp}
                      onFocus={e => e.currentTarget.style.borderColor = acc}
                      onBlur={e => e.currentTarget.style.borderColor = bdr}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: sub }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                )}

                {project.access_type === "otp" && (
                  <div className="space-y-3">
                    {!otpSent ? (
                      <>
                        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: bdr }}>
                          {[{ id: true, label: "📱 SMS" }, { id: false, label: "✉️ Email" }].map(({ id, label }) => (
                            <button key={String(id)} onClick={() => { setUsePhone(id); setError(""); }}
                              className="flex-1 py-1.5 text-xs font-medium transition-all"
                              style={{
                                background: usePhone === id ? "hsl(258 60% 55%)" : "transparent",
                                color: usePhone === id ? "#fff" : sub,
                              }}>
                              {label}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={sendOtp} disabled={sending || (usePhone ? !contact : !email)}
                          className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-colors flex items-center justify-center gap-2"
                          style={{ 
                            borderColor: bdr, color: fg, 
                            opacity: (sending || (usePhone ? !contact : !email)) ? 0.5 : 1 
                          }}>
                          {sending ? "Sending..." : `Send Code via ${usePhone ? "SMS" : "Email"}`}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-center mb-1" style={{ color: sub }}>
                          Code sent to <span style={{ color: fg }}>{channel.startsWith("sms") ? contact : email}</span>
                        </p>
                        <OtpInput value={otpCode} onChange={setOtpCode} />
                        <button
                          onClick={() => { if (countdown === 0) { setOtpSent(false); setOtpCode(""); } }}
                          className="w-full text-center text-xs py-1 mt-1"
                          style={{ color: countdown > 0 ? "hsl(240 6% 36%)" : "hsl(258 60% 65%)", cursor: countdown > 0 ? "default" : "pointer" }}>
                          {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {error && (
                  <p className="mt-2 text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 text-center">
                    {error}
                  </p>
                )}
              </div>
            )}

            <motion.button onClick={submit} disabled={!name || !email || checking}
              className="w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex justify-center gap-2"
              style={{ background: "#e2ffaf", color: "#000", opacity: (!name || !email || checking) ? 0.5 : 1 }}
              whileHover={(!name || !email || checking) ? {} : { y: -1, scale: 1.02 }} 
              whileTap={(!name || !email || checking) ? {} : { scale: 0.98 }}>
              {checking ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"/> : "Launch Tour →"}
            </motion.button>
          </>
        ) : step === "instructions" ? (
          <div>
            <div className="mb-5">
              <h3 className="font-light text-base" style={{ color: fg, fontFamily: "Georgia, serif" }}>
                Before you start
              </h3>
              <p className="text-xs mt-0.5" style={{ color: sub }}>
                Quick guide to navigate the project stream.
              </p>
            </div>

            <div className="p-3 rounded-xl mb-4 border" style={{ background: isDark ? "hsl(38 20% 12%)" : "hsl(38 45% 88%)", borderColor: bdr }}>
              <p className="text-xs leading-relaxed" style={{ color: fg }}>
                <strong className="block mb-1">Session Notice</strong>
                Each cloud GPU session lasts <span style={{ color: "#e2ffaf", fontWeight: 600 }}>15 minutes</span>. Inactive sessions may disconnect automatically.
              </p>
            </div>

            <InstructionTabs isDark={isDark} />

            <motion.button
              onClick={executeLaunch}
              className="w-full mt-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              style={{ background: "#e2ffaf", color: "#000" }}
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              I Understand, Launch Tour <ArrowRight size={13} />
            </motion.button>

            <button
              onClick={() => setStep("form")}
              className="w-full text-xs mt-3"
              style={{ color: sub }}
            >
              Back
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${acc}18`, border: `1px solid ${acc}30` }}>
              <CheckCircle2 size={22} style={{ color: acc }} />
            </div>
            <h3 className="font-light mb-2" style={{ color: fg, fontFamily: "Georgia, serif" }}>Opening your tour…</h3>
            <p className="text-xs" style={{ color: sub }}>If it doesn't open automatically, check your popup settings.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function InstructionTabs({ isDark }: { isDark: boolean }) {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");
  const fg = isDark ? "hsl(40 18% 88%)" : "hsl(220 30% 10%)";
  const sub = isDark ? "hsl(240 6% 48%)" : "hsl(220 14% 42%)";
  const bdr = isDark ? "hsl(240 10% 14%)" : "hsl(38 20% 80%)";
  const panel = isDark ? "hsl(240 14% 7%)" : "hsl(38 30% 87%)";

  return (
    <div>
      <div className="flex rounded-xl p-1 mb-4 border" style={{ borderColor: bdr, background: panel }}>
        <button
          onClick={() => setTab("desktop")}
          className="flex-1 py-2 text-xs rounded-lg flex items-center justify-center gap-2"
          style={{ background: tab === "desktop" ? "rgba(255,255,255,0.12)" : "transparent", color: tab === "desktop" ? fg : sub }}
        >
          <Monitor size={14} /> Desktop
        </button>
        <button
          onClick={() => setTab("mobile")}
          className="flex-1 py-2 text-xs rounded-lg flex items-center justify-center gap-2"
          style={{ background: tab === "mobile" ? "rgba(255,255,255,0.12)" : "transparent", color: tab === "mobile" ? fg : sub }}
        >
          <Smartphone size={14} /> Mobile
        </button>
      </div>

      <div className="space-y-2">
        {tab === "desktop" ? (
          <>
            <InstructionRow label="Look Around" value="Left click + drag" fg={fg} sub={sub} bdr={bdr} />
            <InstructionRow label="Move / Walk" value="W A S D or Arrow keys" fg={fg} sub={sub} bdr={bdr} />
            <InstructionRow label="Interact" value="Single left click" fg={fg} sub={sub} bdr={bdr} />
            <InstructionRow label="Zoom" value="Mouse wheel" fg={fg} sub={sub} bdr={bdr} />
          </>
        ) : (
          <>
            <InstructionRow label="Look Around" value="One-finger drag" fg={fg} sub={sub} bdr={bdr} />
            <InstructionRow label="Move / Walk" value="On-screen joystick" fg={fg} sub={sub} bdr={bdr} />
            <InstructionRow label="Interact" value="Single tap" fg={fg} sub={sub} bdr={bdr} />
            <InstructionRow label="Menu / Settings" value="Three-finger tap" fg={fg} sub={sub} bdr={bdr} />
          </>
        )}
      </div>
    </div>
  );
}

function InstructionRow({
  label,
  value,
  fg,
  sub,
  bdr,
}: {
  label: string;
  value: string;
  fg: string;
  sub: string;
  bdr: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: bdr }}>
      <span className="text-xs" style={{ color: fg }}>{label}</span>
      <span className="text-[11px] px-2 py-1 rounded-md" style={{ color: sub, border: `1px solid ${bdr}` }}>
        {value}
      </span>
    </div>
  );
}
