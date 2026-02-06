"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { MaskText } from "@/components/common/MaskText";

interface ProjectSliceProps {
  src: string;
  title: string;
  category: string;
  index: number;
  progress: MotionValue<number>;
}

export const ProjectSlice = ({
  src,
  title,
  category,
  index,
  progress,
}: ProjectSliceProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax effect: map global progress to local image movement
  const parallaxX = useTransform(progress, [0, 1], ["0%", "-20%"]);

  return (
    <div className="relative h-[45vh] w-[14vh] md:w-[18vh] min-w-[100px] shrink-0 overflow-hidden group">
      {/* Image Container with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="relative w-[140%] h-full"
          style={{ x: parallaxX }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </motion.div>
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-4 left-4 z-10 text-white mix-blend-difference">
        <div className="text-xs uppercase tracking-widest opacity-80 mb-1">
          {category}
        </div>
        <div className="text-2xl font-light uppercase tracking-tight">
          <MaskText>{title}</MaskText>
        </div>
      </div>
    </div>
  );
};
