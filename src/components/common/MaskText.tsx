"use client";

import { motion } from "framer-motion";

interface MaskTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export const MaskText = ({
  children,
  className = "",
  delay = 0,
}: MaskTextProps) => {
  const words = children.split(" ");

  const variants = {
    initial: { y: "101%" },
    animate: (i: number) => ({
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
        delay: delay + 0.1 * i,
      },
    }),
  };

  return (
    <div className={`relative overflow-hidden inline-flex flex-wrap gap-1 ${className}`}>
      {words.map((word, index) => (
        <div key={index} className="relative overflow-hidden">
          <motion.span
            custom={index}
            variants={variants}
            initial="initial"
            animate="animate"
            className="block"
          >
            {word}
          </motion.span>
        </div>
      ))}
    </div>
  );
};
