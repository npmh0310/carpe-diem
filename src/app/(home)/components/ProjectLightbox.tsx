"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Project } from "@/data/projects";

export type LightboxProject = Project & { index: number };

interface ProjectLightboxProps {
  project: LightboxProject | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function ProjectLightbox({ project, onClose, onNext, onPrev }: ProjectLightboxProps) {
  useEffect(() => {
    if (!project) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        onNext?.();
      }
      if (e.key === "ArrowLeft") {
        onPrev?.();
      }
    };

    const onWheel = () => {
      onClose();
    };

    const onTouchMove = () => {
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel);
    window.addEventListener("touchmove", onTouchMove);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
       window.removeEventListener("wheel", onWheel);
       window.removeEventListener("touchmove", onTouchMove);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose, onNext, onPrev]);

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
            <div className="relative w-full max-w-3xl flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full aspect-video overflow-hidden"
                >
                  <Image
                    src={project.src}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nội dung absolute dưới đáy, giống footer, cùng bề rộng với ảnh */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-10 flex justify-center">
              <div className="pointer-events-auto w-full max-w-3xl flex items-start justify-between gap-8 text-[10px] sm:text-[11px] font-oswald tracking-[0.2em]">
                {/* Cột meta bên trái với A/B/C/D – map thẳng từ data */}
                <motion.div
                  className="flex flex-col gap-1 text-[9px] sm:text-[10px] uppercase"
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
                >
                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <span className="opacity-60">A</span>
                    <span className="opacity-60">Dates</span>
                    <span className="opacity-90">
                      {new Date(project.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                      {" – "}
                      {new Date(project.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <span className="opacity-60">B</span>
                    <span className="opacity-60">Camera</span>
                    <span className="opacity-90">{project.camera}</span>
                  </div>
                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <span className="opacity-60">C</span>
                    <span className="opacity-60">Film</span>
                    <span className="opacity-90">
                      {project.filmName}
                      {project.framesCount ? ` · ${project.framesCount} frames` : ""}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <span className="opacity-60">D</span>
                    <span className="opacity-60">Lab</span>
                    <span className="opacity-90">{project.lab}</span>
                  </div>
                </motion.div>

                {/* Cột phải: title + mô tả + nút view detail */}
                <motion.div
                  className="flex-1 flex flex-col items-end gap-2 text-right text-[9px] sm:text-[10px]"
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.26 }}
                >
                  <div className="uppercase opacity-70 tracking-[0.22em]">
                    {project.location}
                  </div>
                  {/* <h2 className="text-base sm:text-lg md:text-xl font-light tracking-[0.18em] uppercase">
                    {project.title}
                  </h2> */}
                  <p className="max-w-xs leading-relaxed tracking-[0.12em] text-muted-foreground/90">
                    {project.description}
                  </p>
                  <div className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-[0.22em] opacity-60">
                    Photographer · {project.photographer}
                  </div>
                  <motion.button
                    type="button"
                    className="mt-2 inline-flex items-center gap-2 border-b border-current pb-0.5 text-[10px] sm:text-[11px] uppercase tracking-[0.26em] hover:opacity-70 transition-opacity"
                    onClick={() => onNext?.()}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.34 }}
                  >
                    <span>View detail album</span>
                    <span className="text-base leading-none">+</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

