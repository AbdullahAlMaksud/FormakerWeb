"use client";

import React, { useState, useEffect } from "react";
import { FormBuilderProvider } from "@/features/shadcn-formbuilder/context/form-builder-context";
import { SidebarLibrary } from "@/features/shadcn-formbuilder/components/sidebar-library";
import { BuilderCanvas } from "@/features/shadcn-formbuilder/components/builder-canvas";
import { PropertyInspector } from "@/features/shadcn-formbuilder/components/property-inspector";
import { CodeGenerator } from "@/features/shadcn-formbuilder/components/code-generator";
import { PreviewModal } from "@/features/shadcn-formbuilder/components/preview-modal";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Eye,
  Trash2,
  Settings,
  Code2,
  FileJson,
  Sun,
  Moon,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"properties" | "code">("properties");
  const [isDark, setIsDark] = useState(true);

  // Initialize and toggle theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCurrentlyDark = document.documentElement.classList.contains("dark");
      if (!isCurrentlyDark && !localStorage.getItem("theme_state")) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        const savedTheme = localStorage.getItem("theme_state");
        if (savedTheme === "light") {
          document.documentElement.classList.remove("dark");
          setIsDark(false);
        } else {
          document.documentElement.classList.add("dark");
          setIsDark(true);
        }
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextDark = !prev;
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme_state", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme_state", "light");
      }
      return nextDark;
    });
  };

  // Keyboard shortcut listener for key 'd'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === "d") {
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <FormBuilderProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col relative bg-glow-purple bg-glow-blue">

        {/* Floating Glowing Decorative Circles */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

        {/* HEADER BAR */}
        <header className="border-b border-border/80 bg-background/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-primary to-violet-600 shadow-md shadow-primary/20 flex items-center justify-center">
              <Logo className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-primary bg-clip-text text-transparent">
                  Formaker
                </h1>
                <span className="text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Shadcn UI
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Drag-and-drop form builder with automatic react-hook-form & Zod generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 border border-border/80 text-muted-foreground hover:text-foreground bg-transparent flex items-center justify-center rounded-lg"
              title="Toggle Theme (Press 'd')"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-violet-400" />
              )}
            </Button>

            {/* Live Preview Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 text-xs shadow-sm bg-transparent h-8"
            >
              <Eye className="h-4 w-4" />
              Live Preview
            </Button>
          </div>
        </header>

        {/* WORKSPACE CONTENT GRID */}
        <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 h-[calc(100vh-73px)] overflow-hidden">

          {/* Left Panel: Library */}
          <section className="w-full lg:w-[22%] xl:w-[20%] flex flex-col h-full bg-background/40 glass-panel p-4 rounded-xl border border-border/80 overflow-hidden">
            <SidebarLibrary />
          </section>

          {/* Center Panel: Canvas Workspace */}
          <section className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_#8b5cf6]" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Canvas Workspace
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Tip: Elements will highlight in purple when selected
              </p>
            </div>
            <BuilderCanvas />
          </section>

          {/* Right Panel: Settings / Code Generator Tabs */}
          <section className="w-full lg:w-[28%] xl:w-[25%] flex flex-col h-full bg-background/40 glass-panel rounded-xl border border-border/80 overflow-hidden">

            {/* Tabs Header */}
            <div className="flex border-b border-border/85 bg-secondary/15">
              <button
                type="button"
                onClick={() => setActiveTab("properties")}
                className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "properties"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/25"
                  }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Properties
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "code"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/25"
                  }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                React Code
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-5 overflow-hidden">
              {activeTab === "properties" ? (
                <PropertyInspector />
              ) : (
                <CodeGenerator />
              )}
            </div>
          </section>
        </main>

        {/* Live Interactive Preview Modal */}
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      </div>
    </FormBuilderProvider>
  );
}
