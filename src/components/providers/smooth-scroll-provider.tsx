"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";

type LenisInstance = InstanceType<typeof Lenis>;

const LenisContext = createContext<LenisInstance | null>(null);

export const useLenis = () => useContext(LenisContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const [lenis, setLenis] = useState<LenisInstance | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
      // Cho phép gesture ngang cũng đẩy vertical scroll
      gestureOrientation: "both",
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    setLenis(instance);

    let frameId: number;

    const raf = (time: number) => {
      instance.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
};

