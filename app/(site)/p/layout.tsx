"use client";

import { ThemeProvider } from "@/components/ThemeProvider";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      storageKey="vastu-project-theme"
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}
