"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import type { ImageVariantSet } from "@/lib/image-variants";

interface ImageGalleryProps {
  images: ImageVariantSet[];
  alt: string;
}

const staggerDelay = 0.18;

/**
 * 3 columns, each column stacks vertically. col1 = 1,4,7… col2 = 2,5,8… col3 = 3,6,9…
 * items-start để tránh khoảng trắng khi số ảnh không chia hết cho 3.
 */
export function ImageGallery({ images, alt }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const columns = useMemo(() => {
    const cols: { index: number; image: ImageVariantSet }[][] = [[], [], []];
    images.forEach((image, index) => {
      cols[index % 3].push({ index, image });
    });
    return cols;
  }, [images]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeSrc = useMemo(
    () => (activeIndex === null ? null : images[activeIndex]?.full.url ?? null),
    [activeIndex, images]
  );
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
      <div className="px-6 sm:px-10 md:px-20 pt-8 sm:pt-12 pb-8 ">
        <div className="grid grid-cols-3 gap-3 items-start">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-3">
              {col.map(({ index, image }) => (
                <motion.div
                  key={index}
                  className="relative overflow-hidden group cursor-pointer"
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
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <Image
                    src={image.medium.url}
                    alt={`${alt} - Image ${index + 1}`}
                    width={1200}
                    height={1600}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </motion.div>
              ))}
            </div>
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
