"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  isOpen: boolean;
  src: string | null;
  alt: string;
  index: number | null;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ImageLightbox({ isOpen, src, alt, index, total, onClose, onNext, onPrev }: ImageLightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchEndX.current - touchStartX.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        onNext();
      } else {
        onPrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

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
              className="hidden sm:inline-flex absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full z-20"
            >
              <X />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="hidden sm:inline-flex absolute left-3 sm:left-4 rounded-full z-20"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="hidden sm:inline-flex absolute right-3 sm:right-4 rounded-full z-20"
            >
              <ChevronRight />
            </Button>

            <div
              className="relative w-[min(92vw,980px)] sm:w-[min(88vw,980px)] max-h-[82vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={src}
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={src}
                    alt={`${alt} - Image ${(index ?? 0) + 1} of ${total}`}
                    width={1600}
                    height={1200}
                    sizes="(max-width: 640px) 92vw, min(88vw, 980px)"
                    className="h-auto max-h-[82vh] w-full object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

