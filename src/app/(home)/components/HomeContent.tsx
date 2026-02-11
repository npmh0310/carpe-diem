"use client";

import { useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { SocialLinks } from "./SocialLinks";
import { HorizontalGallery } from "./HorizontalGallery";
import { HeaderProjectTrack } from "./HeaderProjectTrack";
import { MaskText } from "@/components/common/MaskText";
import Link from "next/link";
import {
  ProjectLightbox,
  type LightboxProject,
} from "./ProjectLightbox";
import type { Project } from "@/data/projects";

interface HomeContentProps {
  projects: Project[];
}

export function HomeContent({ projects }: HomeContentProps) {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activeProject, setActiveProject] = useState<LightboxProject | null>(
    null
  );

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
    setActiveProject((current: LightboxProject | null) => {
      if (!current) return current;
      const currentIndex = current.index;
      const nextIndex = (currentIndex + 1) % projects.length;
      const nextProject = projects[nextIndex];
      return { ...nextProject, index: nextIndex };
    });
  };

  const handlePrevProject = () => {
    setActiveProject((current: LightboxProject | null) => {
      if (!current) return current;
      const currentIndex = current.index;
      const prevIndex =
        (currentIndex - 1 + projects.length) % projects.length;
      const prevProject = projects[prevIndex];
      return { ...prevProject, index: prevIndex };
    });
  };

  return (
    <main className="relative min-h-screen flex flex-col justify-between">
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
        <div className="pointer-events-none absolute inset-x-0 flex justify-center">
          <HeaderProjectTrack progress={smoothProgress} projects={projects} />
        </div>
      </header>

      <div className="flex-1 w-full">
        <HorizontalGallery
          targetRef={galleryRef}
          progress={smoothProgress}
          activeIndex={activeProject?.index ?? null}
          onOpenProject={setActiveProject}
          projects={projects}
        />
      </div>

      <footer className="fixed bottom-0 left-0 w-full z-20 flex justify-between items-end p-4 sm:p-8 pointer-events-none mix-blend-difference text-white">
        <div className="w-1/3"></div>
        <div className="pointer-events-auto">
          <SocialLinks />
        </div>
      </footer>

      <ProjectLightbox
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onNext={handleNextProject}
        onPrev={handlePrevProject}
      />
    </main>
  );
}
