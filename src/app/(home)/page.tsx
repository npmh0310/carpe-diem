"use client";

import { useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";
import { Loader } from "./components/Loader";
import { Logo } from "@/components/common/Logo";
import { SocialLinks } from "./components/SocialLinks";
import { HorizontalGallery } from "./components/HorizontalGallery";
import { HeaderProjectTrack } from "./components/HeaderProjectTrack";
import { MaskText } from "@/components/common/MaskText";
import Link from "next/link";
import { ProjectLightbox, type LightboxProject } from "./components/ProjectLightbox";
import { PROJECTS } from "@/data/projects";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <Loader onComplete={() => setIsLoading(false)} />;
  }

  return <HomeContent />;
}

function HomeContent() {
  // Scroll progress của HorizontalGallery (dùng chung cho header + gallery)
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activeProject, setActiveProject] = useState<LightboxProject | null>(null);

  const { scrollYProgress } = useScroll({
    target: galleryRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  const handleNextProject = () => {
    setActiveProject((current) => {
      if (!current) return current;

      const currentIndex = current.index;
      const nextIndex = (currentIndex + 1) % PROJECTS.length;
      const nextProject = PROJECTS[nextIndex];

      return { ...nextProject, index: nextIndex };
    });
  };

  const handlePrevProject = () => {
    setActiveProject((current) => {
      if (!current) return current;

      const currentIndex = current.index;
      const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
      const prevProject = PROJECTS[prevIndex];

      return { ...prevProject, index: prevIndex };
    });
  };

  return (
    <main className="relative min-h-screen flex flex-col justify-between">
      {/* Top Row */}
      <header className="fixed top-0 left-0 w-full z-20 flex items-center justify-between p-4 sm:p-8 pointer-events-none mix-blend-difference text-white">
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

        {/* Center progress bar: luôn giữa viewport, độc lập 2 bên */}
        <div className="pointer-events-none absolute inset-x-0 flex justify-center">
          <HeaderProjectTrack progress={smoothProgress} />
        </div>
      </header>

      {/* Horizontal Scroll Gallery */}
      <div className="flex-1 w-full">
        <HorizontalGallery
          targetRef={galleryRef}
          progress={smoothProgress}
          activeIndex={activeProject?.index ?? null}
          onOpenProject={setActiveProject}
        />
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

      {/* Full image overlay */}
      <ProjectLightbox
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onNext={handleNextProject}
        onPrev={handlePrevProject}
      />
    </main>
  );
}
