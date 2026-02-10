"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Project } from "@/data/projects";

export type LightboxProject = Project & { index: number };

interface ProjectLightboxProps {
  project: LightboxProject | null;
  onClose: () => void;
}

export function ProjectLightbox({ project, onClose }: ProjectLightboxProps) {
  useEffect(() => {
    if (!project) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="fixed inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop - trong suốt, chỉ dùng để detect click đóng */}
          <motion.button
            type="button"
            aria-label="Close image preview"
            className="absolute inset-0 bg-transparent"
            onClick={onClose}
          />

          {/* Panel */}
          <div className="relative z-10 flex h-full w-full items-center justify-center px-4 sm:px-10">
            {/* Ảnh ở đúng trung tâm màn hình */}
            <motion.div
              className="relative w-full max-w-3xl flex items-center justify-center"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <Image src={project.src} alt={project.title} fill className="object-cover" sizes="100vw" priority />
              </div>
            </motion.div>

            {/* Nội dung absolute dưới đáy, giống footer, cùng bề rộng với ảnh */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 sm:bottom-6 flex justify-center">
              <div className="pointer-events-auto w-full max-w-3xl flex flex-col sm:flex-row justify-between gap-6 text-[11px] sm:text-xs">
                {/* Giới thiệu sơ project */}
                <div className="flex-1 space-y-2">
                  <div className="uppercase text-[10px] tracking-[0.25em] opacity-70">
                    {project.location}
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-light tracking-[0.18em] uppercase">
                    {project.title}
                  </h2>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] opacity-70">
                    {project.filmStock} · {project.camera}
                  </div>
                  <p className="max-w-md text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>

                {/* Meta + action */}
                <div className="flex flex-col items-start sm:items-end gap-3 text-[10px] sm:text-[11px]">
                  <div className="space-y-1 tracking-[0.16em] uppercase text-foreground/70">
                    <div className="flex gap-3 sm:gap-6">
                      <span className="opacity-60">A</span>
                      <span className="opacity-60">Film</span>
                      <span className="opacity-90">
                        {project.filmStock}
                      </span>
                    </div>
                    <div className="flex gap-3 sm:gap-6">
                      <span className="opacity-60">B</span>
                      <span className="opacity-60">Date</span>
                      <span className="opacity-90">
                        {new Date(project.shotDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex gap-3 sm:gap-6">
                      <span className="opacity-60">C</span>
                      <span className="opacity-60">Location</span>
                      <span className="opacity-90">
                        {project.location}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-3 border-t border-foreground/25 pt-3 text-[11px] sm:text-xs uppercase tracking-[0.22em] hover:opacity-70 transition-opacity"
                  >
                    <span>View full image series</span>
                    <span className="text-lg leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

