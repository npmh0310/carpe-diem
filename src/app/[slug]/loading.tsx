import { Logo } from "@/components/common/Logo";
import { MaskText } from "@/components/common/MaskText";
import Link from "next/link";

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col text-foreground">
      {/* Top bar skeleton */}
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

      {/* Content skeleton */}
      <section className="flex-1 px-4 sm:px-8 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-6">
          {/* Title */}
          <div className="h-10 w-64 rounded bg-foreground/10 animate-pulse" />
          {/* Description lines */}
          <div className="flex flex-col items-center gap-2 w-full max-w-md">
            <div className="h-3 w-full rounded bg-foreground/8 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-foreground/8 animate-pulse" />
            <div className="h-3 w-4/6 rounded bg-foreground/8 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Image area skeleton */}
      <section className="px-4 sm:px-8 pb-16">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-3/2 rounded bg-foreground/8 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
