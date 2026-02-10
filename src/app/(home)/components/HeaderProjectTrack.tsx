"use client";

import { useMemo } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { PROJECTS } from "@/data/projects";

interface HeaderProjectTrackProps {
  progress: MotionValue<number>;
}

export const HeaderProjectTrack = ({ progress }: HeaderProjectTrackProps) => {
  const projectsCount = PROJECTS.length;

  const indices = useMemo(
    () => Array.from({ length: projectsCount }, (_, i) => i),
    [projectsCount]
  );

  // Activity dựa theo vận tốc scroll, giống ProjectSlice – dừng scroll thì activity → 0
  const velocity = useVelocity(progress);
  const velocitySpring = useSpring(velocity, {
    mass: 0.6,
    stiffness: 90,
    damping: 40,
    restDelta: 0.0005,
  });
  const activity = useTransform(velocitySpring, (v) => {
    const raw = Math.min(1, Math.abs(v) * 8);
    return raw < 0.02 ? 0 : raw;
  });

  // Mỗi cột có scaleY riêng dựa theo vị trí "focus" hiện tại + activity
  const bars = indices.map((index) =>
    useTransform([progress, activity], (values) => {
      const p = (values[0] ?? 0) as number;
      const a = (values[1] ?? 0) as number;

      if (projectsCount <= 1) return 1;
      const normalized = p * (projectsCount - 1);
      const dIndex = Math.abs(normalized - index);
      const sigma = 0.8;
      const falloff = Math.exp(-(dIndex * dIndex) / (2 * sigma * sigma)); // 0..1

      const base = 0.35; // khi không scroll: tất cả cột thấp đều nhau
      const extra = 0.65 * falloff * a; // khi scroll: cột gần "focus" cao hơn
      return base + extra;
    })
  );

  return (
    <div className="flex-1 flex justify-center">
      <div className="flex gap-[3px] sm:gap-[4px] h-[14px] sm:h-4 opacity-80">
        {bars.map((scaleY, index) => (
          <motion.div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={{ scaleY, transformOrigin: "bottom" }}
            className="w-px sm:w-[1.5px] bg-current"
          />
        ))}
      </div>
    </div>
  );
};

