import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { getSiteUrl } from "@/lib/site-url";
import { Logo } from "@/components/common/Logo";
import { MaskText } from "@/components/common/MaskText";
import { ImageGallery } from "./components/ImageGallery";
import { PageEnter } from "./components/PageEnter";

type ProjectSlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProjectSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/${slug}`;
  const description = project.description.slice(0, 155);
  const ogImage = project.cover.medium.url;
  const dateRange = (() => {
    const start = new Date(project.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const end = new Date(project.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return start === end ? start : `${start} – ${end}`;
  })();

  return {
    title: project.title,
    description,
    keywords: [
      project.title,
      project.filmName,
      project.camera,
      project.location,
      "film photography",
      "analog",
      "Nguyen Phuoc Minh Hieu",
    ],
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description,
      url,
      type: "article",
      publishedTime: project.startDate,
      modifiedTime: project.endDate,
      authors: ["Nguyen Phuoc Minh Hieu"],
      tags: [project.filmName, project.camera, project.location, "film photography"],
      images: [
        {
          url: ogImage,
          width: 1600,
          height: 1067,
          alt: `${project.title} — ${dateRange} — ${project.location}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectSlugPage({ params }: ProjectSlugPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <p className=" text-xs uppercase tracking-[0.3em] opacity-60">
          Project not found
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/80">
          Slug: <code className="px-1 py-0.5 rounded bg-muted text-xs">{slug}</code>
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 border-b border-current pb-0.5 text-[10px] font-anton uppercase tracking-[0.26em] hover:opacity-70 transition-opacity"
        >
          <MaskText>Back to gallery</MaskText>
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

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${project.slug}`;
  const allImages = project.images ?? [project.cover];
  const photoAlbumJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: project.title,
    description: project.description,
    url: pageUrl,
    dateCreated: project.startDate,
    dateModified: project.endDate,
    locationCreated: {
      "@type": "Place",
      name: project.location,
    },
    author: {
      "@type": "Person",
      name: project.photographer,
      url: siteUrl,
    },
    image: allImages.map((img) => ({
      "@type": "ImageObject",
      contentUrl: img.full.url,
      thumbnailUrl: img.small.url,
      description: `${project.title} — ${project.location}`,
    })),
    keywords: [project.filmName, project.camera, project.location, "film photography"].join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(photoAlbumJsonLd) }}
      />
    <main className="min-h-screen flex flex-col text-foreground  ">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-8 pb-6 sm:pb-10">
        <Link href="/" className="pointer-events-auto">
          <Logo className="text-3xl" />
        </Link>
        <div className="flex items-center gap-6 text-[10px] sm:text-xs font-anton uppercase tracking-[0.28em]">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <MaskText>Back to gallery</MaskText>
          </Link>
        </div>
      </header>

      <PageEnter>
        {/* Nội dung album: title + description nhỏ + meta 2 cột – nền sáng */}
        <section className="flex-1 px-6 sm:px-8 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-anton text-center text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.12em] text-foreground">
              {project.title}
            </h1>

            {/* Description nhỏ dưới title */}
            <div className="mt-6 sm:mt-8 text-center text-[12px] sm:text-sm leading-relaxed text-foreground/75  max-w-2xl mx-auto font-light">
              {descriptionBlocks.map((block, i) => (
                <p key={i} className={i > 0 ? "mt-4" : ""}>
                  {block}
                </p>
              ))}
            </div>

            {/* Meta 2 cột: trái (máy/film/lab), phải (địa điểm/người chụp) */}
            {/* <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0"> */}
              {/* Cột trái: Dates, Camera, Film, Lab */}
              {/* <dl className="grid grid-cols-[7rem_1fr] gap-x-6 gap-y-0  text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">
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
              {/* <dl className="grid grid-cols-[7rem_1fr] gap-x-6 gap-y-0  text-[10px] sm:text-[11px] uppercase tracking-[0.2em] md:mt-0 mt-6">
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
                src={project.cover.medium.url}
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
    </>
  );
}

