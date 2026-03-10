"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getVisitors, getVisitorStats, getProjects, createProject, deleteProject,
  Project, ProjectType,
} from "@/lib/supabase";
import {
  Users, Eye, TrendingUp, Calendar, LogOut, ExternalLink,
  Search, Download, LayoutGrid, Lock, EyeOff, FolderPlus,
  Image as ImageIcon, Link2, MapPin, Tag, Trash2,
  Plus, AlertTriangle, X, RefreshCw, Sparkles, Mail,
  Send, CheckCircle2, Clock, ArrowRight,
} from "lucide-react";

// Password is checked server-side via /api/admin-auth — never stored in client code

// ── Types ────────────────────────────────────────────────────────────────────
interface Visitor {
  id: string; name: string; email: string; contact: string;
  project: string; project_id: string; timestamp: string;
}
interface Stats {
  total: number; unique: number; recent7: number;
  byProject: { project: string; count: number }[];
}
type Tab = "overview" | "visitors" | "projects" | "email";

interface NewProject {
  title: string; description: string; long_description: string;
  stream_url: string; type: ProjectType; location: string;
  year: string; featured: boolean; sort_order: number;
  imageFile: File | null; imagePreview: string;
}

const BLANK: NewProject = {
  title: "", description: "", long_description: "", stream_url: "",
  type: "Residential", location: "", year: new Date().getFullYear().toString(),
  featured: false, sort_order: 0, imageFile: null, imagePreview: "",
};

