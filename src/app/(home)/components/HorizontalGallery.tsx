"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { PROJECTS } from "@/data/projects";
import { ProjectSlice } from "./ProjectSlice";

export const HorizontalGallery = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Add smooth physics to the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  // Map vertical scroll (0 to 1) to horizontal translation
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-75%"]);

  const totalItems = PROJECTS.length * 2;

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
              progress={smoothProgress}
            />
          ))}
          {/* Duplicate for infinite feel or just extra length */}
          {PROJECTS.map((project, index) => (
            <ProjectSlice
              key={`duplicate-${index}`}
              {...project}
              index={index + PROJECTS.length}
              total={totalItems}
              progress={smoothProgress}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
