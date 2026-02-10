"use client";

import type { RefObject } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import { PROJECTS } from "@/data/projects";
import type { LightboxProject } from "./ProjectLightbox";
import { ProjectSlice } from "./ProjectSlice";

interface HorizontalGalleryProps {
  targetRef: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  activeIndex?: number | null;
  onOpenProject?: (project: LightboxProject) => void;
}

export const HorizontalGallery = ({
  targetRef,
  progress,
  activeIndex = null,
  onOpenProject,
}: HorizontalGalleryProps) => {
  // Map vertical scroll (0 to 1) to horizontal translation
  const x = useTransform(progress, [0, 1], ["0%", "-75%"]);

  // Tổng số project duy nhất – đồng bộ với HeaderProjectTrack
  const totalItems = PROJECTS.length;

  return (
    <div ref={targetRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div
          style={{ pointerEvents: activeIndex != null ? "none" : "auto" }}
          aria-hidden={activeIndex != null}
          className="will-change-transform"
        >
          <motion.div style={{ x }} className="flex gap-4 pl-[calc(50vw-7vh)] md:pl-[calc(50vw-9vh)]">
            {PROJECTS.map((project, index) => {
              const isActive = activeIndex === index;
              const hasActive = activeIndex != null;

              const direction = !hasActive
                ? 0
                : index < (activeIndex as number)
                  ? -1
                  : index > (activeIndex as number)
                    ? 1
                    : 0;

              const distance = !hasActive ? 0 : Math.abs(index - (activeIndex as number));
              const shift = direction === 0 ? "0vw" : `${direction * (18 + distance * 4)}vw`;

              // Khi chưa có active (vừa vào page): slide từng card từ phải (20vw) vào, mờ -> rõ, blur -> sharp
              const initial = !hasActive
                ? { x: "20vw", opacity: 0, filter: "blur(16px)" }
                : undefined;

              const animate = !hasActive
                ? { x: "0vw", opacity: 1, filter: "blur(0px)" }
                : isActive
                  ? { x: "0vw", opacity: 0, filter: "blur(6px)" }
                  : { x: shift, opacity: 0, filter: "blur(10px)" };

              const delay = !hasActive
                ? index * 0.12 // stagger từng card khi vào
                : Math.min(0.35, distance * 0.05);

              const duration = !hasActive ? 1.6 : 1.1;

              return (
                <motion.div
                  key={index}
                  initial={initial}
                  animate={animate}
                  transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
                  style={{ willChange: "transform, opacity, filter" }}
                  className="shrink-0"
                >
                  <ProjectSlice
                    project={project}
                    index={index}
                    total={totalItems}
                    progress={progress}
                    onOpen={(p, idx) => onOpenProject?.({ ...p, index: idx })}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