// ── Shared input style ───────────────────────────────────────────────────────
const inp = {
  className: "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors",
  style: { background:"hsl(222 22% 6%)", border:"1px solid hsl(222 18% 15%)", color:"hsl(38 15% 82%)" } as React.CSSProperties,
  onFocus: (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "hsl(38 50% 40%)"),
  onBlur: (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "hsl(222 18% 15%)"),
};

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("av_admin") === "1") setAuthed(true);
    setChecked(true);
  }, []);

  const handleLogin  = async (pass: string) => {
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });
    if (res.ok) { sessionStorage.setItem("av_admin","1"); setAuthed(true); return true; }
    return false;
  };
  const handleLogout = () => { sessionStorage.removeItem("av_admin"); setAuthed(false); };

  if (!checked) return null;
  return authed ? <Dashboard onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} />;
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (p: string) => Promise<boolean> }) {
  const [pass, setPass]       = useState("");
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const ok = await onLogin(pass);
    if (!ok) setError("Incorrect password.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:"hsl(222 24% 5%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background:"radial-gradient(circle, hsl(38 65% 50%/0.07) 0%, transparent 70%)", filter:"blur(80px)" }}/>
      </div>
      <motion.div className="relative w-full max-w-sm"
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}>
        <div className="text-center mb-10">
          <div className="w-11 h-11 rounded-xl border mx-auto mb-4 flex items-center justify-center"
            style={{ borderColor:"hsl(38 50% 35%/0.4)", background:"hsl(38 65% 58%/0.07)" }}>
            <Lock size={16} style={{ color:"hsl(38 65% 60%)" }}/>
          </div>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 88%)" }}>Admin Access</h1>
          <p className="text-xs" style={{ color:"hsl(38 8% 44%)" }}>Interactive ArchViz Studio</p>
        </div>
        <div className="rounded-2xl border p-8" style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color:"hsl(38 8% 50%)" }}>Password</label>
              <div className="relative">
                <input type={show?"text":"password"} placeholder="••••••••" value={pass}
                  onChange={e => { setPass(e.target.value); setError(""); }}
                  onKeyDown={e => e.key==="Enter" && submit()}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none"
                  style={{ background:"hsl(222 22% 6%)", border:"1px solid hsl(222 18% 15%)", color:"hsl(38 15% 85%)" }}
                  onFocus={(e:React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor="hsl(38 50% 40%)"}
                  onBlur={(e:React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor="hsl(222 18% 15%)"}/>
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color:"hsl(38 8% 40%)" }}>
                  {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p className="text-xs rounded-lg px-3 py-2"
                  style={{ color:"hsl(0 65% 60%)", background:"hsl(0 50% 40%/0.1)", border:"1px solid hsl(0 50% 40%/0.2)" }}
                  initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button onClick={submit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)", boxShadow:"0 6px 24px hsl(38 65% 40%/0.25)" }}
              whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}>
              {loading ? <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor:"hsl(222 24% 20%)", borderTopColor:"hsl(222 24% 5%)" }}/> : "Sign In"}
            </motion.button>
          </div>
          <p className="text-center text-[11px] mt-5" style={{ color:"hsl(38 8% 36%)" }}>
            <a href="/" style={{ color:"hsl(38 40% 50%)" }}>← Back to website</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    (async () => {
      const [{ data }, s] = await Promise.all([getVisitors(), getVisitorStats()]);
      setVisitors(data as Visitor[]);
      setStats(s as Stats);
      setLoading(false);
    })();
  }, []);

  const filtered = visitors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase()) ||
    v.project.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [["Name","Email","Contact","Project","Timestamp"],
      ...visitors.map(v => [v.name,v.email,v.contact,v.project,new Date(v.timestamp).toLocaleString()])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `visitors-${Date.now()}.csv`; a.click();
  };

  const fmt = (ts: string) =>
    new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

  const tabs: {id:Tab; label:string; icon:React.ReactNode}[] = [
    { id:"overview", label:"Overview",  icon:<LayoutGrid size={15}/> },
    { id:"visitors", label:"Visitors",  icon:<Users size={15}/> },
    { id:"projects", label:"Projects",  icon:<FolderPlus size={15}/> },
    { id:"email",    label:"Email",     icon:<Mail size={15}/> },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"hsl(222 24% 5%)" }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor:"hsl(38 30% 25%)", borderTopColor:"hsl(38 65% 58%)" }}/>
    </div>
  );

  const tabTitles: Record<Tab, string> = {
    overview: "Overview", visitors: "Visitor Log", projects: "Projects", email: "Email Automation",
  };
  const tabSubs: Record<Tab, string> = {
    overview: "Performance at a glance",
    visitors: `${visitors.length} total submissions`,
    projects: "Add, view and delete projects — live, no redeploy needed",
    email: "Send automated follow-up emails via Resend (free tier — 3,000/month)",
  };

  return (
    <div className="min-h-screen" style={{ background:"hsl(222 24% 5%)", fontFamily:"var(--font-body)" }}>
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-56 border-r flex flex-col z-40"
        style={{ background:"hsl(222 22% 7%)", borderColor:"hsl(222 18% 11%)" }}>
        <div className="px-5 py-6 border-b" style={{ borderColor:"hsl(222 18% 11%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)" }}>IA</div>
            <div>
              <div className="text-xs font-medium" style={{ color:"hsl(38 15% 80%)" }}>Admin Panel</div>
              <div className="text-[10px]" style={{ color:"hsl(38 8% 40%)" }}>Interactive ArchViz</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(({id,label,icon}) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
              style={{
                background: activeTab===id ? "hsl(38 65% 58%/0.1)" : "transparent",
                color: activeTab===id ? "hsl(38 65% 62%)" : "hsl(38 8% 48%)",
                borderLeft: activeTab===id ? "2px solid hsl(38 65% 58%)" : "2px solid transparent",
              }}>
              {icon} {label}
              {id==="visitors" && visitors.length>0 && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background:"hsl(38 65% 58%/0.15)", color:"hsl(38 55% 62%)" }}>
                  {visitors.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-5 space-y-1">
          <a href="/" target="_blank" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
            style={{ color:"hsl(38 8% 40%)" }}>
            <ExternalLink size={14}/> View Website
          </a>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
            style={{ color:"hsl(0 55% 55%)" }}>
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-56 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light" style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 88%)" }}>
              {tabTitles[activeTab]}
            </h1>
            <p className="text-sm mt-0.5" style={{ color:"hsl(38 8% 44%)" }}>{tabSubs[activeTab]}</p>
          </div>
          {activeTab==="visitors" && (
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border"
              style={{ borderColor:"hsl(222 18% 16%)", color:"hsl(38 8% 55%)" }}>
              <Download size={13}/> Export CSV
            </button>
          )}
        </div>

        {activeTab==="overview" && <OverviewTab stats={stats} visitors={visitors}/>}
        {activeTab==="visitors" && <VisitorsTab filtered={filtered} search={search} setSearch={setSearch} fmt={fmt}/>}
        {activeTab==="projects" && <ProjectsTab/>}
        {activeTab==="email"    && <EmailTab visitors={visitors}/>}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  OVERVIEW TAB  — shows stats even when empty
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ stats, visitors }: { stats: Stats | null; visitors: Visitor[] }) {
  const s = stats ?? { total:0, unique:0, recent7:0, byProject:[] };
  const recent = visitors.slice(0, 5);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {([
          { label:"Total Visitors",  value:s.total,            icon:Users,      color:"38 65% 58%"  },
          { label:"Unique Visitors", value:s.unique,           icon:Eye,        color:"142 55% 50%" },
          { label:"This Week",       value:s.recent7,          icon:TrendingUp, color:"210 70% 60%" },
          { label:"Active Projects", value:s.byProject.length, icon:Calendar,   color:"290 55% 62%" },
        ] as const).map(({label,value,icon:Icon,color}) => (
          <motion.div key={label} className="rounded-2xl border p-5"
            style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }} whileHover={{ y:-2 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color:"hsl(38 8% 44%)" }}>{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background:`hsl(${color}/0.1)`, border:`1px solid hsl(${color}/0.2)` }}>
                <Icon size={14} style={{ color:`hsl(${color})` }}/>
              </div>
            </div>
            <div className="text-3xl font-light"
              style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 88%)" }}>{value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By project bar chart */}
        <div className="rounded-2xl border p-6" style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
          <h2 className="text-sm font-medium mb-5" style={{ color:"hsl(38 15% 75%)" }}>Visits by Project</h2>
          {s.byProject.length===0 ? (
            <div className="text-center py-10">
              <Users size={28} className="mx-auto mb-2" style={{ color:"hsl(38 8% 28%)" }}/>
              <p className="text-sm" style={{ color:"hsl(38 8% 38%)" }}>No visitor data yet</p>
              <p className="text-xs mt-1" style={{ color:"hsl(38 8% 30%)" }}>Data appears when people fill in the launch form</p>
            </div>
          ) : (
            <div className="space-y-4">
              {s.byProject.map(({project,count}) => {
                const pct = s.total>0 ? Math.round((count/s.total)*100) : 0;
                return (
                  <div key={project}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm truncate" style={{ color:"hsl(38 10% 65%)" }}>{project}</span>
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color:"hsl(38 8% 44%)" }}>{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"hsl(222 18% 13%)" }}>
                      <motion.div className="h-full rounded-full" style={{ background:"hsl(38 65% 58%)" }}
                        initial={{ width:0 }} animate={{ width:`${pct}%` }}
                        transition={{ duration:0.8, delay:0.2, ease:[0.16,1,0.3,1] }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent visitors */}
        <div className="rounded-2xl border p-6" style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
          <h2 className="text-sm font-medium mb-5" style={{ color:"hsl(38 15% 75%)" }}>Recent Visitors</h2>
          {recent.length===0 ? (
            <div className="text-center py-10">
              <Clock size={28} className="mx-auto mb-2" style={{ color:"hsl(38 8% 28%)" }}/>
              <p className="text-sm" style={{ color:"hsl(38 8% 38%)" }}>No visitors yet</p>
              <p className="text-xs mt-1" style={{ color:"hsl(38 8% 30%)" }}>Leads appear here in real time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(v => (
                <div key={v.id} className="flex items-center gap-3 py-2 border-b"
                  style={{ borderColor:"hsl(222 18% 11%)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background:"hsl(38 65% 58%/0.12)", color:"hsl(38 65% 60%)", border:"1px solid hsl(38 50% 40%/0.2)" }}>
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color:"hsl(38 12% 75%)" }}>{v.name}</p>
                    <p className="text-xs truncate" style={{ color:"hsl(38 8% 44%)" }}>{v.project}</p>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color:"hsl(38 8% 36%)" }}>
                    {new Date(v.timestamp).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VISITORS TAB
// ══════════════════════════════════════════════════════════════════════════════
function VisitorsTab({ filtered, search, setSearch, fmt }: {
  filtered: Visitor[]; search: string;
  setSearch: (v:string) => void; fmt: (ts:string) => string;
}) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:"hsl(38 8% 40%)" }}/>
        <input type="text" placeholder="Search by name, email or project…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background:"hsl(222 22% 8%)", border:"1px solid hsl(222 18% 13%)", color:"hsl(38 15% 80%)" }}
          onFocus={(e:React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor="hsl(38 40% 35%)"}
          onBlur={(e:React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor="hsl(222 18% 13%)"}/>
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:"1px solid hsl(222 18% 12%)" }}>
              {["Name","Email","Contact","Project","Date"].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[11px] font-medium tracking-wider uppercase"
                  style={{ color:"hsl(38 8% 40%)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 ? (
              <tr><td colSpan={5} className="text-center py-16" style={{ color:"hsl(38 8% 38%)" }}>
                <Users size={28} className="mx-auto mb-2" style={{ color:"hsl(38 8% 25%)" }}/>
                <p className="text-sm">{search ? "No matching results" : "No visitors yet — they appear here when someone fills in the launch form"}</p>
              </td></tr>
            ) : filtered.map((v,i) => (
              <motion.tr key={v.id} style={{ borderBottom:"1px solid hsl(222 18% 11%)" }}
                initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}
                onMouseEnter={(e:React.MouseEvent<HTMLTableRowElement>) => e.currentTarget.style.background="hsl(222 22% 10%)"}
                onMouseLeave={(e:React.MouseEvent<HTMLTableRowElement>) => e.currentTarget.style.background="transparent"}>
                <td className="px-5 py-3.5 font-medium" style={{ color:"hsl(38 12% 75%)" }}>{v.name}</td>
                <td className="px-5 py-3.5" style={{ color:"hsl(38 8% 52%)" }}>{v.email}</td>
                <td className="px-5 py-3.5" style={{ color:"hsl(38 8% 52%)" }}>{v.contact}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background:"hsl(38 65% 58%/0.1)", color:"hsl(38 55% 60%)", border:"1px solid hsl(38 50% 40%/0.2)" }}>
                    {v.project}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs" style={{ color:"hsl(38 8% 40%)" }}>{fmt(v.timestamp)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROJECTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsTab() {
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [deleteId, setDeleteId]     = useState<string|null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setProjects(await getProjects());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload, refreshKey]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await deleteProject(deleteId);
    if (!error) { setDeleteId(null); await reload(); }
    setDeleting(false);
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color:"hsl(38 8% 44%)" }}>
            {projects.length} project{projects.length!==1?"s":""} live
          </span>
          <button onClick={() => setRefreshKey(k => k+1)} className="p-1.5 rounded-lg"
            style={{ color:"hsl(38 8% 40%)" }}>
            <RefreshCw size={13}/>
          </button>
        </div>
        <motion.button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)", boxShadow:"0 4px 16px hsl(38 65% 40%/0.25)" }}
          whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}>
          <Plus size={14}/> Add Project
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 rounded-full animate-spin"
            style={{ borderColor:"hsl(38 30% 25%)", borderTopColor:"hsl(38 65% 58%)" }}/>
        </div>
      ) : projects.length===0 ? (
        <div className="rounded-2xl border p-16 text-center"
          style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
          <FolderPlus size={32} className="mx-auto mb-4" style={{ color:"hsl(38 8% 30%)" }}/>
          <p className="text-sm mb-1" style={{ color:"hsl(38 8% 50%)" }}>No projects yet</p>
          <p className="text-xs" style={{ color:"hsl(38 8% 35%)" }}>Click "Add Project" to publish your first one</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {projects.map((p,i) => (
              <motion.div key={p.id}
                className="rounded-2xl border overflow-hidden flex items-stretch"
                style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.96 }} transition={{ delay:i*0.04 }} layout>
                <div className="w-24 flex-shrink-0 relative overflow-hidden" style={{ background:"hsl(222 18% 12%)" }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.title} className="absolute inset-0 w-full h-full object-cover"/>
                    : <div className="absolute inset-0 flex items-center justify-center" style={{ color:"hsl(38 8% 28%)" }}><ImageIcon size={22}/></div>
                  }
                </div>
                <div className="flex-1 px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate" style={{ color:"hsl(38 15% 85%)" }}>{p.title}</h3>
                      {p.featured && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background:"hsl(38 65% 58%/0.12)", color:"hsl(38 65% 60%)", border:"1px solid hsl(38 50% 40%/0.2)" }}>
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate mb-2" style={{ color:"hsl(38 8% 48%)" }}>{p.description}</p>
                    <div className="flex items-center gap-3 text-[11px]" style={{ color:"hsl(38 8% 38%)" }}>
                      <span className="flex items-center gap-1"><MapPin size={9}/>{p.location}</span>
                      <span>{p.year}</span>
                      <span className="px-1.5 py-0.5 rounded" style={{ background:"hsl(222 18% 13%)", color:"hsl(38 8% 50%)" }}>{p.type}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5 text-[11px]"
                    style={{ color: p.stream_url && !p.stream_url.includes("REPLACE_ME") ? "hsl(142 55% 50%)" : "hsl(38 8% 35%)" }}>
                    <Link2 size={11}/>
                    {p.stream_url && !p.stream_url.includes("REPLACE_ME") ? "Stream ready" : "No stream URL"}
                  </div>
                  <button onClick={() => setDeleteId(p.id)}
                    className="flex-shrink-0 p-2 rounded-xl transition-all"
                    style={{ color:"hsl(0 55% 55%/0.6)" }}
                    onMouseEnter={e => { e.currentTarget.style.color="hsl(0 65% 62%)"; e.currentTarget.style.background="hsl(0 50% 40%/0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="hsl(0 55% 55%/0.6)"; e.currentTarget.style.background="transparent"; }}>
                    <Trash2 size={15}/>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showForm && <AddProjectModal onClose={() => setShowForm(false)} onCreated={async () => { setShowForm(false); await reload(); }}/>}
      </AnimatePresence>
      <AnimatePresence>
        {deleteId && (
          <DeleteConfirmModal
            project={projects.find(p => p.id===deleteId)!}
            onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting}/>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ADD PROJECT MODAL  — with live card preview
// ══════════════════════════════════════════════════════════════════════════════
function AddProjectModal({ onClose, onCreated }: { onClose:()=>void; onCreated:()=>void }) {
  const [form, setForm]         = useState<NewProject>({...BLANK});
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof NewProject, v: NewProject[keyof NewProject]) =>
    setForm(f => ({...f, [k]:v}));

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => set("imagePreview", e.target?.result as string);
    reader.readAsDataURL(file);
    set("imageFile", file);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0]; if (file) handleFile(file);
  };

  const isValid = form.title && form.description && form.location && form.imageFile;

  const handleSubmit = async () => {
    if (!isValid || !form.imageFile) return;
    setSaving(true); setError("");
    const { error: err } = await createProject(
      { title:form.title, description:form.description, long_description:form.long_description,
        stream_url:form.stream_url, type:form.type, location:form.location,
        year:form.year, featured:form.featured, sort_order:Date.now() },
      form.imageFile
    );
    if (err) { setError(err); setSaving(false); return; }
    onCreated();
  };

  // ── Card Preview ────────────────────────────────────────────────────────────
  const CardPreview = () => (
    <div className="rounded-2xl overflow-hidden border"
      style={{ background:"hsl(222 20% 9%)", borderColor:"hsl(222 18% 15%)" }}>
      <div className="relative overflow-hidden" style={{ aspectRatio:"16/9", background:"hsl(222 18% 12%)" }}>
        {form.imagePreview
          ? <img src={form.imagePreview} alt="" className="w-full h-full object-cover"/>
          : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ color:"hsl(38 8% 30%)" }}>
              <ImageIcon size={24}/><span className="text-xs">Image preview</span>
            </div>
        }
        <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, transparent 50%, hsl(222 20% 9%/0.85))" }}/>
        {form.featured && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)" }}>
            <Sparkles size={8}/> Featured
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px]"
          style={{ background:"hsl(222 20% 9%/0.8)", color:"hsl(38 8% 55%)", border:"1px solid hsl(222 18% 22%)" }}>
          {form.type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-light mb-1 leading-tight"
          style={{ fontFamily:"var(--font-display)", fontSize:"1.05rem", color:"hsl(38 15% 88%)" }}>
          {form.title || <span style={{ color:"hsl(38 8% 30%)" }}>Project title…</span>}
        </h3>
        <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color:"hsl(38 8% 48%)" }}>
          {form.description || <span style={{ color:"hsl(38 8% 28%)" }}>Short description…</span>}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px]" style={{ color:"hsl(38 8% 38%)" }}>
            <span className="flex items-center gap-1"><MapPin size={9}/>{form.location||"Location"}</span>
            <span>{form.year}</span>
          </div>
          <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
            style={{ background:"hsl(38 65% 58%/0.08)", color:"hsl(38 55% 58%)", border:"1px solid hsl(38 50% 40%/0.2)" }}>
            View <ArrowRight size={9}/>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="absolute inset-0" style={{ background:"hsl(222 24% 3%/0.85)", backdropFilter:"blur(8px)" }}
        onClick={onClose}/>

      {/* Wide panel: form on left, preview on right */}
      <motion.div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border"
        style={{ background:"hsl(222 22% 7%)", borderColor:"hsl(222 18% 14%)", boxShadow:"0 32px 80px hsl(222 24% 2%/0.7)" }}
        initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:12, scale:0.97 }} transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0 z-10"
          style={{ borderColor:"hsl(222 18% 12%)", background:"hsl(222 22% 7%)" }}>
          <div>
            <h2 className="text-lg font-light" style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 88%)" }}>
              Add New Project
            </h2>
            <p className="text-xs mt-0.5" style={{ color:"hsl(38 8% 44%)" }}>
              Publishes instantly — no redeploy needed
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ color:"hsl(38 8% 40%)" }}>
            <X size={16}/>
          </button>
        </div>

        {/* Two-column body */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-0">

          {/* LEFT — form */}
          <div className="p-6 space-y-5 border-r" style={{ borderColor:"hsl(222 18% 12%)" }}>

            {/* Image drop */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color:"hsl(38 8% 44%)" }}>Thumbnail Image *</label>
              <div
                className="rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden"
                style={{
                  borderColor: dragging ? "hsl(38 65% 58%)" : "hsl(222 18% 18%)",
                  background: dragging ? "hsl(38 65% 58%/0.05)" : "hsl(222 18% 6%)",
                }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f); }}/>
                {form.imagePreview ? (
                  <div className="relative h-36">
                    <img src={form.imagePreview} alt="" className="w-full h-full object-cover"/>
                    <button className="absolute top-2 right-2 p-1.5 rounded-lg z-10"
                      style={{ background:"hsl(0 50% 40%/0.8)", color:"white" }}
                      onClick={e => { e.stopPropagation(); set("imageFile",null); set("imagePreview",""); }}>
                      <Trash2 size={11}/>
                    </button>
                    <div className="absolute bottom-0 inset-x-0 py-1 px-3 text-[11px]"
                      style={{ background:"hsl(222 22% 8%/0.9)", color:"hsl(142 55% 55%)" }}>
                      ✓ Ready to upload
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-7"
                    style={{ color: dragging ? "hsl(38 65% 58%)" : "hsl(38 8% 35%)" }}>
                    <ImageIcon size={24}/><span className="text-sm font-medium">Drop image or click to browse</span>
                    <span className="text-xs" style={{ color:"hsl(38 8% 28%)" }}>JPG · PNG · WEBP</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fields */}
            <IField label="Project Name *" icon={<Tag size={11}/>}>
              <input type="text" placeholder="e.g. Zenith Tower" value={form.title}
                onChange={e => set("title",e.target.value)} {...inp}/>
            </IField>
            <IField label="Short Description *" hint="One line on the card">
              <input type="text" placeholder="e.g. 48-floor luxury residential tower…"
                value={form.description} onChange={e => set("description",e.target.value)} {...inp}/>
            </IField>
            <IField label="Full Description" hint="Shown in launch modal">
              <textarea placeholder="Walk visitors through the experience…"
                value={form.long_description} onChange={e => set("long_description",e.target.value)}
                rows={2} {...inp} style={{...inp.style, resize:"vertical"}}/>
            </IField>
            <div className="grid grid-cols-2 gap-3">
              <IField label="Location *" icon={<MapPin size={11}/>}>
                <input type="text" placeholder="Dubai, UAE" value={form.location}
                  onChange={e => set("location",e.target.value)} {...inp}/>
              </IField>
              <IField label="Year">
                <input type="text" placeholder="2025" value={form.year}
                  onChange={e => set("year",e.target.value)} {...inp}/>
              </IField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IField label="Type">
                <select value={form.type} onChange={e => set("type",e.target.value as ProjectType)} {...inp}>
                  {["Residential","Commercial","Mixed-Use","Hospitality","Cultural"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </IField>
              <IField label="Featured">
                <div className="flex items-center gap-3 h-[38px]">
                  <button onClick={() => set("featured",!form.featured)}
                    className="relative w-10 h-[22px] rounded-full transition-all"
                    style={{ background: form.featured ? "hsl(38 65% 58%)" : "hsl(222 18% 18%)" }}>
                    <span className="absolute top-[3px] w-4 h-4 rounded-full transition-all bg-white"
                      style={{ left: form.featured ? "calc(100% - 19px)" : "3px" }}/>
                  </button>
                  <span className="text-xs" style={{ color:"hsl(38 8% 50%)" }}>
                    {form.featured ? "Yes — badge shown" : "No"}
                  </span>
                </div>
              </IField>
            </div>
            <IField label="🔒 Vagon Stream URL" hint="Admin-only" icon={<Link2 size={11}/>}>
              <input type="url" placeholder="https://streams.vagon.io/streams/…"
                value={form.stream_url} onChange={e => set("stream_url",e.target.value)} {...inp}/>
            </IField>

            <AnimatePresence>
              {error && (
                <motion.div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                  style={{ background:"hsl(0 50% 40%/0.1)", border:"1px solid hsl(0 50% 40%/0.25)", color:"hsl(0 65% 62%)" }}
                  initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5"/><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button onClick={handleSubmit} disabled={!isValid||saving}
              className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)", boxShadow:"0 6px 24px hsl(38 65% 40%/0.2)" }}
              whileHover={isValid&&!saving ? { y:-1 } : {}} whileTap={isValid&&!saving ? { scale:0.98 } : {}}>
              {saving
                ? <><div className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor:"hsl(222 24% 20%)", borderTopColor:"hsl(222 24% 5%)" }}/> Uploading…</>
                : <><Sparkles size={14}/> Publish Project</>}
            </motion.button>
            {!isValid && (
              <p className="text-center text-xs" style={{ color:"hsl(38 8% 38%)" }}>
                Image, Name, Description and Location are required
              </p>
            )}
          </div>

          {/* RIGHT — live card preview */}
          <div className="p-6">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color:"hsl(38 8% 36%)" }}>
              Live Preview
            </p>
            <CardPreview/>
            {form.title && (
              <p className="text-[11px] mt-3 text-center" style={{ color:"hsl(38 8% 35%)" }}>
                ID: <span style={{ color:"hsl(38 45% 48%)" }}>
                  {form.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
                </span>
              </p>
            )}
            <div className="mt-4 rounded-xl p-3 text-xs space-y-1" style={{ background:"hsl(222 18% 11%)", color:"hsl(38 8% 42%)" }}>
              <p className="font-medium" style={{ color:"hsl(38 8% 55%)" }}>What gets published:</p>
              <p>{form.imageFile ? "✓" : "○"} Thumbnail image</p>
              <p>{form.title ? "✓" : "○"} Project card</p>
              <p>{form.stream_url ? "✓" : "○"} Vagon stream URL</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DELETE CONFIRM MODAL
// ══════════════════════════════════════════════════════════════════════════════
function DeleteConfirmModal({ project, onConfirm, onCancel, loading }: {
  project: Project; onConfirm:()=>void; onCancel:()=>void; loading:boolean;
}) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="absolute inset-0"
        style={{ background:"hsl(222 24% 3%/0.85)", backdropFilter:"blur(8px)" }} onClick={onCancel}/>
      <motion.div className="relative w-full max-w-sm rounded-2xl border p-6"
        style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(0 50% 40%/0.3)", boxShadow:"0 24px 60px hsl(222 24% 2%/0.7)" }}
        initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
        transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background:"hsl(0 50% 40%/0.15)", border:"1px solid hsl(0 50% 40%/0.3)" }}>
            <AlertTriangle size={18} style={{ color:"hsl(0 65% 62%)" }}/>
          </div>
          <div>
            <h3 className="font-medium" style={{ color:"hsl(38 15% 88%)" }}>Delete Project?</h3>
            <p className="text-xs mt-0.5" style={{ color:"hsl(38 8% 44%)" }}>This cannot be undone</p>
          </div>
        </div>
        <div className="rounded-xl p-3 mb-5" style={{ background:"hsl(222 18% 11%)", border:"1px solid hsl(222 18% 15%)" }}>
          <p className="text-sm font-medium mb-0.5" style={{ color:"hsl(38 12% 75%)" }}>{project?.title}</p>
          <p className="text-xs" style={{ color:"hsl(38 8% 45%)" }}>{project?.location} · {project?.year}</p>
        </div>
        <p className="text-xs mb-5" style={{ color:"hsl(38 8% 44%)" }}>
          Permanently deletes the project card and its thumbnail image from your site.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm border"
            style={{ borderColor:"hsl(222 18% 18%)", color:"hsl(38 8% 55%)" }}>Keep It</button>
          <motion.button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background:"hsl(0 60% 45%)", color:"white", boxShadow:"0 4px 14px hsl(0 60% 30%/0.3)" }}
            whileHover={{ background:"hsl(0 65% 50%)" }} whileTap={{ scale:0.97 }}>
            {loading
              ? <div className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"white" }}/>
              : <><Trash2 size={13}/> Yes, Delete</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  EMAIL TAB  — Resend integration
