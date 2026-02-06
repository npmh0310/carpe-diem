"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimation, Variants, HTMLMotionProps } from "framer-motion";
import React, { useEffect } from "react";

interface LogoProps extends HTMLMotionProps<"div"> {
  className?: string;
}

export const Logo = ({ className, ...props }: LogoProps) => {
  const text = "carpediem";
  const controls = useAnimation();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const handleMouseEnter = () => {
    controls.set("hidden");
    controls.start("visible");
  };

  return (
    <motion.div
      className={cn(
        "uppercase tracking-tighter cursor-pointer select-none inline-flex",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      initial="visible"
      animate={controls}
      variants={containerVariants}
      {...props}
    >
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={childVariants}>
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};
