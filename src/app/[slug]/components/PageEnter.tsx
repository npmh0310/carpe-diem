"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageEnterProps {
  children: ReactNode;
}

export function PageEnter({ children }: PageEnterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

