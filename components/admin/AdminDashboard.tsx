"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Eye, BarChart2, Download, LogOut,
  Search, ChevronDown, RefreshCw, ExternalLink,
  TrendingUp, Calendar, Layers, ArrowUpRight,
  Activity, Clock, Globe, ArrowRight, Settings,
  Type, Image as ImageIcon, Layout as LayoutIcon, Save, Mail,
  Link as LinkIcon, Plus, EyeOff
} from "lucide-react";
import { supabase, getProjects, getProjectToken, updateProject, type Project } from "@/lib/supabase";
import { haptic } from "ios-haptics";
import EditProjectModal from "./EditProjectModal";
import EmailTab from "./EmailTab";
import ThemeToggle from "../ThemeToggle";

interface Visitor {
  id: string; name: string; email: string;
  contact: string; project: string;
  project_id: string; timestamp: string;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [sortField, setSortField] = useState<"timestamp"|"name"|"project">("timestamp");
  const [sortDir, setSortDir] = useState<"desc"|"asc">("desc");
  const [tab, setTab] = useState<"overview"|"visitors"|"projects"|"email">("overview");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, pRes] = await Promise.all([
        supabase.from("visitors").select("*").order("timestamp", { ascending: false }),
        getProjects()
      ]);
      if (vRes.data) setVisitors(vRes.data);
      if (pRes) setProjects(pRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = visitors
    .filter((v) => {
      const q = search.toLowerCase();
      return (!q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.project.toLowerCase().includes(q))
        && (filterProject === "all" || v.project_id === filterProject);
    })
    .sort((a, b) => {
      const valA = (a as any)[sortField] || "";
      const valB = (b as any)[sortField] || "";
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const total = visitors.length;
  const unique = new Set(visitors.map(v => v.email)).size;
  const thisWeek = visitors.filter(v => new Date(v.timestamp) > new Date(Date.now() - 7 * 86400000)).length;
  const today = visitors.filter(v => new Date(v.timestamp).toDateString() === new Date().toDateString()).length;

  const projectStats = projects.map((p: Project) => ({
    ...p, count: visitors.filter(v => v.project_id === p.id).length,
  })).sort((a, b) => b.count - a.count);

  const exportCSV = () => {
    const rows = [["Name","Email","Contact","Project","Date"],
      ...filtered.map(v => [v.name, v.email, v.contact, v.project, new Date(v.timestamp).toLocaleDateString()])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `visitors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const toggleSort = (f: typeof sortField) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("desc"); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className="w-64 border-r border-border flex flex-col fixed inset-y-0 left-0 z-40 bg-background/50 backdrop-blur-xl">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="dark:hidden h-8 w-auto" />
            <img src="/dlogo.png" alt="Logo" className="hidden dark:block h-8 w-auto" />
            <div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-vastu-green animate-pulse" />
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Admin</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "visitors", label: "Visitors", icon: Users },
            { id: "projects", label: "Projects", icon: Layers },
            { id: "email", label: "Campaigns", icon: Mail },
          ].map(({ id, label, icon: Icon }) => (
            <button 
              key={id} 
              onClick={() => { haptic(); setTab(id as any); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-medium transition-all ${
                tab === id 
                ? "bg-foreground text-background shadow-lg shadow-foreground/10" 
                : "text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              <Icon size={16} className={tab === id ? "text-vastu-green" : ""} />
              {label}
              {id === "visitors" && total > 0 && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-muted-foreground font-mono">
                  {total}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border mt-auto space-y-2">
           <div className="flex items-center justify-between px-3 py-2">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Appearance</span>
             <ThemeToggle />
           </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────── */}
      <main className="flex-1 ml-64 min-h-screen relative flex flex-col">
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-10 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tighter capitalize">
              {tab}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-light tracking-wide uppercase">
              {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-border text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Data
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 pb-20"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Visits", value: total, icon: Eye, trend: "+12.5%", color: "text-blue-400" },
                    { label: "Unique Users", value: unique, icon: Users, trend: "+5.2%", color: "text-vastu-green" },
                    { label: "Week Growth", value: thisWeek, icon: TrendingUp, trend: "+18%", color: "text-purple-400" },
                    { label: "Today", value: today, icon: Clock, trend: "+2", color: "text-orange-400" },
                  ].map(({ label, value, icon: Icon, trend, color }) => (
                    <motion.div 
                      key={label}
                      whileHover={{ y: -2 }}
                      className="bevel-card p-6 bg-secondary/20 rounded-3xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                        <div className={`p-2 rounded-xl bg-background border border-border ${color}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-medium tracking-tighter">
                          {loading ? "—" : value}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-background border border-border ${trend.startsWith('+') ? 'text-vastu-green' : 'text-red-400'}`}>
                          {trend}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bevel-card p-8 bg-secondary/20 rounded-3xl min-h-[400px]">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-xl font-medium tracking-tight">Project Traffic</h3>
                        <p className="text-sm text-muted-foreground font-light">Distribution of interest per project</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center text-muted-foreground opacity-50">
                        <BarChart2 size={20} />
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      {projectStats.slice(0, 5).map((p) => {
                        const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                        return (
                          <div key={p.id} className="group">
                            <div className="flex justify-between text-sm mb-3 font-medium">
                              <span className="group-hover:text-vastu-green transition-colors">{p.title}</span>
                              <span className="text-muted-foreground font-mono">{p.count} <span className="text-[10px] opacity-50 ml-1">({pct}%)</span></span>
                            </div>
                            <div className="h-2 w-full bg-secondary border border-border rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full bg-vastu-green rounded-full shadow-[0_0_12px_rgba(226,255,175,0.4)]"
                              />
                            </div>
                          </div>
                        );
                      })}
                      {total === 0 && !loading && <p className="text-center py-24 text-muted-foreground italic">No traffic data yet</p>}
                    </div>
                  </div>

                  <div className="bevel-card p-8 bg-secondary/20 rounded-3xl">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-xl font-medium tracking-tight">Recent Leads</h3>
                      <button className="text-[10px] uppercase font-bold tracking-widest text-vastu-green hover:underline" onClick={() => setTab("visitors")}>
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {visitors.slice(0, 8).map((v) => (
                        <div key={v.id} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center text-sm font-bold text-vastu-green">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate tracking-tight">{v.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-light mt-0.5 uppercase tracking-wide">Viewed {v.project}</p>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono opacity-50">
                            {new Date(v.timestamp).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      ))}
                      {visitors.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center opacity-30">
                          <Users size={40} className="mb-4" />
                          <p className="text-sm italic">Passive waiting area...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "visitors" && (
              <motion.div 
                key="visitors"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-vastu-green transition-colors" />
                    <input 
                      placeholder="Search across leads..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-vastu-green/20 focus:border-vastu-green/50 transition-all text-sm"
                    />
                  </div>
                  <select 
                    value={filterProject} 
                    onChange={e => setFilterProject(e.target.value)}
                    className="px-4 py-3.5 rounded-2xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-vastu-green/20"
                  >
                    <option value="all">Every Project</option>
                    {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                  <button 
                    onClick={exportCSV}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-black/20"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                <div className="bevel-card overflow-hidden rounded-3xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                          {[["Client Name","name"],["Contact Details",null],["Target Project","project"],["Interaction Date","timestamp"]].map(([label, field]) => (
                            <th 
                              key={label as string}
                              className={`text-left px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${field ? "cursor-pointer hover:text-foreground" : ""}`}
                              onClick={() => field && toggleSort(field as any)}
                            >
                              <div className="flex items-center gap-2">
                                {label as string}
                                {field && sortField === field && (
                                  <ChevronDown size={12} className={`transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          [...Array(6)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              {[...Array(4)].map((_, j) => (
                                <td key={j} className="px-8 py-6">
                                  <div className="h-4 bg-secondary rounded-xl w-2/3" />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : filtered.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-8 py-24 text-center">
                              <div className="text-muted-foreground italic flex flex-col items-center gap-4">
                                <Search size={32} className="opacity-10" />
                                <span className="text-sm font-light uppercase tracking-widest">No matching lead records</span>
                              </div>
                            </td>
                          </tr>
                        ) : filtered.map((v) => (
                          <tr key={v.id} className="hover:bg-secondary/30 transition-colors group">
                            <td className="px-8 py-6">
                              <span className="text-sm font-semibold block tracking-tight">{v.name}</span>
                              <span className="text-xs text-muted-foreground font-light">{v.email}</span>
                            </td>
                            <td className="px-8 py-6 text-sm font-mono text-muted-foreground">{v.contact}</td>
                            <td className="px-8 py-6">
                              <span className="text-[10px] font-bold px-3 py-1 bg-background border border-border rounded-full group-hover:border-vastu-green/30 transition-colors uppercase tracking-widest">
                                {v.project}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-sm font-medium">
                                {new Date(v.timestamp).toLocaleDateString("en-US", { day: "numeric", month: "long" })}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono opacity-50">
                                {new Date(v.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "projects" && (
              <motion.div 
                key="projects"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {projectStats.map((p) => (
                  <div key={p.id} className="bevel-card p-8 bg-secondary/20 rounded-[2rem] group hover:border-vastu-green/30 transition-all flex flex-col relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                       <button 
                         onClick={async () => {
                           haptic();
                           const token = await getProjectToken(p.id);
                           const url = `${window.location.origin}/p/${token}`;
                           navigator.clipboard.writeText(url);
                           alert("Secure share link copied!");
                         }}
                         className="p-2 rounded-xl bg-background border border-border text-muted-foreground hover:text-vastu-green transition-all"
                         title="Copy share link"
                       >
                         <LinkIcon size={14} />
                       </button>
                       <button
                         onClick={async () => {
                           haptic();
                           const token = await getProjectToken(p.id);
                           window.open(`${window.location.origin}/p/${token}`, "_blank");
                         }}
                         className="p-2 rounded-xl bg-background border border-border text-muted-foreground hover:text-vastu-green transition-all"
                         title="Open private page"
                       >
                         <ArrowUpRight size={14} />
                       </button>
                       <button 
                         onClick={() => {
                           haptic();
                           window.open(`${window.location.origin}/?project=${p.id}`, '_blank');
                         }}
                         className="p-2 rounded-xl bg-background border border-border text-muted-foreground hover:text-vastu-green transition-all"
                         title="Open Site"
                       >
                         <ExternalLink size={14} />
                       </button>
                    </div>

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold px-3 py-1.5 bg-background border border-border rounded-full inline-block uppercase tracking-widest text-muted-foreground">
                          {p.type}
                        </span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest self-start ${
                          p.status === 'published' ? 'bg-vastu-green/20 text-vastu-green' :
                          p.status === 'discarded' ? 'bg-red-500/20 text-red-400' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>
                          {p.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-medium mb-2 tracking-tight">{p.title}</h3>
                    <p className="text-sm text-muted-foreground font-light line-clamp-2 leading-relaxed mb-8">{p.description || "Experimental architectural visualization."}</p>
                    
                    <div className="flex flex-col gap-3 mt-auto">
                      <div className="flex items-center justify-between pt-6 border-t border-border">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <Globe size={14} className="opacity-50" />
                          {p.location}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-medium text-foreground tracking-tighter leading-none">{p.count}</div>
                          <div className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-widest text-center">Hits</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => { haptic(); setEditingProject(p); }}
                           className="flex-1 py-3 rounded-2xl bg-secondary border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-background transition-all"
                         >
                           Edit Details
                         </button>
                         <button 
                           onClick={async () => {
                             haptic();
                             await updateProject(p.id, { is_active: !p.is_active });
                             fetchData();
                           }}
                           className={`flex-1 py-3 rounded-2xl border border-border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                             p.is_active ? "bg-vastu-green/10 text-vastu-green hover:bg-vastu-green/20" : "bg-secondary text-muted-foreground hover:bg-background"
                           }`}
                         >
                           {p.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                           {p.is_active ? "Active" : "Hidden"}
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                   onClick={() => { haptic(); setEditingProject({} as any); }}
                   className="bevel-card p-8 bg-secondary/10 rounded-[2rem] border-dashed border-2 border-border/50 flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={24} className="text-vastu-green" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Add New Project</p>
                </button>
              </motion.div>
            )}

            {tab === ("blog" as any) && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <p className="text-muted-foreground">This tab has been moved to the Projects "Edit" modal.</p>
                 <button onClick={() => setTab("projects")} className="mt-4 text-vastu-green font-bold text-sm">Go to Projects</button>
              </div>
            )}

            {tab === "email" && (
              <motion.div 
                key="email"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <EmailTab visitors={visitors} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {editingProject && (
          <EditProjectModal 
            project={editingProject} 
            onClose={() => setEditingProject(null)} 
            onUpdate={() => { fetchData(); setEditingProject(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
