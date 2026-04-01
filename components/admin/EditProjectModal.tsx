"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Save, Loader2, Image as ImageIcon, Plus, Trash2, 
  Activity, Upload, Video, Settings, BookOpen, Type,
  Construction, ExternalLink
} from "lucide-react";
import { haptic } from "ios-haptics";
import { 
  updateProject, 
  getProjectBlog, 
  addSiteUpdate, 
  deleteSiteUpdate,
  deleteProject,
  type Project,
  type SiteUpdate,
  addYoutubeToGallery,
  updateProjectBlogOverview,
  setSiteUpdateThumbnail
} from "@/lib/supabase";

interface EditProjectModalProps {
  project?: Project; // Optional for creation mode
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProjectModal({ project, onClose, onUpdate }: EditProjectModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "content" | "updates">("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  
  const isNew = !project?.id;
  
  // General Fields
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [streamUrl, setStreamUrl] = useState(project?.stream_url || "");
  const [location, setLocation] = useState(project?.location || "");
  const [year, setYear] = useState(project?.year || "2024");
  const [type, setType] = useState<any>(project?.type || "Residential");
  const [accessType, setAccessType] = useState<any>(project?.access_type || "public");
  const [accessPassword, setAccessPassword] = useState(project?.access_password || "");
  
  // Image Uploads for New Projects
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [darkImage, setDarkImage] = useState<File | null>(null);
  const [lightImage, setLightImage] = useState<File | null>(null);
  
  
  // Blog Data
  const [blogData, setBlogData] = useState<any>(null);
  const [story, setStory] = useState("");
  const [hasLiveUpdates, setHasLiveUpdates] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    if (project?.id) loadBlogData();
  }, [project?.id]);

  async function loadBlogData() {
    if (!project?.id) return;
    setLoading(true);
    const data = await getProjectBlog(project.id);
    if (data) {
      setBlogData(data);
      setStory(data.long_description || "");
      setHasLiveUpdates(data.has_live_updates || false);
    }
    setLoading(false);
  }

  async function handleSaveGeneral() {
    setSaving("general");
    
    if (isNew) {
      if (!mainImage) {
        alert("Please select a main thumbnail image.");
        setSaving(null);
        return;
      }
      const { createProject } = await import("@/lib/supabase");
      const { error } = await createProject(
        { 
          title, description, stream_url: streamUrl, location, year, type, 
          featured: false, is_active: true, sort_order: 0, 
          access_type: accessType, access_password: accessPassword, 
          status: "published", // Force publish on save
          long_description: "",
          narrative_sections: [],
          gallery_updates: []
        },
        mainImage,
        darkImage,
        lightImage
      );
      if (error) alert(error);
      else {
        haptic.confirm();
        onUpdate();
        onClose();
      }
    } else {
      const { error } = await updateProject(project!.id, {
        title, description, stream_url: streamUrl, location, year, type,
        access_type: accessType, access_password: accessPassword,
        status: "published" // Force publish on save
      });
      if (!error) {
        haptic.confirm();
        onUpdate();
        // Removed alert, will rely on loading/success state instead.
      }
    }
    setSaving("success");
    setTimeout(() => {
      setSaving(null);
    }, 2000);
  }

  async function handleDelete() {
    if (isNew) return;
    if (!confirm("Are you sure you want to PERMANENTLY delete this project? This cannot be undone.")) return;
    setSaving("deleting");
    const { error } = await deleteProject(project!.id);
    setSaving(null);
    if (!error) {
      haptic.confirm();
      onUpdate();
      onClose();
    } else {
      alert(error);
    }
  }

  async function handleSaveOverview() {
    if (isNew) return;
    setSaving("overview");
    const { error } = await updateProjectBlogOverview(project!.id, {
      long_description: story, has_live_updates: hasLiveUpdates
    });
    setSaving(null);
    if (!error) {
      haptic.confirm();
      alert("Project narrative saved!");
    }
  }

