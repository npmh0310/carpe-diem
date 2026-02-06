"use client";

import { useState } from "react";
import { Loader } from "./components/Loader";
import { Logo } from "@/components/common/Logo";
import { SocialLinks } from "./components/SocialLinks";
import { MaskText } from "@/components/common/MaskText";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <Loader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <main className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 overflow-hidden">
      {/* Top Row */}
      <header className="flex justify-between items-center w-full z-10">
        <Logo className="text-3xl" />
        <Link
          href="/about"
          className="uppercase text-xs  tracking-widest hover:opacity-60 transition-opacity"
        >
          <MaskText>About</MaskText>
        </Link>
      </header>

      {/* Center Content Placeholder */}
      <div className="flex-1 flex items-center justify-center">
        {/* Main content can go here in the future */}
      </div>

      {/* Bottom Row */}
      <footer className="flex justify-between items-end w-full z-10">
        {/* Bottom Left - Empty for now */}
        <div className="w-1/3"></div>

        {/* Bottom Right - Socials */}
        <SocialLinks />
      </footer>
    </main>
  );
}
