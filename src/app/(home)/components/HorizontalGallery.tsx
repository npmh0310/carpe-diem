"use client";

import type { RefObject } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import { PROJECTS } from "@/data/projects";
import { ProjectSlice } from "./ProjectSlice";

interface HorizontalGalleryProps {
  targetRef: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
}

export const HorizontalGallery = ({ targetRef, progress }: HorizontalGalleryProps) => {
  // Map vertical scroll (0 to 1) to horizontal translation
  const x = useTransform(progress, [0, 1], ["0%", "-75%"]);

  // Tổng số project duy nhất – đồng bộ với HeaderProjectTrack
  const totalItems = PROJECTS.length;

  return (
    <div ref={targetRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex gap-4 pl-[calc(50vw-7vh)] md:pl-[calc(50vw-9vh)]"
        >
          {PROJECTS.map((project, index) => (
            <ProjectSlice
              key={index}
              {...project}
              index={index}
              total={totalItems}
              progress={progress}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
