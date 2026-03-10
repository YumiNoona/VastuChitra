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
  Image as ImageIcon, Link2, MapPin, Tag, Check, Copy, Trash2,
  ArrowRight, Sparkles, Plus, AlertTriangle, X, RefreshCw,
} from "lucide-react";

const ADMIN_PASSWORD = "archviz2025";

// ── Types ──────────────────────────────────────────────────────────────────
interface Visitor {
  id: string; name: string; email: string; contact: string;
  project: string; project_id: string; timestamp: string;
}
interface Stats {
  total: number; unique: number; recent7: number;
  byProject: { project: string; count: number }[];
}
type Tab = "overview" | "visitors" | "projects";

interface NewProject {
  title: string; description: string; long_description: string;
  stream_url: string; type: ProjectType; location: string;
  year: string; featured: boolean; sort_order: number;
  imageFile: File | null; imagePreview: string;
}

const BLANK: NewProject = {
  title: "", description: "", long_description: "",
  stream_url: "", type: "Residential", location: "",
  year: new Date().getFullYear().toString(),
  featured: false, sort_order: 0,
  imageFile: null, imagePreview: "",
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

  const handleLogin  = (pass: string) => {
    if (pass === ADMIN_PASSWORD) { sessionStorage.setItem("av_admin","1"); setAuthed(true); return true; }
    return false;
  };
  const handleLogout = () => { sessionStorage.removeItem("av_admin"); setAuthed(false); };

  if (!checked) return null;
  return authed ? <Dashboard onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} />;
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (p: string) => boolean }) {
  const [pass, setPass]       = useState("");
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    setTimeout(() => { if (!onLogin(pass)) setError("Incorrect password."); setLoading(false); }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(222 24% 5%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(38 65% 50%/0.07) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>
      <motion.div className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
        <div className="text-center mb-10">
          <div className="w-11 h-11 rounded-xl border mx-auto mb-4 flex items-center justify-center"
            style={{ borderColor: "hsl(38 50% 35%/0.4)", background: "hsl(38 65% 58%/0.07)" }}>
            <Lock size={16} style={{ color: "hsl(38 65% 60%)" }} />
          </div>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily: "var(--font-display)", color: "hsl(38 15% 88%)" }}>
            Admin Access
          </h1>
          <p className="text-xs" style={{ color: "hsl(38 8% 44%)" }}>Interactive ArchViz Studio</p>
        </div>
        <div className="rounded-2xl border p-8" style={{ background: "hsl(222 22% 8%)", borderColor: "hsl(222 18% 13%)" }}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(38 8% 50%)" }}>Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} placeholder="••••••••" value={pass}
                  onChange={e => { setPass(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none"
                  style={{ background: "hsl(222 22% 6%)", border: "1px solid hsl(222 18% 15%)", color: "hsl(38 15% 85%)" }}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = "hsl(38 50% 40%)"}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = "hsl(222 18% 15%)"}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "hsl(38 8% 40%)" }}>
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p className="text-xs rounded-lg px-3 py-2"
                  style={{ color: "hsl(0 65% 60%)", background: "hsl(0 50% 40%/0.1)", border: "1px solid hsl(0 50% 40%/0.2)" }}
                  initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button onClick={submit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: "hsl(38 65% 58%)", color: "hsl(222 24% 5%)", boxShadow: "0 6px 24px hsl(38 65% 40%/0.25)" }}
              whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}>
              {loading ? <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: "hsl(222 24% 20%)", borderTopColor: "hsl(222 24% 5%)" }} /> : "Sign In"}
            </motion.button>
          </div>
          <p className="text-center text-[11px] mt-5" style={{ color: "hsl(38 8% 36%)" }}>
            <a href="/" style={{ color: "hsl(38 40% 50%)" }}>← Back to website</a>
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
    a.download = `visitors-${Date.now()}.csv`;
    a.click();
  };

  const fmt = (ts: string) =>
    new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

  const tabs: {id:Tab; label:string; icon:React.ReactNode}[] = [
    { id:"overview",  label:"Overview",  icon:<LayoutGrid size={15}/> },
    { id:"visitors",  label:"Visitors",  icon:<Users size={15}/> },
    { id:"projects",  label:"Projects",  icon:<FolderPlus size={15}/> },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"hsl(222 24% 5%)" }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor:"hsl(38 30% 25%)", borderTopColor:"hsl(38 65% 58%)" }} />
    </div>
  );

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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left"
              style={{
                background: activeTab===id ? "hsl(38 65% 58%/0.1)" : "transparent",
                color: activeTab===id ? "hsl(38 65% 62%)" : "hsl(38 8% 48%)",
                borderLeft: activeTab===id ? "2px solid hsl(38 65% 58%)" : "2px solid transparent",
              }}>
              {icon} {label}
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
            <h1 className="text-2xl font-light"
              style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 88%)" }}>
              {activeTab==="overview" ? "Overview" : activeTab==="visitors" ? "Visitor Log" : "Projects"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color:"hsl(38 8% 44%)" }}>
              {activeTab==="overview" ? "Performance at a glance"
                : activeTab==="visitors" ? `${visitors.length} total submissions`
                : "Add, view and delete projects — live, no redeploy needed"}
            </p>
          </div>
          {activeTab==="visitors" && (
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border"
              style={{ borderColor:"hsl(222 18% 16%)", color:"hsl(38 8% 55%)" }}>
              <Download size={13}/> Export CSV
            </button>
          )}
        </div>

        {activeTab==="overview" && stats && <OverviewTab stats={stats}/>}
        {activeTab==="visitors" && <VisitorsTab filtered={filtered} search={search} setSearch={setSearch} fmt={fmt}/>}
        {activeTab==="projects" && <ProjectsTab/>}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ stats }: { stats: Stats }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {([
          { label:"Total Visitors",  value:stats.total,            icon:Users,      color:"38 65% 58%"  },
          { label:"Unique Visitors", value:stats.unique,           icon:Eye,        color:"142 55% 50%" },
          { label:"This Week",       value:stats.recent7,          icon:TrendingUp, color:"210 70% 60%" },
          { label:"Projects",        value:stats.byProject.length, icon:Calendar,   color:"290 55% 62%" },
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
      <div className="rounded-2xl border p-6"
        style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
        <h2 className="text-base font-light mb-5"
          style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 82%)" }}>Visits by Project</h2>
        <div className="space-y-4">
          {stats.byProject.map(({project,count}) => {
            const pct = stats.total > 0 ? Math.round((count/stats.total)*100) : 0;
            return (
              <div key={project}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm" style={{ color:"hsl(38 10% 65%)" }}>{project}</span>
                  <span className="text-xs" style={{ color:"hsl(38 8% 44%)" }}>{count} · {pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"hsl(222 18% 13%)" }}>
                  <motion.div className="h-full rounded-full" style={{ background:"hsl(38 65% 58%)" }}
                    initial={{ width:0 }} animate={{ width:`${pct}%` }}
                    transition={{ duration:0.8, delay:0.2, ease:[0.16,1,0.3,1] }}/>
                </div>
              </div>
            );
          })}
          {stats.byProject.length===0 && (
            <p className="text-sm text-center py-6" style={{ color:"hsl(38 8% 38%)" }}>No data yet</p>
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
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color:"hsl(38 8% 40%)" }}/>
        <input type="text" placeholder="Search by name, email or project…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background:"hsl(222 22% 8%)", border:"1px solid hsl(222 18% 13%)", color:"hsl(38 15% 80%)" }}
          onFocus={(e:React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor="hsl(38 40% 35%)"}
          onBlur={(e:React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor="hsl(222 18% 13%)"}
        />
      </div>
      <div className="rounded-2xl border overflow-hidden"
        style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(222 18% 13%)" }}>
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
              <tr><td colSpan={5} className="text-center py-12 text-sm" style={{ color:"hsl(38 8% 38%)" }}>
                {search ? "No matching results" : "No visitors yet"}
              </td></tr>
            ) : filtered.map((v,i) => (
              <motion.tr key={v.id}
                style={{ borderBottom:"1px solid hsl(222 18% 11%)" }}
                initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:i*0.03 }}
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
//  PROJECTS TAB  — list + add + delete
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsTab() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
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

  const handleCreated = async () => {
    setShowForm(false);
    await reload();
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color:"hsl(38 8% 44%)" }}>
            {projects.length} project{projects.length!==1?"s":""} live on site
          </span>
          <button onClick={() => setRefreshKey(k => k+1)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color:"hsl(38 8% 40%)" }} title="Refresh">
            <RefreshCw size={13}/>
          </button>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)", boxShadow:"0 4px 16px hsl(38 65% 40%/0.25)" }}
          whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}>
          <Plus size={14}/> Add Project
        </motion.button>
      </div>

      {/* Project list */}
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
                exit={{ opacity:0, scale:0.96 }}
                transition={{ delay:i*0.04, duration:0.35 }}
                layout>

                {/* Thumbnail */}
                <div className="w-24 flex-shrink-0 relative overflow-hidden"
                  style={{ background:"hsl(222 18% 12%)" }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover"/>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ color:"hsl(38 8% 28%)" }}>
                      <ImageIcon size={22}/>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate"
                        style={{ color:"hsl(38 15% 85%)" }}>{p.title}</h3>
                      {p.featured && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background:"hsl(38 65% 58%/0.12)", color:"hsl(38 65% 60%)", border:"1px solid hsl(38 50% 40%/0.2)" }}>
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate mb-2" style={{ color:"hsl(38 8% 48%)" }}>
                      {p.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px]" style={{ color:"hsl(38 8% 38%)" }}>
                      <span className="flex items-center gap-1"><MapPin size={9}/>{p.location}</span>
                      <span>{p.year}</span>
                      <span className="px-1.5 py-0.5 rounded"
                        style={{ background:"hsl(222 18% 13%)", color:"hsl(38 8% 50%)" }}>{p.type}</span>
                    </div>
                  </div>

                  {/* Stream URL indicator */}
                  <div className="flex-shrink-0 flex items-center gap-1.5 text-[11px]"
                    style={{ color: p.stream_url && !p.stream_url.includes("REPLACE_ME") ? "hsl(142 55% 50%)" : "hsl(38 8% 35%)" }}>
                    <Link2 size={11}/>
                    {p.stream_url && !p.stream_url.includes("REPLACE_ME") ? "Stream ready" : "No stream URL"}
                  </div>

                  {/* Delete button */}
                  <motion.button
                    onClick={() => setDeleteId(p.id)}
                    className="flex-shrink-0 p-2 rounded-xl transition-colors"
                    style={{ color:"hsl(0 55% 55%/0.6)" }}
                    whileHover={{ color:"hsl(0 65% 62%)", background:"hsl(0 50% 40%/0.1)" }}
                    whileTap={{ scale:0.93 }}>
                    <Trash2 size={15}/>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Project modal */}
      <AnimatePresence>
        {showForm && (
          <AddProjectModal onClose={() => setShowForm(false)} onCreated={handleCreated}/>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteId && (
          <DeleteConfirmModal
            project={projects.find(p => p.id===deleteId)!}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ADD PROJECT MODAL
// ══════════════════════════════════════════════════════════════════════════════
function AddProjectModal({ onClose, onCreated }: { onClose:()=>void; onCreated:()=>void }) {
  const [form, setForm]       = useState<NewProject>({...BLANK});
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
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
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isValid = form.title && form.description && form.location && form.imageFile;

  const handleSubmit = async () => {
    if (!isValid || !form.imageFile) return;
    setSaving(true); setError("");
    const { error: err } = await createProject(
      {
        title: form.title,
        description: form.description,
        long_description: form.long_description,
        stream_url: form.stream_url,
        type: form.type,
        location: form.location,
        year: form.year,
        featured: form.featured,
        sort_order: Date.now(),
      },
      form.imageFile
    );
    if (err) { setError(err); setSaving(false); return; }
    onCreated();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      {/* Backdrop */}
      <motion.div className="absolute inset-0" style={{ background:"hsl(222 24% 3%/0.85)", backdropFilter:"blur(8px)" }}
        onClick={onClose}/>

      {/* Panel */}
      <motion.div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ background:"hsl(222 22% 7%)", borderColor:"hsl(222 18% 14%)", boxShadow:"0 32px 80px hsl(222 24% 2%/0.7)" }}
        initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:12, scale:0.97 }}
        transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor:"hsl(222 18% 12%)" }}>
          <div>
            <h2 className="text-lg font-light" style={{ fontFamily:"var(--font-display)", color:"hsl(38 15% 88%)" }}>
              Add New Project
            </h2>
            <p className="text-xs mt-0.5" style={{ color:"hsl(38 8% 44%)" }}>
              Publishes instantly — no redeploy required
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl"
            style={{ color:"hsl(38 8% 40%)" }}>
            <X size={16}/>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

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
                <div className="relative h-44">
                  <img src={form.imagePreview} alt="" className="w-full h-full object-cover"/>
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-lg z-10"
                    style={{ background:"hsl(0 50% 40%/0.8)", color:"white" }}
                    onClick={e => { e.stopPropagation(); set("imageFile",null); set("imagePreview",""); }}>
                    <Trash2 size={12}/>
                  </button>
                  <div className="absolute bottom-0 inset-x-0 py-1.5 px-3 text-[11px]"
                    style={{ background:"hsl(222 22% 8%/0.9)", color:"hsl(38 55% 60%)" }}>
                    ✓ Image ready to upload
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-9"
                  style={{ color: dragging ? "hsl(38 65% 58%)" : "hsl(38 8% 35%)" }}>
                  <ImageIcon size={26}/>
                  <span className="text-sm font-medium">Drop image or click to browse</span>
                  <span className="text-xs" style={{ color:"hsl(38 8% 28%)" }}>JPG · PNG · WEBP</span>
                </div>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-4">
            <IField label="Project Name *" icon={<Tag size={11}/>}>
              <input type="text" placeholder="e.g. Zenith Tower" value={form.title}
                onChange={e => set("title",e.target.value)} {...inp}/>
            </IField>

            <IField label="Short Description *" hint="One line shown on the card">
              <input type="text" placeholder="e.g. 48-floor luxury residential tower with panoramic views"
                value={form.description} onChange={e => set("description",e.target.value)} {...inp}/>
            </IField>

            <IField label="Full Description" hint="Shown in the launch modal">
              <textarea placeholder="Walk visitors through the experience…"
                value={form.long_description} onChange={e => set("long_description",e.target.value)}
                rows={3} {...inp} style={{...inp.style, resize:"vertical"}}/>
            </IField>

            <div className="grid grid-cols-2 gap-4">
              <IField label="Location *" icon={<MapPin size={11}/>}>
                <input type="text" placeholder="Dubai, UAE" value={form.location}
                  onChange={e => set("location",e.target.value)} {...inp}/>
              </IField>
              <IField label="Year">
                <input type="text" placeholder="2025" value={form.year}
                  onChange={e => set("year",e.target.value)} {...inp}/>
              </IField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <IField label="Project Type">
                <select value={form.type} onChange={e => set("type",e.target.value as ProjectType)} {...inp}>
                  {["Residential","Commercial","Mixed-Use","Hospitality","Cultural"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </IField>
              <IField label="Featured Badge">
                <div className="flex items-center gap-3 h-[38px]">
                  <button onClick={() => set("featured",!form.featured)}
                    className="relative w-10 h-[22px] rounded-full transition-all"
                    style={{ background: form.featured ? "hsl(38 65% 58%)" : "hsl(222 18% 18%)" }}>
                    <span className="absolute top-[3px] w-4 h-4 rounded-full transition-all bg-white"
                      style={{ left: form.featured ? "calc(100% - 19px)" : "3px" }}/>
                  </button>
                  <span className="text-xs" style={{ color:"hsl(38 8% 50%)" }}>
                    {form.featured ? "Yes — shows badge" : "No"}
                  </span>
                </div>
              </IField>
            </div>

            {/* Vagon URL */}
            <IField label="🔒 Vagon Stream URL" hint="Admin-only · never shown to visitors"
              icon={<Link2 size={11}/>}>
              <input type="url" placeholder="https://streams.vagon.io/streams/…"
                value={form.stream_url} onChange={e => set("stream_url",e.target.value)} {...inp}/>
            </IField>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ background:"hsl(0 50% 40%/0.1)", border:"1px solid hsl(0 50% 40%/0.25)", color:"hsl(0 65% 62%)" }}
                initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5"/>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button onClick={handleSubmit} disabled={!isValid || saving}
            className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background:"hsl(38 65% 58%)", color:"hsl(222 24% 5%)", boxShadow:"0 6px 24px hsl(38 65% 40%/0.2)" }}
            whileHover={isValid&&!saving ? { y:-1 } : {}} whileTap={isValid&&!saving ? { scale:0.98 } : {}}>
            {saving ? (
              <><div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor:"hsl(222 24% 20%)", borderTopColor:"hsl(222 24% 5%)" }}/> Uploading…</>
            ) : (
              <><Sparkles size={14}/> Publish Project</>
            )}
          </motion.button>
          {!isValid && (
            <p className="text-center text-xs" style={{ color:"hsl(38 8% 38%)" }}>
              Image, Name, Description and Location are required
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DELETE CONFIRM MODAL
// ══════════════════════════════════════════════════════════════════════════════
function DeleteConfirmModal({ project, onConfirm, onCancel, loading }: {
  project: Project; onConfirm: ()=>void; onCancel: ()=>void; loading: boolean;
}) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="absolute inset-0"
        style={{ background:"hsl(222 24% 3%/0.85)", backdropFilter:"blur(8px)" }}
        onClick={onCancel}/>
      <motion.div className="relative w-full max-w-sm rounded-2xl border p-6"
        style={{ background:"hsl(222 22% 8%)", borderColor:"hsl(0 50% 40%/0.3)", boxShadow:"0 24px 60px hsl(222 24% 2%/0.7)" }}
        initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        exit={{ opacity:0, scale:0.95 }}
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

        <div className="rounded-xl p-3 mb-5"
          style={{ background:"hsl(222 18% 11%)", border:"1px solid hsl(222 18% 15%)" }}>
          <p className="text-sm font-medium mb-0.5" style={{ color:"hsl(38 12% 75%)" }}>{project?.title}</p>
          <p className="text-xs" style={{ color:"hsl(38 8% 45%)" }}>{project?.location} · {project?.year}</p>
        </div>

        <p className="text-xs mb-5" style={{ color:"hsl(38 8% 44%)" }}>
          This will permanently delete the project card and its thumbnail image from your site.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm border"
            style={{ borderColor:"hsl(222 18% 18%)", color:"hsl(38 8% 55%)" }}>
            Keep It
          </button>
          <motion.button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background:"hsl(0 60% 45%)", color:"white", boxShadow:"0 4px 14px hsl(0 60% 30%/0.3)" }}
            whileHover={{ background:"hsl(0 65% 50%)" }} whileTap={{ scale:0.97 }}>
            {loading ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"white" }}/>
            ) : (
              <><Trash2 size={13}/> Yes, Delete</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Shared input field wrapper ──────────────────────────────────────────────
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

// ── Shared input style ──────────────────────────────────────────────────────
const inp = {
  className: "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none",
  style: { background:"hsl(222 22% 6%)", border:"1px solid hsl(222 18% 15%)", color:"hsl(38 15% 82%)" } as React.CSSProperties,
  onFocus: (e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor="hsl(38 50% 40%)"),
  onBlur: (e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor="hsl(222 18% 15%)"),
};
