"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import type { Project } from "@/data/projects";

export type LightboxProject = Project & { index: number };

interface ProjectLightboxProps {
  project: LightboxProject | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function ProjectLightbox({ project, onClose, onNext, onPrev }: ProjectLightboxProps) {
  const router = useRouter();

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
          transition={{ duration: 0.75, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Panel – slide up from bottom */}
          <motion.div
            className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 sm:px-10"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
          >
            {/* Ảnh ở đúng trung tâm màn hình */}
            <div
              className="relative w-full max-w-3xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.18 }}
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

            {/* Nội dung dưới ảnh, cùng bề rộng với ảnh */}
            <div className="pointer-events-none mt-3 sm:mt-5 flex w-full justify-center">
              <div className="pointer-events-auto w-full max-w-3xl flex flex-col sm:flex-row items-start justify-between gap-8 text-[10px] sm:text-[11px] font-oswald tracking-[0.2em]">
                {/* Cột meta bên trái với A/B/C/D – map thẳng từ data */}
                <motion.div
                  className="flex w-full items-center md:items-start flex-col gap-1 text-[9px] sm:text-[10px] uppercase"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.42 }}
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
                  className="flex w-full items-center md:items-end flex-col gap-2 text-right text-[9px] sm:text-[10px]"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.52 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="uppercase opacity-70 tracking-[0.22em]">
                    {project.location}
                  </div>
                  {/* <h2 className="text-base sm:text-lg md:text-xl font-light tracking-[0.18em] uppercase">
                    {project.title}
                  </h2> */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="max-w-xs leading-relaxed tracking-[0.12em] text-muted-foreground/90 line-clamp-3 cursor-default">
                        {project.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      hideArrow
                      className="max-w-sm px-3 py-2 text-[10px] font-light leading-relaxed tracking-[0.06em] text-background/95 text-left whitespace-pre-wrap"
                    >
                      {project.description}
                    </TooltipContent>
                  </Tooltip>
                  <div className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-[0.22em] opacity-60">
                    Photographer · {project.photographer}
                  </div>
                  <motion.button
                    type="button"
                    className="mt-2 cursor-pointer inline-flex items-center gap-2 border-b border-current pb-0.5 text-[10px] sm:text-[11px] uppercase tracking-[0.26em]"
                    onClick={() => router.push(`/${project.slug}`)}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ x: 4, opacity: 0.8 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1], delay: 0.65 }}
                  >
                    <span>View detail album</span>
                    <motion.span
                      className="text-base leading-none"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 90 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      +
                    </motion.span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

