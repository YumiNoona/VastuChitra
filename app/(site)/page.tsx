"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import ProjectDetail from "@/components/ProjectDetail";
import LaunchModal from "@/components/LaunchModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase, type Project } from "@/lib/supabase";

export default function Home() {
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [launchProject, setLaunchProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    if (projectId) {
      supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()
        .then(({ data }) => {
          if (data) setDetailProject(data as Project);
        });
    }
  }, []);

  const handleBack = () => {
    setDetailProject(null);
    if (window.history.pushState) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
    setTimeout(() => {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isLoading && (
          <div key="content">
            <AnimatePresence mode="wait">
              {detailProject ? (
                <ProjectDetail
                  key={detailProject.id}
                  project={detailProject}
                  onBack={handleBack}
                  onLaunch={p => setLaunchProject(p)}
                />
              ) : (
                <main key="main" className="relative min-h-screen overflow-x-hidden">
                  <BackgroundCanvas />
                  <div className="relative z-[1]">
                    <Navbar />
                    <Hero />
                    <ProjectGrid onSelectProject={p => setDetailProject(p)} />
                    <Contact />
                    <Footer />
                  </div>
                </main>
              )}
            </AnimatePresence>

            {launchProject && (
              <LaunchModal project={launchProject} onClose={() => setLaunchProject(null)} />
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
