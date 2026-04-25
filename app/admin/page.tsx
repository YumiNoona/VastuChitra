"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, Loader2, AlertCircle } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("vc_admin_session") === "true") {
      setIsAuth(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });

      if (res.ok) {
        localStorage.setItem("vc_admin_session", "true");
        setIsAuth(true);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid administrative passcode");
      }
    } catch (err) {
      setError("Authentication service unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vc_admin_session");
    setIsAuth(false);
  };

  if (isAuth) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="dark min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden text-foreground">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(226,255,175,0.05),transparent_70%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="bevel-card p-10 bg-[#0A0A0A]/80 backdrop-blur-xl border-border/50 text-center">
          <div className="w-16 h-16 rounded-2xl bg-vastu-green/10 border border-vastu-green/20 flex items-center justify-center mx-auto mb-8 text-vastu-green">
            <Shield size={32} />
          </div>

          <h1 className="text-3xl font-medium tracking-tighter mb-2">IPDS</h1>
          <p className="text-sm text-muted-foreground font-light mb-10 uppercase tracking-[0.2em] text-[10px] font-bold">Administrative Access</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Secure Passcode</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-vastu-green transition-colors" />
                <input 
                  type="password" 
                  autoFocus
                  placeholder="••••••••"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-vastu-green/20 focus:border-vastu-green/50 transition-all text-sm tracking-widest shadow-inner"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 text-red-400 text-xs font-medium justify-center"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-vercel h-12 text-sm font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Shield size={16} /> Authenticate</>}
            </button>
          </form>

          <p className="mt-10 text-[10px] text-muted-foreground/40 font-medium uppercase tracking-widest">
            Protected by military-grade encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}
