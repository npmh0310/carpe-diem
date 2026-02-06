"use client";

import { useState } from "react";
import { Loader } from "./components/Loader";
import { Logo } from "@/components/common/Logo";
import { SocialLinks } from "./components/SocialLinks";
import { HorizontalGallery } from "./components/HorizontalGallery";
import { MaskText } from "@/components/common/MaskText";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <Loader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <main className="relative min-h-screen flex flex-col justify-between">
      {/* Top Row */}
      <header className="fixed top-0 left-0 w-full z-20 flex justify-between items-center p-4 sm:p-8 pointer-events-none mix-blend-difference text-white">
        <div className="pointer-events-auto">
          <Logo className="text-3xl" />
        </div>
        <div className="pointer-events-auto">
          <Link
            href="/about"
            className="uppercase text-xs tracking-widest hover:opacity-60 transition-opacity"
          >
            <MaskText>About</MaskText>
          </Link>
        </div>
      </header>

      {/* Horizontal Scroll Gallery */}
      <div className="flex-1 w-full">
        <HorizontalGallery />
      </div>

      {/* Bottom Row */}
      <footer className="fixed bottom-0 left-0 w-full z-20 flex justify-between items-end p-4 sm:p-8 pointer-events-none mix-blend-difference text-white">
        {/* Bottom Left - Empty for now */}
        <div className="w-1/3"></div>

        {/* Bottom Right - Socials */}
        <div className="pointer-events-auto">
          <SocialLinks />
        </div>
      </footer>
    </main>
  );
}
