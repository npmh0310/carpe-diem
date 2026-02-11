import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { getProjectBySlug } from "@/lib/projects";
import { Logo } from "@/components/common/Logo";
import { MaskText } from "@/components/common/MaskText";
import { ImageGallery } from "./components/ImageGallery";
import { PageEnter } from "./components/PageEnter";

type ProjectSlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectSlugPage({ params }: ProjectSlugPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

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

  const paragraphs = project.description
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasMultipleParagraphs = paragraphs.length > 1;
  const descriptionBlocks = hasMultipleParagraphs ? paragraphs : [project.description];

  const startLabel = new Date(project.startDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const endLabel = new Date(project.endDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const dateRange =
    startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  const filmLabel = project.framesCount
    ? `${project.filmName} · ${project.framesCount} frames`
    : project.filmName;

  const leftMeta = [
    { label: "Camera", value: project.camera },
    { label: "Film", value: filmLabel },
    { label: "Lab", value: project.lab },
  ];

  const rightMeta = [
    { label: "Location", value: project.location },
    { label: "Dates", value: dateRange },
    { label: "Photographer", value: project.photographer },
  ];

  return (
    <main className="min-h-screen flex flex-col text-foreground  ">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-8 pb-6 sm:pb-10">
        <Link href="/" className="pointer-events-auto">
          <Logo className="text-3xl" />
        </Link>
        <div className="flex items-center gap-6 text-[10px] sm:text-xs font-oswald uppercase tracking-[0.28em]">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <MaskText>Back to gallery</MaskText>
          </Link>
        </div>
      </header>

      <PageEnter>
        {/* Nội dung album: title + description nhỏ + meta 2 cột – nền sáng */}
        <section className="flex-1 px-4 sm:px-8 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-semibold uppercase tracking-[0.12em] text-foreground">
              {project.title}
            </h1>

            {/* Description nhỏ dưới title – cùng font với meta (Oswald) */}
            <div className="mt-6 sm:mt-8 text-center font-oswald text-[11px] sm:text-[12px] leading-relaxed text-foreground/80 max-w-2xl mx-auto normal-case tracking-[0.16em]">
              {descriptionBlocks.map((block, i) => (
                <p key={i} className={i > 0 ? "mt-4" : ""}>
                  {block}
                </p>
              ))}
            </div>

            {/* Meta 2 cột: trái (máy/film/lab), phải (địa điểm/người chụp) */}
            {/* <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0"> */}
              {/* Cột trái: Dates, Camera, Film, Lab */}
              {/* <dl className="grid grid-cols-[7rem_1fr] gap-x-6 gap-y-0 font-oswald text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">
                {leftMeta.map(({ label, value }) => (
                  <Fragment key={label}>
                    <dt className="pt-3 border-b border-foreground/10 pb-2 text-foreground/55">
                      {label}
                    </dt>
                    <dd className="pt-3 border-b border-foreground/10 pb-2 text-foreground/90">
                      {value}
                    </dd>
                  </Fragment>
                ))}
              </dl> */}

              {/* Cột phải: Location, Photographer */}
              {/* <dl className="grid grid-cols-[7rem_1fr] gap-x-6 gap-y-0 font-oswald text-[10px] sm:text-[11px] uppercase tracking-[0.2em] md:mt-0 mt-6">
                {rightMeta.map(({ label, value }) => (
                  <Fragment key={label}>
                    <dt className="pt-3 border-b border-foreground/10 pb-2 text-foreground/55">
                      {label}
                    </dt>
                    <dd className="pt-3 border-b border-foreground/10 pb-2 text-foreground/90">
                      {value}
                    </dd>
                  </Fragment>
                ))}
              </dl> */}
            {/* </div> */}
          </div>
        </section>

        {/* Gallery: ảnh phía dưới */}
        {project.images && project.images.length > 0 ? (
          <ImageGallery images={project.images} alt={project.title} />
        ) : (
          <section className="bg-black">
            <div className="relative w-full aspect-4/3 sm:aspect-video overflow-hidden">
              <Image
                src={project.src}
                alt={project.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          </section>
        )}
      </PageEnter>
    </main>
  );
}