  async function handleAddYoutube() {
    if (!youtubeUrl.trim() || !project?.id) return;
    setSaving("youtube");
    const { error } = await addYoutubeToGallery(project.id, youtubeUrl, blogData?.gallery_updates || []);
    setSaving(null);
    if (!error) {
      setYoutubeUrl("");
      haptic.confirm();
      loadBlogData();
    } else {
      alert(error);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl h-full max-h-[90vh] bg-background border border-border shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-tighter">{isNew ? "Add New Project" : "Edit Project"}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{isNew ? "Initialize a new vision" : project?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 py-4 border-b border-border flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: "general", label: "General", icon: Settings },
            { id: "content", label: "Story", icon: Type },
            { id: "updates", label: "Gallery", icon: Activity, disabled: isNew },
          ].map((t) => (
            <button
              key={t.id}
              disabled={t.disabled}
              onClick={() => { haptic(); setActiveTab(t.id as any); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"
              } ${t.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Project Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-vastu-green/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-vastu-green/20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Short Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-vastu-green/20 resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stream URL (Pixel Streaming)</label>
                    <input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-vastu-green/20" />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-xs outline-none">
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Mixed-Use</option>
                        <option>Hospitality</option>
                        <option>Cultural</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Year</label>
                      <input value={year} onChange={e => setYear(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-xs outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Access</label>
                      <select value={accessType} onChange={e => setAccessType(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-xs outline-none">
                        <option value="public">Public</option>
                        <option value="password">Password</option>
                        <option value="otp">OTP Code</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                      <input value={accessPassword} onChange={e => setAccessPassword(e.target.value)} disabled={accessType !== "password"} placeholder="••••••" className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-xs outline-none disabled:opacity-30" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-4 border-t border-border/30">Thumbnails</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Main Thumbnail</label>
                         <div className="relative group aspect-video bg-secondary/20 border border-border border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/30 transition-all">
                            {mainImage ? <img src={URL.createObjectURL(mainImage)} className="absolute inset-0 w-full h-full object-cover" /> 
                             : project?.image_url ? <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover" /> 
                             : <><ImageIcon size={24} className="text-muted-foreground/30" /><span className="text-[10px] font-bold text-muted-foreground/50">Select Image</span></>}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setMainImage(e.target.files?.[0] || null)} />
                         </div>
                      </div>
                      <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                         <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Dark Mode (Opt)</label>
                         <div className="relative group aspect-video bg-secondary/20 border border-border border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer">
                            {darkImage ? <img src={URL.createObjectURL(darkImage)} className="absolute inset-0 w-full h-full object-cover" /> 
                             : project?.image_url_dark ? <img src={project.image_url_dark} className="absolute inset-0 w-full h-full object-cover" /> 
                             : <ImageIcon size={20} className="text-muted-foreground/30" />}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setDarkImage(e.target.files?.[0] || null)} />
                         </div>
                      </div>
                      <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                         <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Light Mode (Opt)</label>
                         <div className="relative group aspect-video bg-secondary/20 border border-border border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer">
                            {lightImage ? <img src={URL.createObjectURL(lightImage)} className="absolute inset-0 w-full h-full object-cover" /> 
                             : project?.image_url_light ? <img src={project.image_url_light} className="absolute inset-0 w-full h-full object-cover" /> 
                             : <ImageIcon size={20} className="text-muted-foreground/30" />}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setLightImage(e.target.files?.[0] || null)} />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  {!isNew && (
                    <button onClick={handleDelete} disabled={!!saving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-400/10 text-[10px] font-bold uppercase tracking-widest transition-all">
                      {saving === "deleting" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Discard Project
                    </button>
                  )}
                  <div className="flex gap-4 ml-auto">
                    <button onClick={handleSaveGeneral} disabled={!!saving} className="btn-vercel h-12 px-10 text-xs font-bold uppercase tracking-widest flex items-center gap-2 min-w-[200px] justify-center">
                      {saving === "general" ? (
                         <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                      ) : saving === "success" ? (
                         <>Uploaded!</>
                      ) : (
                         <><Save size={14} /> {isNew ? "Create Project" : "Save Settings & Publish"}</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "content" && (
              <motion.div 
                key="content"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-vastu-green"><BookOpen size={18} /></div>
                    <h3 className="text-lg font-medium tracking-tight">Project Story Overview</h3>
                  </div>
                  <textarea value={story} onChange={e => setStory(e.target.value)} rows={6} className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-vastu-green/20 resize-none font-light leading-relaxed" placeholder="Write the narrative for this project..." />
                  <div className="flex items-center justify-between">
                    <button onClick={() => setHasLiveUpdates(!hasLiveUpdates)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${hasLiveUpdates ? "border-vastu-green/30 bg-vastu-green/5 text-vastu-green" : "border-border text-muted-foreground"}`}><span className={`w-1.5 h-1.5 rounded-full ${hasLiveUpdates ? "bg-vastu-green animate-pulse" : "bg-muted-foreground/30"}`} />{hasLiveUpdates ? "Gallery Enabled" : "Gallery Disabled"}</button>
                    <button onClick={handleSaveOverview} disabled={!!saving} className="btn-vercel h-10 px-8 text-xs font-bold uppercase tracking-widest flex items-center gap-2">{saving === "overview" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save Narrative</button>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "updates" && (
              <motion.div 
                key="updates"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-vastu-green"><Upload size={18} /></div>
                  <h3 className="text-lg font-medium tracking-tight">Upload to Gallery</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-3xl border border-border bg-secondary/10 flex flex-col items-center justify-center text-center space-y-4 hover:bg-secondary/20 transition-all">
                     <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"><ImageIcon size={24} /></div>
                     <input type="file" accept="image/*,video/mp4" className="hidden" id="modal-upload" onChange={async (e) => { 
                       const file = e.target.files?.[0]; 
                       if(!file) return; 
                       
                       // 80MB size limit check
                       const MAX_SIZE = 80 * 1024 * 1024;
                       if (file.size > MAX_SIZE) {
                         alert("File is too large. Max size is 80MB.");
                         e.target.value = '';
                         return;
                       }

                       setSaving("uploading"); 
                       await addSiteUpdate(project!.id, file, blogData?.gallery_updates || []); 
                       setSaving(null); haptic.confirm(); loadBlogData(); 
                     }} />
                     <button onClick={() => document.getElementById('modal-upload')?.click()} className="btn-vercel h-10 px-6 text-[10px]">{saving === "uploading" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}Upload Image/MP4</button>
                  </div>

                  <div className="p-8 rounded-3xl border border-border bg-secondary/10 flex flex-col items-center justify-center text-center space-y-4 hover:bg-secondary/20 transition-all">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-red-500/80"><Video size={24} /></div>
                     <div className="w-full flex gap-2">
                       <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="Paste YouTube URl here..." className="flex-1 px-4 py-2 rounded-xl bg-background border border-border text-xs outline-none focus:border-vastu-green/50" />
                       <button onClick={handleAddYoutube} disabled={!!saving || !youtubeUrl} className="btn-vercel h-10 px-4 text-[10px] whitespace-nowrap">{saving === "youtube" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}Add Link</button>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  {(blogData?.gallery_updates || []).map((u: any, i: number) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group bg-secondary/30 flex items-center justify-center">
                       {u.media_type === "image" ? (
                         <img src={u.media_url} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           {u.thumbnail_url ? (
                             <img src={u.thumbnail_url} className="w-full h-full object-cover opacity-60" />
                           ) : (
                             <Video size={24} className="text-muted-foreground/30" />
                           )}
                           
                           {/* Custom Thumbnail Upload Trigger */}
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm z-10 cursor-pointer" onClick={() => document.getElementById(`thumb-upload-${i}`)?.click()}>
                             <div className="flex flex-col items-center justify-center text-white/80 hover:text-white transition-colors">
                               <ImageIcon size={16} className="mb-1" />
                               <span className="text-[8px] font-bold uppercase tracking-widest">{u.thumbnail_url ? "Replace Thumb" : "Set Thumb"}</span>
                             </div>
                           </div>
                           <input type="file" accept="image/*" className="hidden" id={`thumb-upload-${i}`} onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if(!file) return;
                             setSaving("uploading");
                             const { error } = await setSiteUpdateThumbnail(project!.id, i, file, blogData?.gallery_updates || []);
                             setSaving(null);
                             if(!error) { haptic.confirm(); loadBlogData(); } else alert(error);
                           }} />
                           
                           <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[8px] font-bold text-white uppercase tracking-widest pointer-events-none z-20">
                             {u.media_type}
                           </div>
                         </>
                       )}
                       <button onClick={async (e) => { e.stopPropagation(); haptic.error(); await deleteSiteUpdate(project!.id, u.media_url, blogData?.gallery_updates || []); loadBlogData(); }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
