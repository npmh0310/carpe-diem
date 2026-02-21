"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOptimizedImageUrl } from "@/lib/image";
import { ImageLightbox } from "./ImageLightbox";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const galleryImages = useMemo(() => images ?? [], [images]);
  const gridImages = useMemo(
    () => galleryImages.map((src) => getOptimizedImageUrl(src, "grid")),
    [galleryImages]
  );
  const lightboxImages = useMemo(
    () => galleryImages.map((src) => getOptimizedImageUrl(src, "lightbox")),
    [galleryImages]
  );
  const hasImages = galleryImages.length > 0;

  const baseDelay = 0.03;
  const maxAnimatedItems = 10;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeSrc = useMemo(
    () => (activeIndex === null ? null : lightboxImages[activeIndex] ?? null),
    [activeIndex, lightboxImages]
  );
  const nextSrc = useMemo(() => {
    if (activeIndex === null || lightboxImages.length === 0) return null;
    return lightboxImages[(activeIndex + 1) % lightboxImages.length] ?? null;
  }, [activeIndex, lightboxImages]);
  const prevSrc = useMemo(() => {
    if (activeIndex === null || lightboxImages.length === 0) return null;
    return (
      lightboxImages[(activeIndex - 1 + lightboxImages.length) % lightboxImages.length] ?? null
    );
  }, [activeIndex, lightboxImages]);
  const isOpen = activeIndex !== null && activeSrc !== null;

  const close = useCallback(() => setActiveIndex(null), []);
  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current + 1) % galleryImages.length;
    });
  }, [galleryImages.length]);
  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current - 1 + galleryImages.length) % galleryImages.length;
    });
  }, [galleryImages.length]);

  useEffect(() => {
    if (activeIndex === null || lightboxImages.length <= 1) return;

    const prefetchOffsets = [1, -1];
    prefetchOffsets.forEach((offset) => {
      const targetIndex =
        (activeIndex + offset + lightboxImages.length) % lightboxImages.length;
      const prefetchSrc = lightboxImages[targetIndex];
      if (!prefetchSrc) return;
      const img = new window.Image();
      img.decoding = "async";
      img.src = prefetchSrc;
    });
  }, [activeIndex, lightboxImages]);

  if (!hasImages) return null;

  return (
    <section className="">
      <div className="px-12 sm:px-16 md:px-20 pt-8 sm:pt-12 pb-0 sm:pb-0">
        {/* Masonry-style: 1/2/3 cột, ảnh bám sát nhau, không gap dọc lớn */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-2 sm:gap-3 md:gap-4">
          {gridImages.map((src, index) => (
            <motion.div
              key={index}
              className="relative mb-2 sm:mb-3 md:mb-4 overflow-hidden group cursor-pointer break-inside-avoid-column"
              style={{
                willChange: "transform, opacity",
                contentVisibility: "auto",
                containIntrinsicSize: "600px 800px",
              }}
              initial={{ opacity: 0, y: 14, scale: 0.992 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: Math.min(index, maxAnimatedItems) * baseDelay,
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open image ${index + 1} of ${galleryImages.length}`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveIndex(index);
                }
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src={src}
                alt={`${alt} - Image ${index + 1}`}
                width={1200}
                height={1600}
                className="w-full h-auto object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                loading={index < 2 ? "eager" : "lazy"}
                quality={75}
                decoding="async"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <ImageLightbox
        isOpen={isOpen}
        src={activeSrc}
        alt={alt}
        index={activeIndex}
        total={galleryImages.length}
        nextSrc={nextSrc}
        prevSrc={prevSrc}
        onClose={close}
        onNext={goNext}
        onPrev={goPrev}
      />
    </section>
  );
}
