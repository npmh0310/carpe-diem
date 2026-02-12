"use client";

import { useRef, useCallback } from "react";
import type { RefObject } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import type { Project } from "@/data/projects";
import type { LightboxProject } from "./ProjectLightbox";
import { ProjectSlice } from "./ProjectSlice";

/** Số px swipe ngang ≈ 1 đơn vị scroll (viewport height) */
const SWIPE_TO_SCROLL_RATIO = 1.2;

interface HorizontalGalleryProps {
  targetRef: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  activeIndex?: number | null;
  onOpenProject?: (project: LightboxProject) => void;
  projects: Project[];
}

export const HorizontalGallery = ({
  targetRef,
  progress,
  activeIndex = null,
  onOpenProject,
  projects,
}: HorizontalGalleryProps) => {
  const x = useTransform(progress, [1, 0], ["-75%", "0%"]);
  const totalItems = projects.length;
  const touchStart = useRef<{ x: number; y: number; scrollY: number } | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (activeIndex != null) return;
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        scrollY: window.scrollY,
      };
      isHorizontalSwipe.current = null;
    },
    [activeIndex]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || activeIndex != null) return;
      const target = targetRef.current;
      if (!target) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStart.current.x;
      const deltaY = currentY - touchStart.current.y;

      if (isHorizontalSwipe.current === null) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
      if (!isHorizontalSwipe.current) return;

      e.preventDefault();
      const scrollRange = target.offsetHeight - window.innerHeight;
      if (scrollRange <= 0) return;
      const deltaScroll = -deltaX * SWIPE_TO_SCROLL_RATIO;
      let newScrollY = touchStart.current.scrollY + deltaScroll;
      const minScroll = target.offsetTop;
      const maxScroll = target.offsetTop + scrollRange;
      newScrollY = Math.max(minScroll, Math.min(maxScroll, newScrollY));
      window.scrollTo({ top: newScrollY, behavior: "auto" });
    },
    [activeIndex, targetRef]
  );

  const handleTouchEnd = useCallback(() => {
    touchStart.current = null;
    isHorizontalSwipe.current = null;
  }, []);

  return (
    <div ref={targetRef} className="relative h-[200vh] bg-background md:h-[300vh]">
      <div
        className="sticky top-0 h-screen flex items-center overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        <motion.div
          style={{ pointerEvents: activeIndex != null ? "none" : "auto" }}
          aria-hidden={activeIndex != null}
          className="will-change-transform"
        >
          <motion.div style={{ x }} className="flex gap-4 pl-[calc(50vw-7vh)] md:pl-[calc(50vw-9vh)]">
            {projects.map((project, index) => {
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
