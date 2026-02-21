"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  isOpen: boolean;
  src: string | null;
  alt: string;
  index: number | null;
  total: number;
  nextSrc?: string | null;
  prevSrc?: string | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ImageLightbox({
  isOpen,
  src,
  alt,
  index,
  total,
  nextSrc,
  prevSrc,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {isOpen && src ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="relative z-10 flex h-full w-full items-center justify-center px-4 sm:px-10">
            {/* Nút đặt ở góc viewport, ngoài ảnh */}
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full z-20"
            >
              <X />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Previous image"
              onClick={onPrev}
              className="absolute  left-3 sm:left-4 rounded-full z-20"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Next image"
              onClick={onNext}
              className="absolute right-3 sm:right-4 rounded-full z-20"
            >
              <ChevronRight />
            </Button>

            <div className="relative w-[min(88vw,980px)] h-[min(82vh,820px)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence>
                <motion.div
                  key={src}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={src}
                    alt={`${alt} - Image ${(index ?? 0) + 1} of ${total}`}
                    fill
                    sizes="(max-width: 640px) 88vw, 980px"
                    className="object-contain"
                    priority
                    decoding="async"
                    quality={75}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {nextSrc && (
              <Image
                src={nextSrc}
                alt=""
                width={1600}
                height={2200}
                className="absolute size-px opacity-0 pointer-events-none"
                loading="eager"
                quality={75}
                decoding="async"
                aria-hidden
              />
            )}
            {prevSrc && (
              <Image
                src={prevSrc}
                alt=""
                width={1600}
                height={2200}
                className="absolute size-px opacity-0 pointer-events-none"
                loading="eager"
                quality={75}
                decoding="async"
                aria-hidden
              />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
