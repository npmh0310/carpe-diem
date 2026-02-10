import Image from "next/image";
import Link from "next/link";
import { PROJECTS } from "@/data/projects";
import { Logo } from "@/components/common/Logo";
import { MaskText } from "@/components/common/MaskText";

type ProjectSlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectSlugPage({ params }: ProjectSlugPageProps) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <p className="font-oswald text-xs uppercase tracking-[0.3em] opacity-60">
          Project not found
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/80">
          Slug: <code className="px-1 py-0.5 rounded bg-muted text-xs">{slug}</code>
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 border-b border-current pb-0.5 text-[10px] uppercase tracking-[0.26em] hover:opacity-70 transition-opacity"
        >
          <span>Back to gallery</span>
        </Link>
      </main>
    );
  }

  const startLabel = new Date(project.startDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const endLabel = new Date(project.endDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const dateLabel =
    startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-8 pb-6 sm:pb-10">
        <Link href="/" className="pointer-events-auto">
          <Logo className="text-3xl" />
        </Link>

        <div className="flex items-center gap-6 text-[10px] sm:text-xs font-oswald uppercase tracking-[0.28em]">
          <Link
            href="/"
            className="hover:opacity-70 transition-opacity"
          >
            <MaskText>Back to gallery</MaskText>
          </Link>
        </div>
      </header>

      {/* Hero + meta */}
      <section className="flex-1 px-4 sm:px-8 pb-10 sm:pb-16">
        <div className="mx-auto max-w-5xl grid gap-10 sm:gap-14 md:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)] items-start">
          {/* Image */}
          <div className="relative w-full aspect-4/3 md:aspect-5/4 overflow-hidden ">
            <Image
              src={project.src}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6 md:gap-8 font-oswald text-[10px] sm:text-[11px] uppercase tracking-[0.22em]">
            <div className="mt-4 flex flex-wrap gap-4 text-[9px] sm:text-[10px] tracking-[0.24em]">
              <Link
                href="/"
                className="inline-flex items-center gap-2 border-b border-current pb-0.5 hover:opacity-70 transition-opacity"
              >
                <span>Back to all projects</span>
                <span className="text-base leading-none">↲</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

