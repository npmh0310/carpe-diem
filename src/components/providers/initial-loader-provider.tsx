"use client";

import { useState } from "react";
import { GlobalLoading } from "@/components/layout/GlobalLoading";

interface InitialLoaderProviderProps {
  children: React.ReactNode;
}

export function InitialLoaderProvider({ children }: InitialLoaderProviderProps) {
  const [isDone, setIsDone] = useState(false);

  if (!isDone) {
    return <GlobalLoading onComplete={() => setIsDone(true)} />;
  }

  return <>{children}</>;
}


