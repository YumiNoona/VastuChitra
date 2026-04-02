"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getProjectByToken, Project, ProjectAuth } from "@/lib/supabase";
import ProjectDetail from "@/components/ProjectDetail";
import LaunchModal from "@/components/LaunchModal";


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
  const [launchProject, setLaunchProject] = useState<Project | null>(null);

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
  
  return (
    <>
      <ProjectDetail
        project={project!}
        onBack={() => {}}
        onLaunch={p => setLaunchProject(p)}
        hideBackButton
        isPrivate
      />
      <AnimatePresence>
        {launchProject && (
          <LaunchModal
            project={project!}
            privateToken={auth!.token}
            clientEmail={auth!.email || ""}
            onClose={() => setLaunchProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
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


