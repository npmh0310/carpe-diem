"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";
import { useTheme } from "next-themes";

interface LoaderProps {
  onComplete?: () => void;
}

export const Loader = ({ onComplete }: LoaderProps) => {
  const countRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();

  useEffect(() => {
    const node = countRef.current;
    if (!node) return;

    // Animate number from 0 to 100
    const controls = animate(0, 100, {
      duration: 2,
      onUpdate: (latest) => {
        if (node) {
          node.textContent = Math.round(latest).toString();
        }
      },
      onComplete: () => {
        if (onComplete) {
          onComplete();
        }
      },
    });

    // Determine colors based on theme
    let startColor = "#fff";
    let endColor = "#000";

    if (theme === "dark") {
      startColor = "#000";
      endColor = "#fff";
    }

    // Animate color
    const colorControls = animate(startColor, endColor, {
      duration: 2,
      onUpdate: (latest) => {
        if (node) {
          node.style.color = latest;
        }
      },
    });

    return () => {
      controls.stop();
      colorControls.stop();
    };
  }, [onComplete, theme]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div ref={countRef} className="text-7xl tracking-tighter">
        0
      </div>
    </div>
  );
};
