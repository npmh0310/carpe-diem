"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { ImageLightbox } from "./ImageLightbox";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const staggerDelay = 0.18;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeSrc = useMemo(() => (activeIndex === null ? null : images[activeIndex] ?? null), [activeIndex, images]);
  const isOpen = activeIndex !== null && activeSrc !== null;

  const close = useCallback(() => setActiveIndex(null), []);
  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current + 1) % images.length;
    });
  }, [images.length]);
  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  return (
    <section className="">
      <div className="px-12 sm:px-16 md:px-20 pt-8 sm:pt-12 pb-0 sm:pb-0">
        {/* Masonry-style: 1/2/3 cột, ảnh bám sát nhau, không gap dọc lớn */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-2 sm:gap-3 md:gap-4">
          {images.map((src, index) => (
            <motion.div
              key={index}
              className="relative mb-2 sm:mb-3 md:mb-4 overflow-hidden group cursor-pointer break-inside-avoid-column"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 14, scale: 0.992 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: index * staggerDelay,
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open image ${index + 1} of ${images.length}`}
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
                loading={index < 6 ? "eager" : "lazy"}
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
        total={images.length}
        onClose={close}
        onNext={goNext}
        onPrev={goPrev}
      />
    </section>
  );
}