// ══════════════════════════════════════════════════════════════════════════════
function EmailTab({ visitors }: { visitors: Visitor[] }) {
  const [subject, setSubject]     = useState("Thank you for your interest in {{project}}");
  const [body, setBody]           = useState(
`Hi {{name}},

Thank you for exploring {{project}} through our interactive platform.

We'd love to discuss how we can bring your vision to life with the same level of detail and immersion.

Feel free to reply to this email or reach us at your convenience.

Warm regards,
The ArchViz Studio Team`);
  const [target, setTarget]       = useState<"all"|"project">("all");
  const [selProject, setSelProject] = useState("");
  const [sending, setSending]     = useState(false);
  const [result, setResult]       = useState<{sent:number; failed:number} | null>(null);
  const [preview, setPreview]     = useState(false);

  const projects = Array.from(new Set(visitors.map(v => v.project)));
  const recipients = target==="all" ? visitors
    : visitors.filter(v => v.project===selProject);

  const interpolate = (template: string, v: Visitor) =>
    template.replace(/\{\{name\}\}/g, v.name).replace(/\{\{project\}\}/g, v.project);

  const sendEmails = async () => {
    if (!recipients.length) return;
    setSending(true); setResult(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, subject, body }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ sent: 0, failed: recipients.length });
    }
    setSending(false);
  };

  const sampleVisitor = recipients[0] ?? { name: "Alex", project: "Sample Project", email:"", contact:"", id:"", project_id:"", timestamp:"" };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
      className="max-w-3xl">

      {/* Setup notice */}
      <div className="rounded-2xl border p-5 mb-6"
        style={{ background:"hsl(210 70% 60%/0.06)", borderColor:"hsl(210 70% 60%/0.2)" }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:"hsl(210 70% 60%/0.15)", border:"1px solid hsl(210 70% 60%/0.3)" }}>
            <Mail size={14} style={{ color:"hsl(210 70% 65%)" }}/>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color:"hsl(210 70% 70%)" }}>
              Powered by Resend — free tier, no credit card
            </p>
            <p className="text-xs leading-relaxed" style={{ color:"hsl(38 8% 48%)" }}>
              3,000 emails/month free. Add{" "}
              <code className="px-1 py-0.5 rounded text-[11px]"
                style={{ background:"hsl(222 18% 13%)", color:"hsl(38 55% 60%)" }}>RESEND_API_KEY</code>
              {" "}to your Vercel environment variables.{" "}
              <a href="https://resend.com" target="_blank" className="underline" style={{ color:"hsl(210 70% 65%)" }}>
                Get free key at resend.com →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Recipient selector */}
      <div className="rounded-2xl border p-5 mb-4"
        style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color:"hsl(38 8% 44%)" }}>
          Send To
        </p>
        <div className="flex gap-3 mb-4">
          {(["all","project"] as const).map(opt => (
            <button key={opt} onClick={() => setTarget(opt)}
              className="px-4 py-2 rounded-xl text-sm border transition-all"
              style={{
                background: target===opt ? "hsl(38 65% 58%/0.1)" : "transparent",
                borderColor: target===opt ? "hsl(38 50% 40%)" : "hsl(222 18% 18%)",
                color: target===opt ? "hsl(38 65% 62%)" : "hsl(38 8% 50%)",
              }}>
              {opt==="all" ? `All visitors (${visitors.length})` : "Specific project"}
            </button>
          ))}
        </div>
        {target==="project" && (
          <select value={selProject} onChange={e => setSelProject(e.target.value)} {...inp}>
            <option value="">Select a project…</option>
            {projects.map(p => (
              <option key={p} value={p}>{p} ({visitors.filter(v => v.project===p).length} visitors)</option>
            ))}
          </select>
        )}
        {recipients.length>0 && (
          <p className="text-xs mt-3" style={{ color:"hsl(142 55% 50%)" }}>
            ✓ {recipients.length} recipient{recipients.length!==1?"s":""} selected
          </p>
        )}
      </div>

      {/* Subject + body */}
      <div className="rounded-2xl border p-5 mb-4 space-y-4"
        style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
        <IField label="Subject line">
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} {...inp}/>
        </IField>
        <IField label="Email body">
          <textarea value={body} onChange={e => setBody(e.target.value)}
            rows={10} {...inp} style={{...inp.style, resize:"vertical", fontFamily:"monospace", fontSize:"13px"}}/>
        </IField>
        <p className="text-xs" style={{ color:"hsl(38 8% 38%)" }}>
          Use <code style={{ color:"hsl(38 55% 55%)" }}>{"{{name}}"}</code> and{" "}
          <code style={{ color:"hsl(38 55% 55%)" }}>{"{{project}}"}</code> — replaced per recipient.
        </p>
      </div>

      {/* Preview + Send */}
      <div className="flex gap-3 mb-4">
        <button onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border"
          style={{ borderColor:"hsl(222 18% 18%)", color:"hsl(38 8% 55%)" }}>
          <Eye size={13}/> {preview ? "Hide" : "Preview"}
        </button>
        <motion.button onClick={sendEmails}
          disabled={sending || !recipients.length || (target==="project" && !selProject)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)", boxShadow:"0 4px 16px hsl(38 65% 40%/0.2)" }}
          whileHover={{ y:-1 }} whileTap={{ scale:0.98 }}>
          {sending
            ? <><div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor:"hsl(222 24% 20%)", borderTopColor:"hsl(222 24% 5%)" }}/> Sending…</>
            : <><Send size={13}/> Send to {recipients.length} recipient{recipients.length!==1?"s":""}</>}
        </motion.button>
      </div>

      {/* Preview panel */}
      <AnimatePresence>
        {preview && (
          <motion.div className="rounded-2xl border p-5 mb-4"
            style={{ background:"hsl(222 18% 6%)", borderColor:"hsl(222 18% 13%)" }}
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color:"hsl(38 8% 44%)" }}>
              Preview — as {sampleVisitor.name} would see it
            </p>
            <p className="text-xs mb-3" style={{ color:"hsl(38 8% 50%)" }}>
              <span style={{ color:"hsl(38 8% 38%)" }}>Subject: </span>
              {interpolate(subject, sampleVisitor)}
            </p>
            <hr style={{ borderColor:"hsl(222 18% 15%)" }}/>
            <pre className="text-sm mt-3 leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily:"var(--font-body)", color:"hsl(38 10% 72%)" }}>
              {interpolate(body, sampleVisitor)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div className="rounded-2xl border p-4 flex items-center gap-3"
            style={{
              background: result.failed===0 ? "hsl(142 55% 50%/0.08)" : "hsl(38 65% 58%/0.08)",
              borderColor: result.failed===0 ? "hsl(142 55% 50%/0.25)" : "hsl(38 65% 58%/0.25)",
            }}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {result.failed===0
              ? <CheckCircle2 size={18} style={{ color:"hsl(142 55% 55%)" }}/>
              : <AlertTriangle size={18} style={{ color:"hsl(38 65% 58%)" }}/>}
            <div>
              <p className="text-sm font-medium" style={{ color:"hsl(38 15% 82%)" }}>
                {result.failed===0
                  ? `✓ ${result.sent} email${result.sent!==1?"s":""} sent successfully`
                  : `${result.sent} sent · ${result.failed} failed`}
              </p>
              {result.failed>0 && (
                <p className="text-xs mt-0.5" style={{ color:"hsl(38 8% 48%)" }}>
                  Check your RESEND_API_KEY env var and that your sending domain is verified in Resend.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Field wrapper ────────────────────────────────────────────────────────────
function IField({ label, hint, icon, children }: {
  label?:string; hint?:string; icon?:React.ReactNode; children:React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <div className="flex items-center gap-1.5 mb-1.5">
          {icon && <span style={{ color:"hsl(38 8% 40%)" }}>{icon}</span>}
          <span className="text-xs font-medium" style={{ color:"hsl(38 8% 50%)" }}>{label}</span>
          {hint && <span className="text-[10px] ml-1" style={{ color:"hsl(38 8% 35%)" }}>— {hint}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
